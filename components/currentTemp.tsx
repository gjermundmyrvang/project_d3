"use client";
import { TemperatureData, temperatureData } from "@/data/globaltemps";
import { useInView } from "@/lib/useInView";
import { useDimensions } from "@/utils/useDimensions";
import * as d3 from "d3";
import React, { useEffect, useMemo, useRef, useState } from "react";

const data = temperatureData;
const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };

export const GlobalTempLatest = () => {
  const i = data.length - 1;
  const entry = data[i];
  const currentTemp = entry.noSmoothing;
  const year = entry.year;
  const chartRef = useRef<HTMLDivElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);

  const { width, height } = useDimensions(chartRef);
  console.log("Width and height currenttemps:", { width, height });
  return (
    <div className="grid grid-cols-[1fr_3fr_1fr] items-center gap-12 justify-center h-[20vh] border-b border-gray-200">
      <div className="flex flex-col items-center justify-center h-full w-full border-r border-gray-200">
        <h1 className="text-5xl font-bold text-slate-800 p-6 font-mono">
          Global Temperature History
        </h1>
      </div>

      <div ref={chartRef} className="flex justify-center w-full h-full">
        <GlobalTempChart
          width={width}
          height={height}
          data={data}
          cursorPosition={cursorPosition}
          setCursorPosition={setCursorPosition}
        />
      </div>

      <div className="flex flex-col items-center justify-center border-l border-gray-200 w-full h-full font-mono">
        <p className="text-6xl font-bold text-gray-900 mb-2">
          {currentTemp} <span className="text-9xl">°C</span>
        </p>
        <p className="text-xl font-extralight font-mono text-start">
          Per: <span className="text-blue-500">{year}</span>
        </p>
      </div>
    </div>
  );
};

type LineChartProps = {
  width: number;
  height: number;
  data: TemperatureData[];
  cursorPosition: number | null;
  setCursorPosition: (position: number | null) => void;
};

const GlobalTempChart = ({
  width,
  height,
  data,
  cursorPosition,
  setCursorPosition,
}: LineChartProps) => {
  const axesRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, 0.3);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Y axis (temperature)
  const [yMin, yMax] = d3.extent(data, (d) => d.noSmoothing);
  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([yMin ?? 0, yMax ?? 0])
      .range([boundsHeight, 0]);
  }, [data, height]);

  // X axis (years)
  const [xMin, xMax] = d3.extent(data, (d) => d.year);
  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([xMin ?? 0, xMax ?? 0])
      .range([0, boundsWidth]);
  }, [data, width]);

  // Build the line
  const lineBuilder = d3
    .line<TemperatureData>()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.noSmoothing));

  const lastTenYearsData = data.slice(-10);
  const fullLinePath = lineBuilder(data);
  const lastTenPath = lineBuilder(lastTenYearsData);

  const lineBuilder2 = d3
    .line<TemperatureData>()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.lowess5));

  const linePathLow = lineBuilder2(data);

  useEffect(() => {
    if (!isInView) return;
    console.log("Is in view");
    const svgElement = d3.select(axesRef.current);
    svgElement.selectAll("*").remove();
    const xAxisGen = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    svgElement
      .append("g")
      .attr("transform", "translate(0," + boundsHeight + ")")
      .call(xAxisGen)
      .selectAll("text")
      .style("opacity", 0)
      .transition()
      .duration(1000)
      .style("opacity", 1);

    const yAxisGen = d3.axisLeft(yScale);
    svgElement
      .append("g")
      .call(yAxisGen)
      .selectAll("text")
      .style("opacity", 0)
      .transition()
      .duration(1000)
      .style("opacity", 1);

    // --- FULL LINE ---
    const fullPath = svgElement
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "#7A7A7A")
      .attr("stroke-width", 2)
      .attr("d", fullLinePath);

    const fullLength = fullPath.node()?.getTotalLength() ?? 0;

    fullPath
      .attr("stroke-dasharray", `${fullLength} ${fullLength}`)
      .attr("stroke-dashoffset", fullLength)
      .transition()
      .duration(3000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);

    // --- LOW LINE ---
    const lowPath = svgElement
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "#F76F00")
      .attr("stroke-width", 2)
      .attr("d", linePathLow);

    const lowLength = lowPath.node()?.getTotalLength() ?? 0;

    lowPath
      .attr("stroke-dasharray", `${lowLength} ${lowLength}`)
      .attr("stroke-dashoffset", lowLength)
      .transition()
      .delay(500) // optional delay
      .duration(2500)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);

    // --- LAST TEN LINE ---
    const lastTen = svgElement
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "#e63946")
      .attr("stroke-width", 4)
      .attr("d", lastTenPath);

    const lastTenLength = lastTen.node()?.getTotalLength() ?? 0;

    lastTen
      .attr("stroke-dasharray", `${lastTenLength} ${lastTenLength}`)
      .attr("stroke-dashoffset", lastTenLength)
      .transition()
      .delay(3000)
      .duration(2000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);
  }, [xScale, yScale, boundsHeight, isInView]);

  const getClosestPoint = (cursorPixelPosition: number) => {
    const x = xScale.invert(cursorPixelPosition);

    let minDistance = Infinity;
    let closest: TemperatureData | null = null;

    for (const point of data) {
      const distance = Math.abs(point.year - x);
      if (distance < minDistance) {
        minDistance = distance;
        closest = point;
      }
    }

    return closest;
  };

  const onMouseMove = (e: React.MouseEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    const closest = getClosestPoint(mouseX);

    setCursorPosition(xScale(closest?.year ?? 0));
  };

  return (
    <div ref={containerRef} className="relative z-15">
      <svg width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          ref={axesRef}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        >
          {cursorPosition && (
            <Cursor
              x={cursorPosition}
              y={yScale(getClosestPoint(cursorPosition)?.noSmoothing ?? 0)}
              data={getClosestPoint(cursorPosition)}
            />
          )}

          <rect
            x={0}
            y={0}
            width={boundsWidth}
            height={boundsHeight}
            onMouseMove={onMouseMove}
            onMouseLeave={() => setCursorPosition(null)}
            visibility={"hidden"}
            pointerEvents={"all"}
          />
        </g>
        <g
          width={boundsWidth}
          height={boundsHeight}
          ref={axesRef}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        />
      </svg>
      {fullLinePath && <Annotation />}
    </div>
  );
};

type CursorProps = {
  x: number;
  y: number;
  data: TemperatureData | null;
};

const Cursor = ({ x, y, data }: CursorProps) => {
  const boxWidth = 180;
  const boxHeight = 100;

  const adjustedX = Math.max(0, x - boxWidth);
  const adjustedY = Math.max(0, y - boxHeight - 10);
  return (
    <>
      <circle
        cx={x}
        cy={y}
        r={6}
        fill="red"
        stroke="#1d1d1d"
        strokeWidth={1}
        opacity={0.8}
      />
      {data && (
        <foreignObject
          x={adjustedX}
          y={adjustedY}
          width={boxWidth}
          height={boxHeight}
        >
          <div className="bg-black opacity-70 text-white p-2 rounded-md text-sm z-10 font-mono">
            <strong>{data.year}</strong>
            <br />
            <p>Mean: {data.noSmoothing} °C</p>
            <p>Lowess: {data.lowess5} °C</p>
          </div>
        </foreignObject>
      )}
    </>
  );
};

const Annotation = () => {
  return (
    <div className="absolute bottom-15 right-5 w-80 -z-10 italic text-sm">
      <h3 className="text-red-600 font-light">
        Last ten years have been the warmest in history
      </h3>
      <div className="flex space-x-3.5">
        <p style={{ color: "#7A7A7A" }}>Annual mean</p>
        <p style={{ color: "#F76F00" }}>Lowess Smoothing</p>
      </div>
    </div>
  );
};
