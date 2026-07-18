import { Hero } from "@/components/hero";
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
