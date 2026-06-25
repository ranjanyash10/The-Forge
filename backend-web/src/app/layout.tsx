import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "THE FORGE | Living RPG Operating System",
  description: "Forge your legend. Transform real-life actions into progression, skills, levels, and epic weekly chronicles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Outfit:wght@300;400;600;800&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col items-center bg-[#02040a] selection:bg-purple-500/30 selection:text-purple-200">
        {/* Decorative elements */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[120px]" />
        </div>
        
        {/* Core Content Container - Centered and mobile-framed on desktop */}
        <div className="relative z-10 w-full max-w-md md:max-w-2xl min-h-screen flex flex-col bg-[#05070f]/90 md:border-x border-purple-900/20 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          {children}
        </div>
      </body>
    </html>
  )
}
