import { AnomalyComponent } from "@/components/Anomalies";
import { ContributionMap } from "@/components/ContributionMap";
import { GlobalTempLatest } from "@/components/currentTemp";
import { RiverComponent } from "@/components/RiverComponent";
import { SeaLevel } from "@/components/SeaLevel";
import { WelcomeScreen } from "@/components/WelcomeScreen";

export default function Home() {
  return (
    <div className="min-h-screen">
      <WelcomeScreen />
      <div className="relative h-[50vh]">
        <div className="sticky top-0">
          <GlobalTempLatest />
        </div>
      </div>
      <div className="relative h-[150vh]">
        <div className="sticky top-0">
          <AnomalyComponent />
        </div>
      </div>
      <ContributionMap />
      <RiverComponent />
      <SeaLevel />
    </div>
  );
}
