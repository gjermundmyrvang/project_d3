"use client";
import { useDimensions } from "@/utils/useDimensions";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { useInView } from "@/lib/useInView";

type RiverDataProps = {
  year: number;
  min: number;
  max: number;
  mean: number;
};

const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };

export const RiverComponent = () => {
  const riverRef = useRef(null);
  const { width, height } = useDimensions(riverRef);
  const [antarctica, setAntarctica] = useState<RiverDataProps[] | null>(null);
  const [greenland, setGreenland] = useState<RiverDataProps[] | null>(null);

  useEffect(() => {
    readAnt("/antarctica.csv");
    readGreen("/greenland.csv");
  }, []);

  const readAnt = async (file: string) => {
    d3.csv(file, (d) => ({
      country: d.country,
      year: +d.year,
      change: +d.change,
    })).then((data) => {
      const parsed = Object.entries(
        data.reduce((acc, d) => {
          acc[d.year] ??= [];
          acc[d.year].push(d.change);
          return acc;
        }, {} as Record<number, number[]>)
      ).map(([year, values]) => ({
        year: +year,
        min: d3.min(values)!,
        max: d3.max(values)!,
        mean: d3.mean(values)!,
      }));
      setAntarctica(parsed);
    });
  };
  const readGreen = async (file: string) => {
    d3.csv(file, (d) => ({
      country: d.country,
      year: +d.year,
      change: +d.change,
    })).then((data) => {
      const parsed = Object.entries(
        data.reduce((acc, d) => {
          acc[d.year] ??= [];
          acc[d.year].push(d.change);
          return acc;
        }, {} as Record<number, number[]>)
      ).map(([year, values]) => ({
        year: +year,
        min: d3.min(values)!,
        max: d3.max(values)!,
        mean: d3.mean(values)!,
      }));
      setGreenland(parsed);
    });
  };

  return (
    <div className="w-full relative">
      <div className="w-full max-w-7xl justify-center items-center mx-auto  relative">
        <div ref={riverRef} className="w-full min-h-[60rem]">
          {antarctica && greenland && (
            <RiverViz
              width={width}
              height={height}
              antarctica={antarctica}
              greenland={greenland}
            />
          )}
        </div>
        <Description />
      </div>
    </div>
  );
};

type RiveVizProps = {
  width: number;
  height: number;
  antarctica: RiverDataProps[];
  greenland: RiverDataProps[];
};

const RiverViz = ({ width, height, antarctica, greenland }: RiveVizProps) => {
  const chartRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, 0.3);

  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  const minX = 2002;
  const maxX = 2020;
  const xScale = useMemo(() => {
    return d3.scaleLinear().domain([minX, maxX]).range([0, boundsWidth]);
  }, [boundsWidth]);

  const yScale = useMemo(() => {
    return d3.scaleLinear().domain([-6000, 0]).range([boundsHeight, 0]);
  }, [boundsHeight]);

  const maxMagnitude =
    d3.max([...antarctica, ...greenland], (d) => Math.abs(d.mean)) ?? 1;

  const riverWidthScale = d3
    .scaleLinear()
    .domain([0, maxMagnitude])
    .range([0, 1000]);

  const areaBuilder = d3
    .area<RiverDataProps>()
    .x((d) => xScale(d.year))
    .y0((d) => yScale(d.mean + riverWidthScale(Math.abs(d.mean))))
    .y1((d) => yScale(d.mean - riverWidthScale(Math.abs(d.mean))))
    .curve(d3.curveBasis);

  useEffect(() => {
    if (!isInView) return;
    const createViz = () => {
      const svgElement = d3.select(chartRef.current);
      svgElement.selectAll("*").remove();

      // Clip path for flow animation
      svgElement
        .append("clipPath")
        .attr("id", "clip-reveal")
        .append("rect")
        .attr("width", 0)
        .attr("height", boundsHeight)
        .transition()
        .duration(5000)
        .attr("width", boundsWidth);

      // Add defs for animated gradient
      svgElement.append("defs").html(`
            <linearGradient id="flow-antarctica" gradientTransform="rotate(90)">
                <stop offset="0%" stop-color="#3b82f6">
                    <animate attributeName="offset" values="0%;100%" dur="3s" repeatCount="indefinite" />
                </stop>
                <stop offset="100%" stop-color="#3b82f6" stop-opacity="0" />
                </linearGradient>
                <linearGradient id="flow-greenland" gradientTransform="rotate(90)">
                <stop offset="0%" stop-color="#22d3ee">
                    <animate attributeName="offset" values="0%;100%" dur="3s" repeatCount="indefinite" />
                </stop>
                <stop offset="100%" stop-color="#22d3ee" stop-opacity="0" />
            </linearGradient>
        `);

      // Add area paths
      svgElement
        .append("path")
        .datum(antarctica)
        .attr("clip-path", "url(#clip-reveal)")
        .attr("fill", "url(#flow-antarctica)")
        .attr("opacity", 0.7)
        .attr("d", areaBuilder);

      svgElement
        .append("path")
        .datum(greenland)
        .attr("clip-path", "url(#clip-reveal)")
        .attr("fill", "url(#flow-greenland)")
        .attr("opacity", 0.7)
        .attr("d", areaBuilder);

      // Add custom "0 point" circle + label
      svgElement
        .append("circle")
        .attr("cx", xScale(2002))
        .attr("cy", yScale(0))
        .attr("fill", "#1D1D1D")
        .attr("r", 0)
        .transition()
        .delay(5000)
        .attr("r", 5);

      svgElement
        .append("text")
        .attr("x", xScale(2002) + 10)
        .attr("y", yScale(0) - 10)
        .attr("fill", "#1D1D1D")
        .style("font-size", "0.85rem")
        .style("font-family", "monospace")
        .text("")
        .transition()
        .delay(5000)
        .text("0 billion tons in 2002");

      // Add custom "0 point" circle + label
      svgElement
        .append("circle")
        .attr("cx", xScale(2020))
        .attr("cy", yScale(-5000))
        .attr("fill", "#1D1D1D")
        .attr("r", 0)
        .transition()
        .delay(5000)
        .attr("r", 5);

      svgElement
        .append("text")
        .attr("x", xScale(2020) - 200)
        .attr("y", yScale(-5000) + 20)
        .attr("fill", "#1D1D1D")
        .style("font-size", "0.85rem")
        .style("font-family", "monospace")
        .text("")
        .transition()
        .delay(5000)
        .text("-5000 billion tons in 2020");

      const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d")).ticks(10);

      svgElement
        .append("g")
        .attr("transform", `translate(0,${boundsHeight})`)
        .call(xAxis)
        .selectAll("text")
        .style("font-size", "0.75rem")
        .style("font-family", "monospace")
        .style("fill", "#94a3b8");

      svgElement.selectAll(".domain").attr("stroke", "#cbd5e1");
      svgElement.selectAll(".tick line").attr("stroke", "none");
    };
    createViz();
  }, [
    boundsHeight,
    isInView,
    antarctica,
    areaBuilder,
    boundsWidth,
    greenland,
    xScale,
    yScale,
  ]);

  return (
    <div ref={containerRef} className="pt-10">
      <svg width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          ref={chartRef}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        />
      </svg>
    </div>
  );
};

const Description = () => {
  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto absolute top-50 left-0 font-mono">
      <h2 className="text-2xl font-semibold text-black mb-4 tracking-tight">
        Ice Sheet Mass Loss 2002 - 2020
      </h2>
      <ul className="text-md text-slate-800 leading-relaxed list-disc list-inside space-y-2">
        <p>
          Since 1992, <span className="font-bold text-cyan-400">Greenland</span>{" "}
          has lost an average of 175 billion metric tons of ice per year, and{" "}
          <span className="font-bold text-blue-500">Antarctica</span> over 90
          billion.
        </p>
        <p>
          Between 1992 and 2020, the total ice loss was enough to raise global
          sea level by three-quarters of an inch or more.
        </p>
        <p>
          Seasonal changes are visible—especially for Greenland—but long-term
          data shows consistent overall decline.
        </p>
        <p>
          These losses align with shrinking glaciers and rising global
          temperatures observed over the same period.
        </p>
      </ul>
    </div>
  );
};
