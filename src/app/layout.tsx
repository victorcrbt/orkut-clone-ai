import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProviderClient from "../components/AuthProviderClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Orkut - Conecta-se aos seus amigos e familiares",
  description: "Clone do Orkut - Rede social para conectar amigos e familiares",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-[#e8eefa] text-black`}>
        <AuthProviderClient>
          {children}
        </AuthProviderClient>
      </body>
    </html>
  );
}
