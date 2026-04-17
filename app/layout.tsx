import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const viewport: Viewport = {
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: "JSON Generator Lab",
  description:
    "Gerador de JSON com endpoint interno e motor local para criar estruturas de exemplo sem depender de APIs externas.",
  keywords: [
    "json generator",
    "mock data",
    "gerador json",
    "next.js",
    "endpoint interno",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body>
        <Analytics />
        {children}
      </body>
    </html>
  );
}
