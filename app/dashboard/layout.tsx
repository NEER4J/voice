import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Voice AI",
  description: "Manage your AI assistant calls and conversations. View your call history, start new conversations, and track your usage with Voice AI.",
  robots: "noindex, nofollow",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <Link href={"/"} className="font-semibold">voice</Link>
            <AuthButton />
          </div>
        </nav>
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          {children}
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <div className="text-muted-foreground">© 2025 Voice AI. All rights reserved.</div>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
