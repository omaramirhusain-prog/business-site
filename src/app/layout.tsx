import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { ChatWidget } from "@/components/chat-widget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://omar-web.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Omar Husain — Premium Websites with 3D & AI",
  description:
    "I design and build best-in-class websites: full 3D animation, integrated AI agents, and modern UX. One developer, obsessive quality.",
  keywords: [
    "web developer",
    "3D websites",
    "AI websites",
    "React Three Fiber",
    "Next.js developer",
    "creative developer",
  ],
  openGraph: {
    title: "Omar Husain — Premium Websites with 3D & AI",
    description:
      "Best-in-class websites: 3D animation, integrated AI, modern UX.",
    url: siteUrl,
    siteName: "Omar Husain",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Omar Husain — Premium Websites with 3D & AI",
    description:
      "Best-in-class websites: 3D animation, integrated AI, modern UX.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
