"use client";

import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { Mic } from 'lucide-react';
import Link from 'next/link';

interface ParticleCircleProps {
  enableVoiceReactivity?: boolean;
}

const ParticleCircle: React.FC<ParticleCircleProps> = ({ enableVoiceReactivity = true }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const particleSystemRef = useRef<THREE.Points | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioDataRef = useRef<{ bass: number; mid: number; treble: number; volume: number }>({
    bass: 0,
    mid: 0,
    treble: 0,
    volume: 0
  });

  // Audio setup and analysis
  const setupAudio = async () => {
    if (!enableVoiceReactivity) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength) as Uint8Array;
      
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      microphoneRef.current = microphone;
      dataArrayRef.current = dataArray;
      
      return true;
    } catch (error) {
      console.log('Audio access denied or not available:', error);
      return false;
    }
  };

  const analyzeAudio = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;
    
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    
    const data = dataArrayRef.current;
    const bass = data.slice(0, 8).reduce((a, b) => a + b, 0) / 8 / 255;
    const mid = data.slice(8, 32).reduce((a, b) => a + b, 0) / 24 / 255;
    const treble = data.slice(32, 64).reduce((a, b) => a + b, 0) / 32 / 255;
    const volume = data.reduce((a, b) => a + b, 0) / data.length / 255;
    
    audioDataRef.current = { bass, mid, treble, volume };
  };

  // Responsive resize handler
  const handleResize = () => {
    if (!canvasRef.current || !rendererRef.current || !cameraRef.current) return;
    
    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const size = Math.min(containerRect.width, containerRect.height, 600);
    
    // Update canvas size
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    canvas.width = size;
    canvas.height = size;
    
    // Update renderer
    rendererRef.current.setSize(size, size);
    rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Update camera
    cameraRef.current.aspect = 1;
    cameraRef.current.updateProjectionMatrix();
  };

  // Debounced resize handler
  const debouncedResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    resizeTimeoutRef.current = setTimeout(handleResize, 100);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Setup audio
    setupAudio();

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000308, 0.03);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 1000);
    camera.position.set(0, 0, 20);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    
    // Initial size setup
    const initialSize = 350; // Larger initial size for better desktop experience
    renderer.setSize(initialSize, initialSize);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    // Lighting
    scene.add(new THREE.AmbientLight(0x404060));
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight1.position.set(15, 20, 10);
    scene.add(dirLight1);
    const dirLight2 = new THREE.DirectionalLight(0x88aaff, 0.9);
    dirLight2.position.set(-15, -10, -15);
    scene.add(dirLight2);

    // Create starfield (commented out for performance)
    /*
    const createStarfield = () => {
      const starVertices = [];
      const starSizes = [];
      const starColors = [];
      const starGeometry = new THREE.BufferGeometry();
      const starCount = 5000;
      
      for (let i = 0; i < starCount; i++) {
        const tempVec = new THREE.Vector3(
          THREE.MathUtils.randFloatSpread(200),
          THREE.MathUtils.randFloatSpread(200),
          THREE.MathUtils.randFloatSpread(200)
        );
        if (tempVec.length() < 50) tempVec.setLength(50 + Math.random() * 150);
        starVertices.push(tempVec.x, tempVec.y, tempVec.z);
        starSizes.push(Math.random() * 0.15 + 0.05);
        const color = new THREE.Color();
        if (Math.random() < 0.1) {
          color.setHSL(Math.random(), 0.7, 0.65);
        } else {
          color.setHSL(0.6, Math.random() * 0.1, 0.8 + Math.random() * 0.2);
        }
        starColors.push(color.r, color.g, color.b);
      }
      
      starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
      starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
      starGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));
      
      const starMaterial = new THREE.ShaderMaterial({
        uniforms: { pointTexture: { value: createStarTexture() } },
        vertexShader: `
          attribute float size;
          varying vec3 vColor;
          varying float vSize;
          void main() {
            vColor = color;
            vSize = size;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (400.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform sampler2D pointTexture;
          varying vec3 vColor;
          varying float vSize;
          void main() {
            float alpha = texture2D(pointTexture, gl_PointCoord).a;
            if (alpha < 0.1) discard;
            gl_FragColor = vec4(vColor, alpha * 0.9);
          }
        `,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        vertexColors: true
      });
      
      scene.add(new THREE.Points(starGeometry, starMaterial));
    };
    */

    // createStarTexture function removed as it's not used

    // Create particle system
    const particleCount = 8000;
    const shapeSize = 8;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const opacities = new Float32Array(particleCount);
    const effectStrengths = new Float32Array(particleCount);

    // Generate sphere positions
    const phi = Math.PI * (Math.sqrt(5) - 1);
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Sphere distribution
      const y = 1 - (i / (particleCount - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      
      positions[i3] = x * shapeSize;
      positions[i3 + 1] = y * shapeSize;
      positions[i3 + 2] = z * shapeSize;

      // Fire color scheme
      const distance = Math.sqrt(x * x + y * y + z * z);
      const hue = THREE.MathUtils.mapLinear(distance, 0, 1, 0, 45); // Orange to red
      const saturation = 0.95;
      const lightness = 0.6;
      
      const color = new THREE.Color().setHSL(hue / 360, saturation, lightness);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = Math.random() * 0.17 + 0.08;
      opacities[i] = 1.0;
      effectStrengths[i] = 0.0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    // Removed color, size, opacity, and effect strength attributes for simple white particles

    // Material - Simple white particles (pure white)
    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.15,
      transparent: true,
      opacity: 1.0,
      sizeAttenuation: true
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
    particleSystemRef.current = particleSystem;

    // Create starfield (removed for simplicity)
    // createStarfield();

    // Animation
    const clock = new THREE.Clock();
    const sourcePositions = new Float32Array(positions);
    const tempVec = new THREE.Vector3();
    const sourceVec = new THREE.Vector3();
    const currentVec = new THREE.Vector3();
    const flowVec = new THREE.Vector3();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      
      // Analyze audio
      analyzeAudio();
      const { bass, mid, treble, volume } = audioDataRef.current;
      
      // Audio-reactive rotation (single direction - Y-axis only, 2x less sensitive) or static rotation
      const rotationSpeed = enableVoiceReactivity ? (0.3 + bass * 0.05) : 0.3;
      particleSystem.rotation.y = elapsedTime * rotationSpeed;
      // Removed X and Z rotation for single direction rotation
      
      // Audio-reactive breathing effect (2x less sensitive) or static breathing
      const breathScale = enableVoiceReactivity ? (1.0 + Math.sin(elapsedTime * 0.5) * 0.015 + volume * 0.05) : (1.0 + Math.sin(elapsedTime * 0.5) * 0.015);
      particleSystem.scale.setScalar(breathScale);

      // Audio-reactive distortion (2x less sensitive) or static values
      const distortionStrength = enableVoiceReactivity ? (bass * 0.25 + volume * 0.15) : 0.1;
      
      // Ripple effects (2x less sensitive) or static values
      const rippleCount = enableVoiceReactivity ? (3 + Math.floor(volume * 2.5)) : 3; // 3-5.5 ripples based on volume
      const rippleSpeed = enableVoiceReactivity ? (2.0 + bass * 0.5) : 2.0;
      const rippleAmplitude = enableVoiceReactivity ? (0.15 + volume * 0.25) : 0.15;

      // Idle flow animation with audio reactivity (2x less sensitive) or static values
      const timeScaled = elapsedTime * 0.08;
      const freq = enableVoiceReactivity ? (0.1 + treble * 0.025) : 0.1;
      const idleFlowStrength = enableVoiceReactivity ? (0.25 + volume * 0.075) : 0.25;

      const positionsArray = geometry.attributes.position.array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        sourceVec.fromArray(sourcePositions, i3);
        tempVec.copy(sourceVec).multiplyScalar(breathScale);
        
        // Audio-reactive distortion
        const distance = tempVec.length();
        const distortionFactor = Math.pow(distance / shapeSize, 2) * distortionStrength;
        const distortionOffset = new THREE.Vector3(
          Math.sin(elapsedTime * 2 + i * 0.1) * distortionFactor,
          Math.cos(elapsedTime * 1.5 + i * 0.1) * distortionFactor,
          Math.sin(elapsedTime * 3 + i * 0.1) * distortionFactor * 0.5
        );
        tempVec.add(distortionOffset);
        
        // Ripple effects
        const rippleOffset = new THREE.Vector3();
        for (let ripple = 0; ripple < rippleCount; ripple++) {
          const ripplePhase = (elapsedTime * rippleSpeed + ripple * Math.PI * 2 / rippleCount) % (Math.PI * 2);
          const rippleDistance = distance - (ripplePhase / (Math.PI * 2)) * shapeSize * 2;
          const rippleIntensity = Math.exp(-Math.abs(rippleDistance) * 2) * rippleAmplitude;
          const rippleWave = Math.sin(ripplePhase * 3) * rippleIntensity;
          
          // Add ripple in radial direction
          const radialDirection = tempVec.clone().normalize();
          rippleOffset.addScaledVector(radialDirection, rippleWave);
          
          // Add circular ripple motion
          const angle = Math.atan2(tempVec.y, tempVec.x) + ripplePhase;
          const circularOffset = new THREE.Vector3(
            Math.cos(angle) * rippleWave * 0.3,
            Math.sin(angle) * rippleWave * 0.3,
            Math.sin(ripplePhase * 2) * rippleWave * 0.2
          );
          rippleOffset.add(circularOffset);
        }
        tempVec.add(rippleOffset);
        
        // Bass-driven pulsing distortion (2x less sensitive)
        const bassPulse = Math.sin(elapsedTime * 10 + i * 0.05) * bass * 0.25;
        tempVec.multiplyScalar(1.0 + bassPulse);
        
        // Mid-frequency wave distortion (2x less sensitive)
        const midWave = Math.sin(tempVec.x * 0.5 + elapsedTime * 3) * 
                       Math.cos(tempVec.y * 0.5 + elapsedTime * 2) * 
                       Math.sin(tempVec.z * 0.5 + elapsedTime * 4) * mid * 0.2;
        tempVec.addScaledVector(tempVec.clone().normalize(), midWave);
        
        // Treble-driven high-frequency distortion (2x less sensitive)
        const trebleDistortion = new THREE.Vector3(
          Math.sin(tempVec.x * 2 + elapsedTime * 8) * treble * 0.075,
          Math.cos(tempVec.y * 2 + elapsedTime * 6) * treble * 0.075,
          Math.sin(tempVec.z * 2 + elapsedTime * 10) * treble * 0.05
        );
        tempVec.add(trebleDistortion);
        
        // Simple noise function with audio enhancement
        const noise4D = (x: number, y: number, z: number, w: number) => Math.sin(x) * Math.cos(y) * Math.sin(z) * Math.cos(w);
        
        flowVec.set(
          noise4D(tempVec.x * freq, tempVec.y * freq, tempVec.z * freq, timeScaled),
          noise4D(tempVec.x * freq + 10, tempVec.y * freq + 10, tempVec.z * freq + 10, timeScaled),
          noise4D(tempVec.x * freq + 20, tempVec.y * freq + 20, tempVec.z * freq + 20, timeScaled)
        );
        
        // Audio-reactive flow (2x less sensitive)
        flowVec.multiplyScalar(1.0 + volume * 0.25);
        tempVec.addScaledVector(flowVec, idleFlowStrength);
        
        // Volume-driven particle movement (2x less sensitive)
        const volumePush = new THREE.Vector3(
          Math.sin(i * 0.1 + elapsedTime * 2) * volume * 0.075,
          Math.cos(i * 0.1 + elapsedTime * 1.5) * volume * 0.075,
          Math.sin(i * 0.1 + elapsedTime * 3) * volume * 0.05
        );
        tempVec.add(volumePush);
        
        currentVec.fromArray(positionsArray, i3);
        currentVec.lerp(tempVec, 0.05 + volume * 0.025);
        
        positionsArray[i3] = currentVec.x;
        positionsArray[i3 + 1] = currentVec.y;
        positionsArray[i3 + 2] = currentVec.z;
      }

      geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
      animationIdRef.current = requestAnimationFrame(animate);
    };

    // Initial resize
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', debouncedResize);

    animate();

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (microphoneRef.current) {
        microphoneRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      window.removeEventListener('resize', debouncedResize);
    };
  }, [debouncedResize]);

  return (
    <div className="flex justify-center items-center w-full mx-auto relative">
        <canvas 
          ref={canvasRef} 
          className="w-full rounded-full"
          style={{ background: 'transparent', aspectRatio: '1/1' }}
        />
        {/* Microphone icon in center with solid circles */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-28 h-28 flex items-center justify-center">
           
            {/* Small transparent blue circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="!w-12 !h-12 rounded-full" style={{ background: 'rgba(55, 118, 255, 0.7)' }} />
            </div>

            {/* Large transparent blue circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="!w-20 !h-20 rounded-full" style={{ background: 'rgba(55, 118, 255, 0.7)' }} />
            </div>
            {/* Small microphone icon */}
            <Link href="/auth/login" className="relative z-10 pointer-events-auto">
              <Mic className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-white" />
            </Link>
          </div>
        </div>
    </div>
  );
};

export default ParticleCircle;