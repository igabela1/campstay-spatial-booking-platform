import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";

import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./providers";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Auto Kamp Miris Ljeta",
  description: "Camping and accommodation at Jablanicko Lake",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          <Header />

          <main className="pt-16">{children}</main>

          <Toaster />
        </Providers>
      </body>
    </html>
  );
}