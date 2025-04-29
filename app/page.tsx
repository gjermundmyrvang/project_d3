import { GlobalTempLatest } from "@/components/currentTemp";
import { StickyContainer } from "@/components/stickyContainer";
import { UserControl } from "@/components/UserControl";

export default function Home() {  
  return (
    <div className="min-h-screen">
      <GlobalTempLatest />
      <StickyContainer />
      <UserControl />
    </div>
  );
}
