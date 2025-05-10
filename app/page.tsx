import { AnomalyComponent } from "@/components/Anomalies";
import { ContributionMap } from "@/components/ContributionMap";
import { GlobalTempLatest } from "@/components/currentTemp";
import { References } from "@/components/References";
import { RiverComponent } from "@/components/RiverComponent";
import { SeaLevel } from "@/components/SeaLevel";
import { Sidebar } from "@/components/Sidebar";
import { Sticky } from "@/components/ui/Sticky";
import { WelcomeScreen } from "@/components/WelcomeScreen";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="flex-1 pl-48">
        <section id="welcome">
          <WelcomeScreen />
        </section>
        <section id="temp">
          <Sticky margin={50}>
            <GlobalTempLatest />
          </Sticky>
        </section>
        <section id="anomaly">
          <Sticky margin={150}>
            <AnomalyComponent />
          </Sticky>
        </section>
        <section id="map">
          <Sticky margin={150} bg="bg-black">
            <ContributionMap />
          </Sticky>
        </section>
        <section id="river">
          <Sticky margin={150}>
            <RiverComponent />
          </Sticky>
        </section>
        <section id="sea">
          <Sticky margin={150} bg="bg-slate-950">
            <SeaLevel />
          </Sticky>
        </section>
        <section id="references">
          <References />
        </section>
      </main>
    </div>
  );
}
