"use client"
import { GlobalTempLatest } from "@/components/currentTemp";
import { WorldMap } from "@/components/Map";
import { StickyContainer } from "@/components/stickyContainer";
import { mapdata } from "@/data/mapdata";
import { useDimensions } from "@/utils/useDimensions";
import { useRef } from "react";

const data = mapdata

export default function Home() {
  const mapRef = useRef(null);
  const { width, height } = useDimensions(mapRef);
  console.log("Width and height page: ", {width, height})
  
  
  return (
    <div className="min-h-screen">
      <GlobalTempLatest />
      <StickyContainer />
      <div className="grid grid-cols-2 w-full min-h-[30rem] border-t-2 border-gray-100">
        <div className="w-full border-r-2 border-gray-100"></div>
        <div ref={mapRef} className="w-full h-full">
          <WorldMap width={width} height={height} data={data} />
        </div>
      </div>
    </div>
  );
}
