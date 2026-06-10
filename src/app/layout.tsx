import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The 5-Minute Escape",
  description:
    "Quick daily challenges designed for your short breaks. Solve puzzles, beat the clock, and compete worldwide.",
  openGraph: {
    title: "The 5-Minute Escape",
    description:
      "Quick daily challenges designed for your short breaks. Solve puzzles, beat the clock, and compete worldwide.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <SessionProvider>
          <Navbar />
          <main className="min-h-screen pt-16">{children}</main>
          <footer className="border-t border-dark-600/50 py-8 text-center text-sm text-dark-200">
            <p>&copy; {new Date().getFullYear()} The 5-Minute Escape. All rights reserved.</p>
          </footer>
        </SessionProvider>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0000000000000000" crossOrigin="anonymous" />
      </body>
    </html>
  );
}
