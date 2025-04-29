"use client";
import * as d3 from "d3";
import { Feature, FeatureCollection } from "geojson";
import { useEffect, useRef, useState } from "react";

type MapProps = {
  width: number;
  height: number;
  data: FeatureCollection;
};

export const WorldMap = ({ width, height, data }: MapProps) => {
  const [tooltip, setTooltip] = useState<{
    name: string;
    x: number;
    y: number;
  } | null>(null);
  const svgRef = useRef(null);
  const gRef = useRef(null);

  const svgHeight = width / 2;

  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        d3.select(gRef.current).attr("transform", event.transform.toString());
      });

    d3.select<SVGSVGElement, unknown>(svgRef.current).call(zoom);
  }, []);

  const projection = d3
    .geoNaturalEarth1()
    //.scale(width / 2 / Math.PI)
    .center([0, 0]);

  const geoPathGenerator = d3.geoPath().projection(projection);

  const handleMouseEnter = (
    event: React.MouseEvent<SVGPathElement>,
    shape: Feature
  ) => {
    const x = event.clientX + window.scrollX;
    const y = event.clientY + window.scrollY;
    const name = shape.properties?.name ?? shape.id ?? "Unknown";
    setTooltip({ name, x, y });
  };

  const handleMouseMove = (event: React.MouseEvent<SVGPathElement>) => {
    const x = event.clientX + window.scrollX;
    const y = event.clientY + window.scrollY;
    setTooltip((prev) => (prev ? { ...prev, x, y } : null));
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  const allSvgPaths = data.features
    //.filter((shape) => shape.id !== 'ATA')
    .map((shape) => {
      const path = geoPathGenerator(shape);
      if (!path) return null;
      return (
        <path
          key={shape.id}
          d={path}
          stroke="lightGrey"
          strokeWidth={0.5}
          fill={"black"}
          fillOpacity={0.7}
          onMouseEnter={(e) => handleMouseEnter(e, shape)}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
      );
    });

  return (
    <div>
      <svg width={width} height={height} ref={svgRef}>
        <g ref={gRef}>{allSvgPaths}</g>
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
