import Navbar        from "@/components/shared/Navbar";
import Footer        from "@/components/shared/Footer";
import Hero          from "@/components/sections/Hero";
import SocialProof   from "@/components/sections/SocialProof";
import Problem       from "@/components/sections/Problem";
import Features      from "@/components/sections/Features";
import SavingsPreview from "@/components/sections/SavingsPreview";
import HowItWorks    from "@/components/sections/HowItWorks";
import CTA           from "@/components/sections/CTA";

export const metadata = {
  title: "SpendLens — AI Spend Audit for Startups",
  description:
    "Stop burning money on AI tools you're not using. SpendLens audits your entire AI stack in 60 seconds, finds wasted subscriptions and unused API credits, and tells you exactly what to cut.",
};

export default function Home() {
  
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <SocialProof />
        <Problem />
        <Features />
        <SavingsPreview />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
