import type { Metadata } from "next";
import { Sora, IBM_Plex_Sans, Space_Mono } from "next/font/google";
import "./globals.css";

const sora = Sora({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600", "700"] });
const plexSans = IBM_Plex_Sans({ subsets: ["latin"], variable: "--font-body", weight: ["400", "500"] });
const spaceMono = Space_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "MindVault",
  description: "Ask questions. Get answers grounded in your own documents.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${plexSans.variable} ${spaceMono.variable} bg-[#0A0E14] text-[#E6EDF3] font-[family-name:var(--font-body)] min-h-screen`}>
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,#1B2433_1px,transparent_1px)] bg-[length:28px_28px] opacity-40" />
        <nav className="border-b border-[#1B2433] px-8 py-5 flex items-center gap-8">
          <a href="/" className="flex items-center gap-2 font-[family-name:var(--font-display)] font-semibold text-lg">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#4FD1FF] to-[#8B5CF6]" />
            MindVault
          </a>
          <div className="flex gap-6 text-sm text-[#8B96A8]">
            <a href="/" className="hover:text-[#E6EDF3] transition-colors">Ask</a>
            <a href="/upload" className="hover:text-[#E6EDF3] transition-colors">Upload</a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}