import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Voice AI - Your Personal AI Assistant",
  description: "Let AI handle your calls so you don't have to. Voice AI is your personal AI assistant that manages calls, schedules, and tasks with intelligent automation.",
  keywords: "AI assistant, voice AI, call management, personal assistant, AI automation, voice technology, smart assistant",
  authors: [{ name: "Voice AI Team" }],
  creator: "Voice AI",
  publisher: "Voice AI",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: defaultUrl,
    title: "Voice AI - Your Personal AI Assistant",
    description: "Let AI handle your calls so you don't have to. Voice AI is your personal AI assistant that manages calls, schedules, and tasks with intelligent automation.",
    siteName: "Voice AI",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Voice AI - Your Personal AI Assistant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Voice AI - Your Personal AI Assistant",
    description: "Let AI handle your calls so you don't have to. Voice AI is your personal AI assistant that manages calls, schedules, and tasks with intelligent automation.",
    images: ["/og-image.jpg"],
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
