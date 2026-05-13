import type { Metadata } from "next";
import { Caveat } from "next/font/google";
import "./globals.css";

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sassymartie.com"),
  title: "SassyMartie | The Thrift Store for Software",
  description: "A discovery hub for indie SaaS tools built by real people. No VC. No pitch. Just real tools for real problems.",
  keywords: ["indie saas", "saas directory", "software thrift store", "solo founder", "ai tools"],
  openGraph: {
    title: "SassyMartie | The Thrift Store for Software",
    description: "A discovery hub for indie SaaS tools built by real people. No VC. No pitch. Just real tools for real problems.",
    url: "https://sassymartie.com",
    siteName: "SassyMartie",
    images: [
      {
        url: "/brand/logo.png",
        width: 444,
        height: 132,
        alt: "SassyMartie Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SassyMartie | The Thrift Store for Software",
    description: "A discovery hub for indie SaaS tools built by real people. No VC. No pitch. Just real tools for real problems.",
    images: ["/brand/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'SassyMartie',
  url: 'https://sassymartie.com',
  logo: 'https://sassymartie.com/brand/logo.png',
  description: 'A discovery hub for indie SaaS tools built by real people with real problems.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
