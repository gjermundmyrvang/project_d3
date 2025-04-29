import { GlobalTempLatest } from "@/components/currentTemp";
import { StickyContainer } from "@/components/stickyContainer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <GlobalTempLatest />
      <StickyContainer />
    </div>
  );
}
