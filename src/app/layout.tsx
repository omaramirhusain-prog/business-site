import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { ActionProvider } from "@/lib/actions/registry";
import { AppointmentModal } from "@/components/appointment-modal";
import { SceneProvider } from "@/components/scene-context";
import { SiteJsonLd } from "@/components/site-json-ld";
import { siteConfig } from "@/lib/site-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = siteConfig.siteUrl;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Northline Detail Co. | Premium Auto Detailing in Austin",
  description:
    "Paint correction, ceramic coating, interior detailing, and maintenance care for Austin drivers. Book your professional auto detail.",
  keywords: [
    "auto detailing Austin",
    "ceramic coating Austin",
    "paint correction",
    "interior car detailing",
    "car detailing near me",
  ],
  openGraph: {
    title: "Northline Detail Co. | Your Car, Fully Reset",
    description:
      "Measured paint correction, ceramic protection, and obsessive interior care in Austin, Texas.",
    url: siteUrl,
    siteName: "Northline Detail Co.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Northline Detail Co. | Premium Auto Detailing",
    description:
      "Your car, fully reset. Professional detailing in Austin, Texas.",
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
        <SiteJsonLd />
        <SceneProvider>
          <ActionProvider>
            <Navbar />
            {children}
            <AppointmentModal />
          </ActionProvider>
        </SceneProvider>
      </body>
    </html>
  );
}
