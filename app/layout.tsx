import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ImportaFlow - Calcule o Custo Real das Suas Importações",
  description:
    "ImportaFlow é uma calculadora feita para importadores brasileiros: simule pacotes da China (CSSBuy, ACBuy e similares), some frete, taxas e impostos e descubra o custo real e o lucro estimado.",
  generator: "v0.app",
  icons: {
    icon: "/importa-flow-icon.png",
    shortcut: "/importa-flow-icon.png",
    apple: "/importa-flow-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.className} ${geistMono.className} antialiased`}
      >
        <ThemeProvider>
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
