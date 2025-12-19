import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Preloader from "./components/Preloader";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Paycort | Admin Portal",
  description: "Built with Love by AY Asemota",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <Preloader />
        {children}
      </body>
    </html>
  );
}
