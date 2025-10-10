import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Voice AI",
  description: "Start your AI voice conversations with customizable tone and language settings.",
  robots: "noindex, nofollow",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen">
      {children}
    </main>
  );
}
