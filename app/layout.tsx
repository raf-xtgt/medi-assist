import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/providers/SessionProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default:  "medi-assist",
    template: "%s | medi-assist",
  },
  description:
    "A unified digital health platform for Admins, Doctors, and Patients.",
  keywords:  ["healthcare", "telemedicine", "appointments", "EHR"],
  authors:   [{ name: "medi-assist" }],
  robots:    "noindex, nofollow",
};

export const viewport: Viewport = {
  themeColor:      "#1D6FA4",
  width:           "device-width",
  initialScale:    1,
  userScalable:    false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-background" style={{ fontFamily: "var(--font-sans)" }}>
      <body className={`${inter.variable} font-sans antialiased`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
