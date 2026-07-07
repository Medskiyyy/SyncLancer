import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { PwaRegister } from "@/components/pwa-register";

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
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <PwaRegister />
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
