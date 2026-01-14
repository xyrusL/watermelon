import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";

export const metadata: Metadata = {
  title: "Watermelon SMP | Minecraft Server",
  description: "A cozy Minecraft server with custom plugins and endless adventures",
  keywords: ["minecraft", "server", "smp", "java", "watermelon", "gaming"],
  openGraph: {
    title: "Watermelon SMP | Minecraft Server",
    description: "A cozy Minecraft server with custom plugins and endless adventures",
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
    description: "A cozy Minecraft server with custom plugins and endless adventures",
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
        <body className="antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
