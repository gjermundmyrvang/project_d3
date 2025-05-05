import { AnomalyComponent } from "@/components/Anomalies";
import { ContributionMap } from "@/components/ContributionMap";
import { GlobalTempLatest } from "@/components/currentTemp";
import { References } from "@/components/References";
import { RiverComponent } from "@/components/RiverComponent";
import { SeaLevel } from "@/components/SeaLevel";
import { Sticky } from "@/components/ui/Sticky";
import { WelcomeScreen } from "@/components/WelcomeScreen";

export default function Home() {
  return (
    <div className="min-h-screen">
      <WelcomeScreen />
      <Sticky margin={150}>
        <GlobalTempLatest />
      </Sticky>
      <Sticky margin={150}>
        <AnomalyComponent />
      </Sticky>
      <Sticky margin={150} bg="bg-black">
        <ContributionMap />
      </Sticky>
      <Sticky margin={150}>
        <RiverComponent />
      </Sticky>
      <Sticky margin={150} bg="bg-slate-950">
        <SeaLevel />
      </Sticky>
      <References />
    </div>
  );
}
