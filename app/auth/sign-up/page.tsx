import { SignUpForm } from "@/components/sign-up-form";
import { SignupLayoutWrapper } from "@/components/signup-layout-wrapper";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account - Voice AI",
  description: "Join Voice AI and get started with your personal AI assistant. Create your account to begin managing calls with intelligent automation.",
  robots: "noindex, nofollow",
};

export default function Page() {
  return (
    <SignupLayoutWrapper>
      <SignUpForm />
    </SignupLayoutWrapper>
  );
}
