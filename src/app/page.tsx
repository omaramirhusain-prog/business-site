import { Hero } from "@/components/hero";
import { ProcessFilm } from "@/components/process-film";
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
      <ProcessFilm />
      <TrustStrip />
      <Services />
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
