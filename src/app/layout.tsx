import type { Metadata } from "next";
import { Archivo, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { PwaRegister } from "@/components/pwa-register";
import { MotionProvider } from "@/app/providers/motion-provider";
import { ThemeProvider } from "@/app/providers/theme-provider";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
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
      suppressHydrationWarning
      className={`h-full antialiased ${archivo.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <PwaRegister />
          <MotionProvider>{children}</MotionProvider>
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
