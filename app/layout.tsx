import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { AppToaster } from "./components/ToasterProvider";

const bricolage_grotesque = Bricolage_Grotesque({
  variable: "--font-bricolage_grotesque",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "shutupnrave | Tech Rave",
  description:
    "shutupnrave is a seamless ticketing platform for tech raves. Secure your spot, manage your tickets, and experience the future of event access at shutupnrave.com.ng.",
  metadataBase: new URL("https://shutupnrave.com.ng/"),
  keywords: [
    "shutupnrave",
    "tech rave",
    "ticketing platform",
    "event tickets",
    "rave tickets",
    "online ticketing",
    "event management",
    "shutupnrave.com.ng",
    "music event",
    "tech event",
    "buy tickets online"
  ],
  authors: [{ name: "shutupnrave", url: "https://shutupnrave.com.ng" }],
  creator: "shutupnrave",
  publisher: "shutupnrave",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://shutupnrave.com.ng/",
    siteName: "shutupnrave",
    title: "shutupnrave | Tech Rave",
    description:
      "shutupnrave is a seamless ticketing platform for tech raves. Secure your spot, manage your tickets, and experience the future of event access at shutupnrave.com.ng.",
    images: [
      {
        url: "https://res.cloudinary.com/dpesanzkk/image/upload/v1751714360/shutupnrave.purple_wo1mkz.jpg",
        width: 1200,
        height: 630,
        alt: "shutupnrave - Tech Rave",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "shutupnrave | Tech Rave",
    description: "shutupnrave is a seamless ticketing platform for tech raves. Secure your spot, manage your tickets, and experience the future of event access at shutupnrave.com.ng.",
    images: [
      "https://res.cloudinary.com/dpesanzkk/image/upload/v1751714360/shutupnrave.purple_wo1mkz.jpg", 
    ],
    creator: "@shutupnrave", // Replace with actual Twitter handle if available
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://shutupnrave.com.ng",
  },
  verification: {
    google: "0RedIG2udrstn2g8sTXtJDc3cZuS2__-8lUZ6x65EXU", // Replace with actual verification code https://search.google.com/search-console/welcome
    yandex: "your-yandex-verification", // Replace with actual verification code
    yahoo: "your-yahoo-verification", // Replace with actual verification code
  },
};

export const viewport: Viewport = {
  themeColor: "#FDC700",
  initialScale: 1,
  width: "device-width",
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${bricolage_grotesque.variable} antialiased`}>
        <main className="mx-auto max-w-[90rem]">
          {children}
        </main>
        <AppToaster />
      </body>
    </html>
  );
}
