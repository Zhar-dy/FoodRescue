import React from "react";
import type { Metadata } from "next";
import { Geist } from "next/font/google";

import "./globals.css"
import NextTopLoader from "nextjs-toploader";
import { ThemeProvider } from "@/components/Themeprovider";
import { OfflineBanner } from "@/app/components/shared/offline-banner";


const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "http://localhost:3000")),
  title: "FoodRescue AI",
  description: "AI-powered food rescue platform for predicting surplus food and recommending rescue offers.",
   openGraph: {
    title: "FoodRescue AI",
    description: "AI-powered food rescue platform for predicting surplus food and recommending rescue offers.",
    
  },
  twitter: {
    card: "summary_large_image",

  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (

    <html lang="en" suppressHydrationWarning
      data-color-theme="CUSTOM_THEME"
      data-layout="vertical"
      data-boxed-layout="boxed"
      data-sidebar-type="true"
      data-card-shadow="false"
      className="style-lyra"
    >
      <head>
        <link rel="icon" href="/favicons.ico" type="image/svg+xml" />
      </head>
      <body className={`${geist.className} `} >
        <NextTopLoader color="var(--primary)" showSpinner={false} />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          {children}
          <OfflineBanner />
        </ThemeProvider>
      </body>
    </html>

  );
}
