import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PaperMind — AI PDF Summarizer",
  description: "Understand long documents in seconds with AI-powered summaries and Q&A.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
