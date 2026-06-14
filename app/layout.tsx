import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SessionProvider } from "@/providers/SessionProvider";

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
  themeColor:    "#1D6FA4",
  width:         "device-width",
  initialScale:  1,
  userScalable:  false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background font-sans">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
