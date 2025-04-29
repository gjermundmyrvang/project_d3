"use client"
import * as d3 from "d3";
import { Feature, FeatureCollection } from "geojson";
import { useState } from "react";


type MapProps = {
  width: number;
  height: number;
  data: FeatureCollection;
};

export const WorldMap = ({ width, height, data }: MapProps) => {
    const [tooltip, setTooltip] = useState<{ name: string; x: number; y: number } | null>(null);

    const projection = d3
      .geoNaturalEarth1()
      .scale(width / 2 / Math.PI)
      .center([0, 15]);
  
    const geoPathGenerator = d3.geoPath().projection(projection);

    const handleMouseEnter = (event: React.MouseEvent<SVGPathElement>, shape: Feature) => {
      const [x, y] = d3.pointer(event);
      const name = shape.properties?.name ?? shape.id ?? "Unknown";
      setTooltip({ name, x, y });
    };
  
    const handleMouseMove = (event: React.MouseEvent<SVGPathElement>) => {
      const [x, y] = d3.pointer(event);
      setTooltip((prev) => (prev ? { ...prev, x, y } : null));
    };
  
    const handleMouseLeave = () => {
      setTooltip(null);
    };
  
    const allSvgPaths = data.features
      .filter((shape) => shape.id !== 'ATA')
      .map((shape) => {
        const path = geoPathGenerator(shape);
        if (!path) return null;
        return (
          <path
            key={shape.id}
            d={path}
            stroke="lightGrey"
            strokeWidth={0.5}
            fill={"lightgrey"}
            fillOpacity={0.7}
            onMouseEnter={(e) => handleMouseEnter(e, shape)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />
        );
      });
  
    return (
      <div>
        <svg
          width={width}
          height={height}
        >
          {allSvgPaths}
        </svg>
        {tooltip && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x + 10,
            top: tooltip.y + 10,
            background: "black",
            color: "white",
            padding: "4px 8px",
            border: "1px solid gray",
            borderRadius: "4px",
            pointerEvents: "none",
            fontSize: "0.8rem",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          {tooltip.name}
        </div>
      )}
      </div>
    );
  };