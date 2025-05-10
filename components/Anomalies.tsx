"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { useDimensions } from "@/utils/useDimensions";
import { useInView } from "@/lib/useInView";

type DataProps = {
  month: string;
  year: number;
  anomaly: number;
};

type YearDataProps = {
  year: number;
  min: number;
  max: number;
  mean: number;
};

type AnomalyProps = {
  width: number;
  height: number;
  data: DataProps[];
  grouped: YearDataProps[];
};

type TooltipProps = {
  x: number;
  y: number;
  year: number;
  min: number;
  max: number;
  mean: number;
};

const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };

export const AnomalyComponent = () => {
  const vizRef = useRef(null);
  const { width, height } = useDimensions(vizRef);
  const [byYearData, setByYearData] = useState<YearDataProps[] | null>(null);
  const [data, setData] = useState<DataProps[] | null>(null);

  useEffect(() => {
    readData();
  }, []);

  const readData = async () => {
    d3.csv("anomalies.csv", (d) => ({
      year: +d.year,
      anomaly: +d.anomaly,
      month: d.month,
    })).then((data) => {
      const grouped = Object.entries(
        data.reduce((acc, d) => {
          if (!acc[d.year]) {
            acc[d.year] = [];
          }
          acc[d.year].push(d.anomaly);
          return acc;
        }, {} as Record<number, number[]>)
      ).map(([year, values]) => ({
        year: +year,
        min: d3.min(values)!,
        max: d3.max(values)!,
        mean: d3.mean(values)!,
      }));

      setData(data);
      setByYearData(grouped);
    });
  };

  return (
    <div className="w-full max-w-7xl justify-center items-center mx-auto m-6 pb-10">
      <div className="w-full min-h-[60rem] relative" ref={vizRef}>
        {data && byYearData && (
          <Anomalies
            width={width}
            height={height}
            data={data}
            grouped={byYearData}
          />
        )}
        <Description />
      </div>
    </div>
  );
};

const Anomalies = ({ width, height, data, grouped }: AnomalyProps) => {
  const chartRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, 0.3);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;
  const [tooltipData, setTooltipData] = useState<TooltipProps | null>(null);

  // Y axis (temperature)
  const [yMin] = d3.extent(data, (d) => d.anomaly);
  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([yMin ?? 0, 1])
      .range([boundsHeight, 0]);
  }, [data, boundsHeight]);

  // X axis (years)
  const xScale = useMemo(() => {
    return d3
      .scaleBand()
      .domain(grouped.map((d) => d.year.toString()))
      .range([0, boundsWidth])
      .padding(0.2);
  }, [grouped, boundsWidth]);

  const colorScale = d3
    .scaleLinear<string>()
    .domain([-1, 0, 1])
    .range(["#78C7D6", "#f1faee", "#F84545"])
    .interpolate(d3.interpolateRgb);

  useEffect(() => {
    if (!isInView) return;
    createViz();
  }, [xScale, yScale, boundsHeight, isInView]);

  const lineData = grouped.map((d) => ({
    x: d.year,
    y: d.mean,
  }));
  const linePath = d3
    .line<{ x: number; y: number }>()
    .x((d) => xScale(d.x.toString())! + xScale.bandwidth() / 2) // center of each bar
    .y((d) => yScale(d.y))
    .curve(d3.curveMonotoneX);

  const createViz = () => {
    const svgElement = d3.select(chartRef.current);
    svgElement.selectAll("*").remove();
    const allYears = xScale.domain();
    const filteredYears = allYears.filter((_, i) => i % 10 === 0);
    const xAxis = d3.axisBottom(xScale).tickValues(filteredYears);
    const yAxis = d3.axisRight(yScale).ticks(6);
    svgElement
      .append("g")
      .attr("transform", "translate(0," + boundsHeight + ")")
      .call(xAxis)
      .call((g) => g.select(".domain").attr("stroke", "#fff"));

    svgElement
      .append("g")
      .attr("transform", `translate(${boundsWidth},0)`)
      .call(yAxis)
      .call((g) => {
        g.select(".domain").attr("stroke", "#ccc");
        g.selectAll(".tick line")
          .attr("stroke", "#ddd")
          .attr("x2", -boundsWidth)
          .attr("stroke-dasharray", "2,2");

        g.selectAll(".tick text")
          .attr("font-size", "12px")
          .attr("fill", "#666")
          .attr("dx", -5);
      });

    svgElement
      .selectAll("rect")
      .data(grouped)
      .enter()
      .append("rect")
      .on("mouseover", (event, d) => {
        const [x, y] = d3.pointer(event);
        setTooltipData({
          x: x,
          y: y,
          year: d.year,
          min: d.min,
          max: d.max,
          mean: d.mean,
        });
      })
      .on("mouseleave", () => {
        setTooltipData(null);
      })
      .attr("x", (d) => xScale(d.year.toString())!)
      .attr("width", xScale.bandwidth())
      .attr("y", (d) => yScale(d.min))
      .attr("height", 0)
      .attr("fill", (d) => colorScale(d.mean))
      .transition()
      .delay((_, i) => i * 30) // Delay per bar
      .duration(500)
      .ease(d3.easeCubicOut)
      .attr("y", (d) => yScale(d.max))
      .attr("height", (d) => yScale(d.min) - yScale(d.max));

    const path = svgElement
      .append("path")
      .datum(lineData)
      .attr("fill", "none")
      .attr("stroke", "#333")
      .attr("stroke-width", 2)
      .attr("d", linePath);

    const totalLength = path.node()?.getTotalLength() ?? 0;

    path
      .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(3000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);
  };

  return (
    <div ref={containerRef}>
      <svg width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          ref={chartRef}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        />
      </svg>
      {tooltipData && <Tooltip {...tooltipData} />}
      <Legend />
    </div>
  );
};

const Tooltip = ({ x, y, year, min, max, mean }: TooltipProps) => {
  return (
    <div
      className="absolute z-50 bg-black text-white px-2 py-1 border border-gray-500 rounded pointer-events-none shadow-md font-mono opacity-80"
      style={{ left: x + 50, top: y - 60 }}
    >
      <p className="text-md font-bold">{year}:</p>
      <p className="text-sm">Min: {min.toFixed(2)}°C</p>
      <p className="text-sm">Max: {max.toFixed(2)}°C</p>
      <p className="text-sm">Mean: {mean.toFixed(2)}°C</p>
    </div>
  );
};

const Description = () => {
  return (
    <div className="flex flex-col w-full max-w-4xl font-mono absolute top-5 left-0">
      <h2 className="mt-5 text-2xl font-semibold text-gray-800 mb-2">
        Temperature Anomalies Recorded From 1940-2025
      </h2>
      <p className="text-gray-700 leading-relaxed">
        The visualization on the right reveals an interesting pattern: from{" "}
        <strong>1940</strong> through the late <strong>1990s</strong>,
        temperature anomalies tended to stay in the negative range — meaning
        most years were cooler than the historical average.
        <br />
        However, around the year <strong>2000</strong>, this pattern reverses.
        The bars grow taller, shift into warmer colors, and rise increasingly
        above the zero line. This marks a clear and consistent trend toward{" "}
        <strong>positive temperature anomalies</strong> — months and years that
        are warmer than what we've seen historically.
        <br />
        This shift isn't subtle. It's abrupt and sustained, illustrating how
        climate change is not just a future projection — it's a transformation
        already embedded in the last two decades of data.
      </p>
    </div>
  );
};

const Legend = () => (
  <div className="flex flex-col sm:flex-row gap-4 text-sm mt-4 items-start sm:items-center">
    {/* Color Gradient Legend */}
    <div className="flex items-center gap-2">
      <div className="w-32 h-3 rounded bg-gradient-to-r from-[#78C7D6] via-[#f1faee] to-[#F84545]" />
      <span className="text-gray-700">Negative to Positive Anomaly</span>
    </div>

    {/* Line Path Legend */}
    <div className="flex items-center gap-2">
      <svg width="24" height="10">
        <path
          d="M 0 5 C 8 0, 16 10, 24 5"
          stroke="#333"
          strokeWidth="2"
          fill="none"
        />
      </svg>
      <span className="text-gray-700">Mean anomaly</span>
    </div>
  </div>
);
