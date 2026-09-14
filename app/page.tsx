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
import { getEventSettings } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export default async function Home() {
  let settings;
  try {
    settings = await getEventSettings();
  } catch (err) {
    console.warn("Could not load dynamic settings for Home page:", err);
  }

  return (
    <main className="min-h-screen bg-white w-full max-w-full overflow-x-clip">
      <SiteNav />
      <Hero />
      <EventBanner settings={settings} />
      <StatsBar />
      <Events settings={settings} />
      <CreatorProgram />
      <Sponsors />
      <About />
      <Leadership />
      <ContactFooter />
    </main>
  );
}
