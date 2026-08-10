import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LiveMitra - Dashboard | Aman",
  description: "LiveMitra CRM Dashboard created by Aman",
  authors: [{ name: "Aman" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col bg-[#F1F5F9]">
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
