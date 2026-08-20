import { SiteNav } from "@/components/SiteNav";
import { Hero } from "@/components/Hero";
import { EventBanner } from "@/components/EventBanner";
import { StatsBar } from "@/components/StatsBar";
import { Events } from "@/components/Events";
import { CreatorProgram } from "@/components/CreatorProgram";
import { Sponsors } from "@/components/Sponsors";
import { About } from "@/components/About";
import { Leadership } from "@/components/Leadership";
import { ContactFooter } from "@/components/ContactFooter";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <SiteNav />
      <Hero />
      <EventBanner />
      <StatsBar />
      <Events />
      <CreatorProgram />
      <Sponsors />
      <About />
      <Leadership />
      <ContactFooter />
    </main>
  );
}
