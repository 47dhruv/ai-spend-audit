import "./globals.css";

export const metadata = {
  title: "SpendLens — AI Spend Audit for Startups",
  description:
    "Stop burning money on AI tools you're not using. SpendLens audits your entire AI stack in 60 seconds, finds wasted subscriptions and unused API credits, and tells you exactly what to cut.",
  keywords: ["AI spend", "SaaS audit", "ChatGPT cost", "OpenAI bill", "startup savings"],
  openGraph: {
    title: "SpendLens — AI Spend Audit for Startups",
    description: "Find and cut wasted AI subscriptions in 60 seconds.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <head>
        {/*
          Load Google Fonts at runtime (browser-side) — no build-time network
          request required. Works offline: system fonts are the graceful fallback.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        {/* CSS font variable definitions — fallback to system fonts if CDN unavailable */}
        <style>{`
          :root {
            --font-syne: 'Syne', system-ui, sans-serif;
            --font-dm:   'DM Sans', system-ui, sans-serif;
            --font-mono: 'JetBrains Mono', ui-monospace, 'Cascadia Code', monospace;
          }
          body { font-family: var(--font-dm); }
        `}</style>
      </head>
      <body className="min-h-full flex flex-col bg-[#050507] text-white">
        {children}
      </body>
    </html>
  );
}
