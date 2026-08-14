import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Social Stories & Care Pathways",
  description:
    "Build picture-led social stories and care pathways, stored in your own Google Drive.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Never block zoom — some users rely on it.
  maximumScale: 5,
  themeColor: "#1f5c3d",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
