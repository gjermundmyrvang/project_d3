"use client";
import React, { useRef, useState } from "react";
import { WorldMap } from "./Map";
import { mapdata } from "@/data/mapdata";
import { useDimensions } from "@/utils/useDimensions";
import {
  SSPFactors,
  sspProfiles,
  SSPQuestion,
  sspQuestions,
} from "@/data/sspdata";

const data = mapdata;
const sspProfileData = sspProfiles;
const sspQuestionsData = sspQuestions;
export const UserControl = () => {
  const mapRef = useRef(null);
  const { width, height } = useDimensions(mapRef);
  const [userInput, setUserInput] = useState<SSPFactors>({
    fossilFuelUse: 0.3,
    cooperation: 0.5,
    techDevelopment: 0.7,
    sustainabilityFocus: 0.8,
    equity: 0.9,
  });

  const closestSSP = getClosestSSP(userInput);

  return (
    <div className="grid grid-cols-2 w-full min-h-[30rem] border-t border-gray-200">
      <div className="w-full border-r border-gray-200 relative">
        <div className="p-8">
          {sspQuestionsData.map((question: SSPQuestion) => (
            <QuestionSlider
              sspQuestion={question}
              key={question.qid}
              value={userInput[question.qid]}
              onChange={(newValue) =>
                setUserInput((prev) => ({ ...prev, [question.qid]: newValue }))
              }
            />
          ))}
        </div>
        <div className="absolute top-8 right-8">
          <h1>Closest: {closestSSP}</h1>
        </div>
      </div>
      <div ref={mapRef} className="w-full h-full">
        <WorldMap width={width} height={height} data={data} />
      </div>
    </div>
  );
};

type QuestionSliderProps = {
  sspQuestion: SSPQuestion;
  value: number;
  onChange: (value: number) => void;
};

const QuestionSlider = ({
  sspQuestion,
  value,
  onChange,
}: QuestionSliderProps) => {
  return (
    <div className="w-full flex flex-col justify-start mt-5">
      <div className="flex flex-col max-w-2xl">
        <h1 className="text-lg font-light font-mono mb-2">
          {sspQuestion.question}
        </h1>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="custom-slider w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <div className="flex w-full justify-between">
          {sspQuestion.labels.map((l) => (
            <p key={l} className="text-xs mt-1 text-gray-600font-mono">
              {l}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

const factorWeights: Record<keyof SSPFactors, number> = {
  fossilFuelUse: 1.5,
  cooperation: 1.2,
  techDevelopment: 1.0,
  sustainabilityFocus: 1.3,
  equity: 1.0,
};

const getClosestSSP = (input: SSPFactors): string => {
  let closestSSP = "";
  let minDistance = Infinity;

  for (const [ssp, profile] of Object.entries(sspProfiles)) {
    const dist = Object.keys(profile).reduce((sum, key) => {
      const k = key as keyof SSPFactors;
      const weight = factorWeights[k] || 1;
      return sum + weight * Math.abs(profile[k] - input[k]);
    }, 0);

    if (dist < minDistance) {
      minDistance = dist;
      closestSSP = ssp;
    }
  }

  return closestSSP;
};
