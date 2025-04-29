"use client"
import { TemperatureData, temperatureData } from '@/data/globaltemps'
import { useDimensions } from '@/utils/useDimensions'
import * as d3 from "d3"
import React, { useEffect, useMemo, useRef, useState } from 'react'

const data = temperatureData
const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };

// TODO: Highlight the big increase in temp last years on the graph
// TODO: Get users age and highlight graph.year >= user.age

export const GlobalTempLatest = () => {
    const i = data.length - 1
    const entry = data[i]
    const currentTemp = entry.noSmoothing
    const year = entry.year
    const chartRef = useRef<HTMLDivElement>(null);
    const [cursorPosition, setCursorPosition] = useState<number | null>(null);

    const { width, height } = useDimensions(chartRef);
    console.log("Width and height:", {width, height})
  return (
    <div className="grid grid-cols-[1fr_3fr_1fr] items-center gap-12 justify-center h-[20vh] border-b border-gray-200">
      <div className='flex items-center h-full w-full border-r border-gray-200'>
        <h1 className="text-5xl text-center font-extrabold text-slate-800 tracking-wide">The Global Temperature</h1>
      </div>

    <div ref={chartRef} className="flex justify-center w-full h-full">
      <GlobalTempChart width={width} height={height} data={data} cursorPosition={cursorPosition} setCursorPosition={setCursorPosition} />
    </div>

    <div className="flex flex-col items-center justify-center border-l border-gray-200 w-full h-full">
      <p className="text-6xl font-bold text-gray-900 mb-2">{currentTemp} <span className="text-9xl font-800">°C</span></p>
      <p className="text-xl font-extralight font-mono">Per: <span className="text-blue-500">{year}</span></p>
    </div>
</div>
  )
}


type LineChartProps = {
  width: number;
  height: number;
  data: TemperatureData[];
  cursorPosition: number | null;
  setCursorPosition: (position: number | null) => void;
};


const GlobalTempChart = ({width, height, data, cursorPosition,
  setCursorPosition}: LineChartProps) => {
  const axesRef = useRef(null);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Y axis (temperature)
  const [yMin, yMax] = d3.extent(data, (d) => d.noSmoothing);
  console.log("Min and max temp: ", {yMin, yMax})
  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([yMin ?? 0, yMax ?? 0])
      .range([boundsHeight, 0]);
  }, [data, height]);

  // X axis (years)
  const [xMin, xMax] = d3.extent(data, (d) => d.year);
  console.log("Min and max year: ", {xMin, xMax})

  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([xMin ?? 0, xMax ?? 0])
      .range([0, boundsWidth]);
  }, [data, width]);

  useEffect(() => {
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
    svgElement.append("g").call(yAxisGen).selectAll("text")
    .style("opacity", 0)
    .transition()
    .duration(1000)
    .style("opacity", 1);

  }, [xScale, yScale, boundsHeight]);


    // Build the line
    const lineBuilder = d3
      .line<TemperatureData>()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.noSmoothing))
      const linePath = lineBuilder(data);
      if (!linePath) {
        return null;
      }

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
    <div>
      <svg width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        >
          <path
            d={linePath}
            opacity={1}
            stroke="#000"
            fill="none"
            strokeWidth={2}
          />
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
    </div>
  )
}

type CursorProps = {
  x: number;
  y: number;
  data: TemperatureData | null;
};

const Cursor = ({ x, y, data }: CursorProps) => {
  return (
    <>
      
      <circle
        cx={x}
        cy={y}
        r={6} 
        fill="pink"
        stroke="#ff8c00" 
        strokeWidth={2}
        opacity={0.8}
      />

      {/* Tooltip that shows when data is available */}
      {data && (
        <foreignObject x={x - 50} y={y - 100} width={180} height={80}>
        <div
          className="bg-black opacity-70 text-white p-2 rounded-md text-lg z-10 font-mono"
        >
          <strong>{data.year}</strong>
          <br />
          Temp: {data.noSmoothing} °C
        </div>
      </foreignObject>
      )}
    </>
  );
};