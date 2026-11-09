import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EXIST — Costume 3 Pièces Slim-Fit | Concept de campagne",
  description:
    "Projet universitaire non officiel : découvrez une expérience immersive autour du costume 3 pièces EXIST. Guide de tailles et inspirations cérémonie.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
