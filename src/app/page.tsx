import { Hero } from "@/components/hero";
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
