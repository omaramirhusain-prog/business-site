import { CinematicFilm } from "@/components/cinematic-film";
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
      <CinematicFilm />
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
