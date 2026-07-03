import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import AuthShell from "@/components/AuthShell";

export const metadata: Metadata = {
  title: "EchoCare — AI-Powered Healthcare Companion",
  description: "Every patient story deserves to be heard. EchoCare is an AI-powered healthcare companion that listens to your story, tracks your health, and provides personalized insights.",
  keywords: "healthcare, AI, patient story, health tracking, medical insights, wellness",
  openGraph: {
    title: "EchoCare — AI-Powered Healthcare Companion",
    description: "Every patient story deserves to be heard.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <AuthShell>{children}</AuthShell>
        </AuthProvider>
      </body>
    </html>
  );
}
