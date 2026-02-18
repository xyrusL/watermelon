import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";
import ClientEnhancements from "./components/ClientEnhancements";

export const metadata: Metadata = {
  metadataBase: new URL("https://watermelon.deze.me"),
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  alternates: {
    canonical: "https://watermelon.deze.me",
  },
  title: "Watermelon SMP | Minecraft Server",
  description:
    "Watermelon SMP is a Filipino Minecraft server and pinoy SMP server with custom plugins, community gameplay, and survival adventures.",
  keywords: [
    "filipino minecraft server",
    "minecraft server",
    "pinoy smp server",
    "watermelon smp",
    "minecraft smp philippines",
    "philippines minecraft server",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Watermelon SMP | Minecraft Server",
    description:
      "Join Watermelon SMP, a Filipino Minecraft server and pinoy SMP server with custom plugins and friendly community gameplay.",
    type: "website",
    url: "https://watermelon.deze.me",
    siteName: "Watermelon SMP",
    images: [
      {
        url: "/watermelon.svg",
        width: 512,
        height: 512,
        alt: "Watermelon SMP Logo",
      },
      {
        url: "/minecraft-bg.jpg",
        width: 1920,
        height: 1080,
        alt: "Watermelon SMP Background",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Watermelon SMP | Minecraft Server",
    description:
      "Filipino Minecraft server and pinoy SMP server with custom plugins and survival adventures.",
    images: ["/minecraft-bg.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="antialiased" suppressHydrationWarning>
          {children}
          <ClientEnhancements />
        </body>
      </html>
    </ClerkProvider>
  );
}
