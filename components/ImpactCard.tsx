import { ClimateImpact } from '@/data/sspdata';
import React from 'react';


export const ImpactCard = ({
    id,
    warmingLevelC,
    sspRange,
    impacts
}: ClimateImpact) => {
  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Title Section */}
      <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
        Impact of Global Warming
      </h2>

      {/* Warming Level and SSP Range */}
      <div className="mb-4">
        <p className="text-xl text-gray-700">
          <span className="font-mono text-lg text-gray-500">Warming Level:</span> {warmingLevelC}°C
        </p>
        <p className="text-xl text-gray-700">
          <span className="font-mono text-lg text-gray-500">SSP Range:</span> {sspRange}
        </p>
      </div>

      {/* Impacts List */}
      <div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Potential Impacts:</h3>
        <ul className="list-inside pl-4 space-y-2 text-lg text-gray-600">
          {impacts.map((impact, index) => (
            <li key={index} className="flex items-start">
              <span className="text-amber-500 mr-2">•</span>
              <span>{impact}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
