'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, TestTube } from 'lucide-react';

export function VapiDebug() {
  const [checks, setChecks] = useState({
    vapiKey: false,
    microphone: false,
    https: false,
    browser: false
  });

  const [testResult, setTestResult] = useState<string>('');
  const [testing, setTesting] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<string>('');
  const [cleaning, setCleaning] = useState(false);
  const [micTestResult, setMicTestResult] = useState<string>('');
  const [testingMic, setTestingMic] = useState(false);

  useEffect(() => {
    // Check Vapi key
    const vapiKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    setChecks(prev => ({ ...prev, vapiKey: !!vapiKey }));

    // Check HTTPS
    const isHttps = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    setChecks(prev => ({ ...prev, https: isHttps }));

    // Check browser support
    const hasMediaDevices = !!navigator.mediaDevices;
    const hasGetUserMedia = !!navigator.mediaDevices?.getUserMedia;
    setChecks(prev => ({ ...prev, browser: hasMediaDevices && hasGetUserMedia }));

    // Check microphone permission
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        setChecks(prev => ({ ...prev, microphone: true }));
      })
      .catch(() => {
        setChecks(prev => ({ ...prev, microphone: false }));
      });
  }, []);

  const testAssistantCreation = async () => {
    setTesting(true);
    setTestResult('');
    
    try {
      const response = await fetch('/api/voice/test-assistant');
      const result = await response.json();
      
      if (response.ok) {
        setTestResult(`✅ Test successful! Assistant ID: ${result.assistant.id}`);
      } else {
        setTestResult(`❌ Test failed: ${result.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTesting(false);
    }
  };

  const cleanupAssistants = async () => {
    setCleaning(true);
    setCleanupResult('');
    
    try {
      const response = await fetch('/api/voice/cleanup-assistants', { method: 'POST' });
      const result = await response.json();
      
      if (response.ok) {
        setCleanupResult(`✅ Cleanup completed! Removed ${result.cleaned} invalid assistants.`);
      } else {
        setCleanupResult(`❌ Cleanup failed: ${result.error}`);
      }
    } catch (error) {
      setCleanupResult(`❌ Cleanup error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCleaning(false);
    }
  };

  const testMicrophone = async () => {
    setTestingMic(true);
    setMicTestResult('');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicTestResult('✅ Microphone access granted! You can speak now.');
      
      // Test if we can actually capture audio
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);
      
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      let hasAudio = false;
      const checkAudio = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        if (average > 10) {
          hasAudio = true;
          setMicTestResult('✅ Microphone is working! Audio detected.');
        }
      };
      
      // Check for audio for 3 seconds
      const interval = setInterval(checkAudio, 100);
      setTimeout(() => {
        clearInterval(interval);
        if (!hasAudio) {
          setMicTestResult('⚠️ Microphone access granted but no audio detected. Try speaking louder.');
        }
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();
      }, 3000);
      
    } catch (error) {
      setMicTestResult(`❌ Microphone test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTestingMic(false);
    }
  };

  const allChecksPass = Object.values(checks).every(Boolean);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Vapi Debug Information
        </CardTitle>
        <CardDescription>
          Check if your environment is properly configured for voice calls
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Vapi API Key</span>
            {checks.vapiKey ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="w-4 h-4 mr-1" />
                Configured
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="w-4 h-4 mr-1" />
                Missing
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span>HTTPS/Localhost</span>
            {checks.https ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="w-4 h-4 mr-1" />
                Secure
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="w-4 h-4 mr-1" />
                Insecure
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span>Browser Support</span>
            {checks.browser ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="w-4 h-4 mr-1" />
                Supported
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="w-4 h-4 mr-1" />
                Not Supported
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span>Microphone Access</span>
            {checks.microphone ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="w-4 h-4 mr-1" />
                Granted
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="w-4 h-4 mr-1" />
                Denied
              </Badge>
            )}
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="font-medium">Overall Status</span>
            {allChecksPass ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="w-4 h-4 mr-1" />
                Ready for Voice Calls
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="w-4 h-4 mr-1" />
                Issues Found
              </Badge>
            )}
          </div>
        </div>

        {!checks.vapiKey && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">
              <strong>Missing Vapi API Key:</strong> Add NEXT_PUBLIC_VAPI_PUBLIC_KEY to your .env.local file
            </p>
          </div>
        )}

        {!checks.https && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">
              <strong>HTTPS Required:</strong> Voice calls require a secure connection. Use localhost for development or deploy to HTTPS.
            </p>
          </div>
        )}

        {!checks.microphone && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-600">
              <strong>Microphone Access:</strong> Click "Allow" when prompted for microphone access to enable voice calls.
            </p>
          </div>
        )}

        <div className="pt-4 border-t space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Assistant Creation Test</span>
            <Button
              onClick={testAssistantCreation}
              disabled={testing}
              size="sm"
              variant="outline"
            >
              <TestTube className="w-4 h-4 mr-2" />
              {testing ? 'Testing...' : 'Test Assistant'}
            </Button>
          </div>
          
          {testResult && (
            <div className="p-3 bg-gray-50 border rounded-md">
              <p className="text-sm font-mono">{testResult}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="font-medium">Cleanup Invalid Assistants</span>
            <Button
              onClick={cleanupAssistants}
              disabled={cleaning}
              size="sm"
              variant="outline"
            >
              <TestTube className="w-4 h-4 mr-2" />
              {cleaning ? 'Cleaning...' : 'Cleanup'}
            </Button>
          </div>
          
          {cleanupResult && (
            <div className="p-3 bg-gray-50 border rounded-md">
              <p className="text-sm font-mono">{cleanupResult}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="font-medium">Test Microphone</span>
            <Button
              onClick={testMicrophone}
              disabled={testingMic}
              size="sm"
              variant="outline"
            >
              <TestTube className="w-4 h-4 mr-2" />
              {testingMic ? 'Testing...' : 'Test Mic'}
            </Button>
          </div>
          
          {micTestResult && (
            <div className="p-3 bg-gray-50 border rounded-md">
              <p className="text-sm font-mono">{micTestResult}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
