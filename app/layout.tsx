import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";

export const metadata: Metadata = {
  title: "Watermelon SMP | Minecraft Server",
  description: "Join Watermelon SMP - A fun Minecraft Java server with custom plugins and an amazing community. IP: watermelon.deze.me",
  keywords: ["minecraft", "server", "smp", "java", "watermelon", "gaming"],
  openGraph: {
    title: "Watermelon SMP | Minecraft Server",
    description: "Join Watermelon SMP - A fun Minecraft Java server with custom plugins and an amazing community.",
    type: "website",
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
