import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConditionalLayout } from "@/components/ConditionalLayout";

const canela = localFont({
  variable: "--font-heading",
  src: [
    {
      path: "../public/fonts/canela-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/canela-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/canela-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
});

const avenir = localFont({
  variable: "--font-body",
  src: [
    { path: "../public/fonts/avenir-light.woff2", weight: "300" },
    { path: "../public/fonts/din-next-light.woff2", weight: "400" },
  ],
});

const times = localFont({
  variable: "--font-times",
  src: [
    {
      path: "../public/fonts/times.ttf",
      weight: "100 900", // This allows all weights from 100 to 900
      style: "normal",
    },
  ],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const SITE_URL = "https://schooldoor.in";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "SchoolDoor - Find and Compare Schools Near You",
  description:
    "India's first AI-powered school discovery platform. Compare schools by rating, fees, and reviews.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "SchoolDoor - Find and Compare Schools Near You",
    description:
      "India's first AI-powered school discovery platform. Compare schools by rating, fees, and reviews.",
    siteName: "SchoolDoor",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "SchoolDoor - Discover the best schools near you",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SchoolDoor - Find and Compare Schools Near You",
    description:
      "India's first AI-powered school discovery platform. Compare schools by rating, fees, and reviews.",
    images: [OG_IMAGE],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SchoolDoor",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [
      "https://www.linkedin.com/company/schooldoor",
      "https://twitter.com/schooldoor",
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SchoolDoor",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en">
      <body
        className={`${canela.variable} ${avenir.variable} ${times.variable} ${inter.variable} bg-white text-sd-navy antialiased`}
      >
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationSchema, websiteSchema]),
          }}
        />
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
