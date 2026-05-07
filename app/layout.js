import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

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
      className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#080808] text-white">
        {children}
      </body>
    </html>
  );
}
