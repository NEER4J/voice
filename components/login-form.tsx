"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { MagicButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // Update this route to redirect to an authenticated route. The user already has an active session.
      router.push("/dashboard");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      
      
     

      <form onSubmit={handleLogin}>
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium lg:text-foreground lg:font-normal text-gray-700 lg:text-foreground">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-full text-base lg:flat-input lg:bg-background lg:border-input lg:text-foreground bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-blue-500 lg:focus:bg-background"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium lg:text-foreground lg:font-normal text-gray-700 lg:text-foreground">Password *</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 text-base lg:flat-input lg:bg-background lg:border-input lg:text-foreground bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-blue-500 lg:focus:bg-background"
            />
          </div>
          
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg lg:bg-destructive/10 lg:border-destructive/20">
              <p className="text-sm text-red-200 lg:text-destructive">{error}</p>
            </div>
          )}
          
          <MagicButton type="submit" className="w-full h-12 text-base" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </MagicButton>
        </div>
        <div className="mt-6 text-sm text-black/80 lg:text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/sign-up"
            className="text-blue hover:underline font-medium lg:text-primary lg:hover:text-primary/80"
          >
            Create account
          </Link>
        </div>
      </form>
    </div>
  );
}
