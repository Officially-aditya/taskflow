import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter, Space_Grotesk, Manrope } from "next/font/google";
import "./globals.css";

const inter        = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });
const manrope      = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "TaskFlow AI",
  description: "Content pipeline agent — drafts, reviews, rewrites, and formats autonomously.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${manrope.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
