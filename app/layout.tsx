import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChArUco Board Generator — Generate Printable Calibration Boards",
  description:
    "Generate and download printable ChArUco boards for camera calibration. Supports A4/A3/A2/A1 paper sizes, multiple ArUco dictionaries, and PDF/PNG/SVG export. 100% client-side, no backend needed.",
  keywords: [
    "ChArUco",
    "ArUco",
    "OpenCV",
    "camera calibration",
    "board generator",
    "printable calibration board",
  ],
  openGraph: {
    title: "ChArUco Board Generator",
    description: "Generate and download printable ChArUco boards for camera calibration",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ChArUco Board Generator",
    description: "Generate printable, OpenCV-compatible ChArUco calibration boards",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
