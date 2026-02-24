import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://thehardwareguru.cz'), // Změň na svou doménu
  title: {
    default: "TheHardwareGuru | 45yo Gamer Geek & AI Streaming",
    template: "%s | TheHardwareGuru"
  },
  description: "Exkluzivní hardware recenze, real gameplay a první CZ/SK stream s aktivním AI divákem. Sleduj TheHardwareGuru živě na Kicku!",
  keywords: ["TheHardwareGuru", "hardware guru", "kick streamer cz", "ai streamer", "rtx 5090 recenze", "gaming pc sestavy", "borderlands 4 cz"],
  authors: [{ name: "TheHardwareGuru" }],
  creator: "TheHardwareGuru",
  publisher: "TheHardwareGuru",
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
  openGraph: {
    title: "TheHardwareGuru | Gaming & Hardware Hub",
    description: "45yo Gamer Geek. Real Gameplay. První CZ/SK stream s aktivním AI divákem.",
    url: "https://thehardwareguru.cz",
    siteName: "TheHardwareGuru",
    locale: "cs_CZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TheHardwareGuru | Gaming & Hardware Hub",
    description: "Hardware, gaming a AI v přímém přenosu.",
    creator: "@thehardwareguru", // Pokud máš twitter
  },
  icons: {
    icon: "/favicon.ico", // Pokud máš faviconu v public
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className="scroll-smooth" suppressHydrationWarning={true}>
      <body className={`${inter.className} bg-[#050505] text-white antialiased min-h-screen flex flex-col selection:bg-[#53fc18] selection:text-black`}>
        {children}
      </body>
    </html>
  );
}