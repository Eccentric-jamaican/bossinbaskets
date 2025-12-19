import Hero from "@/components/site/Hero";
import Nav from "@/components/site/nav";
import BossPicks from "@/components/site/BossPicks";
import SeasonSection from "@/components/site/SeasonSection";
import HowItWorks from "@/components/site/HowItWorks";
import Testimonials from "@/components/site/Testimonials";
import FAQ from "@/components/site/FAQ";
import Newsletter from "@/components/site/Newsletter";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden font-sans">
      <Nav />
      <main className="flex-1">
        <Hero />
        <BossPicks />
        <HowItWorks />
        <Testimonials />
        <SeasonSection />
        <FAQ />
        <Newsletter />
      </main>
    </div>
  );
}
