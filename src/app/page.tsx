import { Hero } from "@/components/hero";
import { CarShowcase } from "@/components/car-showcase";
import { DetailingJourney } from "@/components/detailing-journey";
import {
  Contact,
  Faq,
  Footer,
  Pricing,
  PromiseSection,
  Results,
  Reviews,
  Services,
  TrustStrip,
} from "@/components/sections";

export default function Home() {
  return (
    <main className="relative flex-1">
      <Hero />
      <CarShowcase />
      <TrustStrip />
      <Services />
      <DetailingJourney />
      <Results />
      <Reviews />
      <Pricing />
      <PromiseSection />
      <Faq />
      <Contact />
      <Footer />
    </main>
  );
}
