import { Hero } from "@/components/hero";
import { ScrollEffects } from "@/components/scroll-effects";
import {
  Services,
  Work,
  Process,
  Pricing,
  Faq,
  Contact,
  Footer,
} from "@/components/sections";

export default function Home() {
  return (
    <main className="relative flex-1">
      <ScrollEffects />
      <Hero />
      <Services />
      <Work />
      <Process />
      <Pricing />
      <Faq />
      <Contact />
      <Footer />
    </main>
  );
}
