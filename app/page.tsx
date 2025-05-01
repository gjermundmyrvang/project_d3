import { AnomalyComponent } from "@/components/Anomalies";
import { ContributionMap } from "@/components/ContributionMap";
import { GlobalTempLatest } from "@/components/currentTemp";
import { StickyContainer } from "@/components/stickyContainer";
import { UserControl } from "@/components/UserControl";
import { RiverComponent } from "@/components/RiverComponent";
import { SeaLevel } from "@/components/SeaLevel";
import { WelcomeScreen } from "@/components/WelcomeScreen";

export default function Home() {  
  return (
    <div className="min-h-screen">
      <GlobalTempLatest />
      <StickyContainer />
      <UserControl />
      <WelcomeScreen />
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
