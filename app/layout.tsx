import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BLUESCALP ASSASSIN V1.0 - Automated Forex & Indices Trading Robot",
  description: "High-precision automated trading robot powered by PROEDGE EA by Tman Capitals. 5-Timeframe Machine Gunner scalping continuation and liquidity sweep reversal with up to 94% accuracy.",
  keywords: [
    "BlueScalp Assassin",
    "PROEDGE EA",
    "Tman Capitals",
    "MT5 Trading Bot",
    "Forex Robot South Africa",
    "Machine Gunner Scalper",
    "XAUUSD Trading Bot",
    "NAS100 Robot",
    "US30 Scalping EA",
    "RCG Markets",
    "HFM",
    "FxPro",
    "JustMarkets"
  ],
  authors: [{ name: "Thabang Seake (Tman Capitals)" }],
  verification: {
    google: "rROBugV0lLh_DS0vYccmUA26VI1SkflgksU1Qrkemkc",
  },
  openGraph: {
    title: "BLUESCALP ASSASSIN V1.0 | Machine Gunner Scalper",
    description: "Automated trading terminal with multi-timeframe alignment, 3-bullet burst execution, and 40% trailing equity protection.",
    url: "https://bluescalp-assassin.vercel.app",
    siteName: "BlueScalp Assassin",
    images: [
      {
        url: "https://bluescalp-assassin.vercel.app/images/bluescalp-bot.jpg",
        width: 1200,
        height: 630,
        alt: "BlueScalp Assassin V1.0 Robot",
      },
    ],
    locale: "en_ZA",
    type: "website",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/images/bluescalp-bot.jpg",
    shortcut: "/images/bluescalp-bot.jpg",
    apple: "/images/bluescalp-bot.jpg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BlueScalp",
  },
};

export const viewport: Viewport = {
  themeColor: "#030811",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="google-site-verification" content="rROBugV0lLh_DS0vYccmUA26VI1SkflgksU1Qrkemkc" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://bluescalp-assassin.vercel.app/" />
        <link rel="icon" type="image/jpeg" href="/images/bluescalp-bot.jpg" />
        <link rel="shortcut icon" href="/images/bluescalp-bot.jpg" />
        <link rel="apple-touch-icon" href="/images/bluescalp-bot.jpg" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "BlueScalp Assassin V1.0",
              "operatingSystem": "Android, Web, Windows",
              "applicationCategory": "FinanceApplication",
              "description": "High-precision automated trading robot powered by PROEDGE EA by Tman Capitals. 5-Timeframe Machine Gunner scalping continuation and liquidity sweep reversal.",
              "offers": {
                "@type": "AggregateOffer",
                "priceCurrency": "ZAR",
                "lowPrice": "200",
                "highPrice": "600",
                "offerCount": "2"
              },
              "author": {
                "@type": "Person",
                "name": "Thabang Seake",
                "jobTitle": "Lead Mentor & Trader",
                "worksFor": {
                  "@type": "Organization",
                  "name": "Tman Capitals"
                }
              }
            }),
          }}
        />
      </head>
      <body className="bg-[#030811] text-slate-100 antialiased overflow-x-hidden min-h-screen">
        {children}
      </body>
    </html>
  );
}
