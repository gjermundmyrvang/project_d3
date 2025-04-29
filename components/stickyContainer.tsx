"use client";
import React from "react";
import { StickyScroll } from "./ui/sticky-scroll-reveal";
import { ClimateImpact, sspImpacts } from "@/data/sspdata";

const sspImpactsData: ClimateImpact[] = sspImpacts

const sspDescriptions = sspImpactsData.map((impact) => ({
  ssp: impact.id,
  title: impact.sspRange,
  description: impact.description,
  content: (
    <div className="flex flex-col p-6 w-full">
      <div className="mb-6">
        <p className="text-lg font-semibold text-gray-800">
          Warming Level:{" "}
          <span className="text-xl">{impact.warmingLevelC} °C</span>
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Impacts:</h3>
        <ul className="list-disc pl-6 text-md text-gray-600">
          {impact.impacts.map((impactItem, index) => (
            <li key={index}>{impactItem}</li>
          ))}
        </ul>
      </div>
    </div>
  ),
}));

export function StickyContainer() {
  return (
    <div className="w-full">
      <div className="flex w-full max-w-5xl items-center justify-between mx-auto mt-20">
        <h1 className="font-bold text-2xl">What kind of future are we facing?</h1>
        <h1 className="font-bold text-2xl">What are the impacts on the globe?</h1>
      </div>
      <StickyScroll content={sspDescriptions} />
    </div>
  );
}
