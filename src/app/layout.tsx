import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import SwipeNavigator from "@/components/SwipeNavigator";
import PageTransition from "@/components/PageTransition";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "App Launcher",
  description: "Vercelアプリ管理ランチャー",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "App Launcher",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="ja">
        <body className={`${inter.className} pb-16 sm:pb-0 relative min-h-screen overflow-x-hidden`}>
          <PageTransition>
            {children}
          </PageTransition>
          <BottomNav />
          <SwipeNavigator />
        </body>
      </html>
    </ClerkProvider>
  );
}
