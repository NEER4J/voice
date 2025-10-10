"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { MagicButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (!firstName.trim()) {
      setError("First name is required");
      setIsLoading(false);
      return;
    }

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
          data: {
            first_name: firstName,
            full_name: firstName
          }
        },
      });
      if (error) throw error;
      router.push("/onboarding");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      

      <form onSubmit={handleSignUp}>
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium lg:text-foreground lg:font-normal text-gray-700 lg:text-foreground">Name *</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="Your name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-12 text-base lg:flat-input lg:bg-background lg:border-input lg:text-foreground bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 lg:focus:bg-background"
            />
          </div>
          
          <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium lg:text-foreground lg:font-normal text-gray-700 lg:text-foreground">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 text-base lg:flat-input lg:bg-background lg:border-input lg:text-foreground bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 lg:focus:bg-background"
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
              className="h-12 text-base lg:flat-input lg:bg-background lg:border-input lg:text-foreground bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 lg:focus:bg-background"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="repeat-password" className="text-sm font-medium lg:text-foreground lg:font-normal text-white">Confirm Password *</Label>
            <Input
              id="repeat-password"
              type="password"
              required
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              className="h-12 text-base lg:flat-input lg:bg-background lg:border-input lg:text-foreground bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 lg:focus:bg-background"
            />
          </div>
          
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg lg:bg-destructive/10 lg:border-destructive/20">
              <p className="text-sm text-red-200 lg:text-destructive">{error}</p>
            </div>
          )}
          
          <MagicButton type="submit" className="w-full h-12 text-base" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </MagicButton>
        </div>
        <div className="mt-6 text-sm text-black/80 lg:text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue hover:underline font-medium lg:text-primary lg:hover:text-primary/80">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
