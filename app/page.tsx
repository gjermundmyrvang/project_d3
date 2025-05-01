import { AnomalyComponent } from "@/components/Anomalies";
import { ContributionMap } from "@/components/ContributionMap";
import { GlobalTempLatest } from "@/components/currentTemp";
import { StickyContainer } from "@/components/stickyContainer";
import { UserControl } from "@/components/UserControl";
import { SeaLevel } from "@/components/SeaLevel";

export default function Home() {  
  return (
    <div className="min-h-screen">
      <GlobalTempLatest />
      <StickyContainer />
      <UserControl />
      <div className="relative h-[150vh]">
        <div className="sticky top-0">
          <AnomalyComponent />
        </div>
      </div>
      <ContributionMap />
      <SeaLevel />
    </div>
  );
}
