import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nova Forge Esports — We Forge Legends",
  description:
    "India's premium campus esports tournament & creator ecosystem. Nova Forge organizes gaming events, creator programs and campus festivals — starting in Bhopal.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
