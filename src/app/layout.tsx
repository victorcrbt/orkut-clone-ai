import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import AuthProviderClient from "../components/AuthProviderClient";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
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
      <body className={`${inter.variable} ${robotoMono.variable} bg-[#e8eefa] text-black`}>
        <AuthProviderClient>
          {children}
        </AuthProviderClient>
      </body>
    </html>
  );
}
