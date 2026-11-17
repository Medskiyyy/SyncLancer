import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Onest, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { PwaRegister } from "@/components/pwa-register";
import { MotionProvider } from "@/app/providers/motion-provider";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const onest = Onest({
  subsets: ["latin"],
  variable: "--font-onest",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SyncLancer",
  description: "Freelance operations workspace for clients, projects, proposals, invoices, and files.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${plusJakartaSans.variable} ${onest.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-full flex flex-col">
        <PwaRegister />
        <MotionProvider>{children}</MotionProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
