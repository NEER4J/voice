import { LoginForm } from "@/components/login-form";
import { LoginLayoutWrapper } from "@/components/login-layout-wrapper";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Voice AI",
  description: "Sign in to your Voice AI account and start managing your calls with intelligent AI assistance.",
  robots: "noindex, nofollow",
};

export default function Page() {
  return (
    <LoginLayoutWrapper>
      <LoginForm />
    </LoginLayoutWrapper>
  );
}
