import type { Metadata } from "next";
import { Inter, Great_Vibes } from "next/font/google";
import "./globals.css";
import AudioController from "@/components/Audio/AudioController";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const greatVibes = Great_Vibes({
  weight: "400",
  variable: "--font-great-vibes",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bloom Message 🌸 — Create a Magical Flower Bouquet",
  description:
    "Transform your message into an unforgettable cinematic flower bouquet experience. Type your heartfelt message and watch as a beautiful 3D bouquet blooms just for you.",
  keywords: ["flowers", "bouquet", "message", "3D", "animation", "greeting"],
  openGraph: {
    title: "Bloom Message 🌸",
    description: "Create a magical animated flower bouquet with your personalized message.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${greatVibes.variable} h-full antialiased`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#0a0a1a" />
      </head>
      <body className="min-h-full bg-[#0a0a1a]">{children}</body>
    </html>
  );
}
