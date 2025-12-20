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
  description: "Paycort Official Admin Panel",
  openGraph: {
    title: "Paycort | Admin Portal",
    description: "Paycort Official Admin Panel",
    siteName: "Paycort",
    images: [
      {
        url: "/social-preview.png",
        width: 1200,
        height: 630,
        alt: "Paycort Admin Preview",
      },
    ],
    type: "website",
  },
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
