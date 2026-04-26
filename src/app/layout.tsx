import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fitness Pro | Control de Asesorías",
  description: "Plataforma de alta escalabilidad para entrenadores personales y academias fitness.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-background text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
