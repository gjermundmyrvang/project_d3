"use client";
import { useDimensions } from "@/utils/useDimensions";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { useInView } from "@/lib/useInView";

type DataProps = {
  year: number;
  min: number;
  max: number;
  mean: number;
};

type CursorProps = {
  x: number;
  y: number;
  data: DataProps | null;
};

const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };

export const SeaLevel = () => {
  const vizRef = useRef(null);
  const { width, height } = useDimensions(vizRef);
  const [data, setData] = useState<DataProps[] | null>(null);

  useEffect(() => {
    readData();
  }, []);

  const readData = async () => {
    d3.csv("sealevel.csv", (d) => ({
      year: +d.year,
      sealevel: +d.sealevel,
    })).then((data) => {
      const parsed = Object.entries(
        data.reduce((acc, d) => {
          acc[d.year] ??= [];
          acc[d.year].push(d.sealevel);
          return acc;
        }, {} as Record<number, number[]>)
      ).map(([year, values]) => ({
        year: +year,
        min: d3.min(values)!,
        max: d3.max(values)!,
        mean: d3.mean(values)!,
      }));
      setData(parsed);
    });
  };
  return (
    <div className="w-full text-white">
      <div className="w-full max-w-7xl justify-center items-center mx-auto  relative">
        <div className="w-full h-[60rem] items-start z-10" ref={vizRef}>
          {data && <SeaLevelGraph width={width} height={height} data={data} />}
        </div>
        <Description />
      </div>
    </div>
  );
};

type SeaLevelProps = {
  width: number;
  height: number;
  data: DataProps[];
};

const SeaLevelGraph = ({ width, height, data }: SeaLevelProps) => {
  const chartRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, 0.3);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  const [cursor, setCursor] = useState<CursorProps | null>(null);

  const minSeaValue = d3.min(data, (d) => d.min);
  const maxSeaValue = d3.max(data, (d) => d.max);

  const xScale = useMemo(() => {
    return d3
      .scaleBand()
      .domain(data.map((d) => d.year.toString()))
      .range([0, boundsWidth])
      .padding(0.2);
  }, [data, width]);

  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([minSeaValue ?? 1, maxSeaValue ?? 1])
      .range([boundsHeight, 0]);
  }, [data, height]);

  const areaBulder = d3
    .area<DataProps>()
    .x((d) => xScale(d.year.toString())! + xScale.bandwidth() / 2)
    .y0(yScale(0))
    .y1((d) => yScale(d.mean))
    .curve(d3.curveMonotoneX);

  const lineBuilder = d3
    .line<DataProps>()
    .x((d) => xScale(d.year.toString())! + xScale.bandwidth() / 2)
    .y((d) => yScale(d.mean))
    .curve(d3.curveMonotoneX);

  const negativeData = data.filter((d) => d.mean < 0);
  const positiveData = data.filter((d) => d.mean > 0);

  useEffect(() => {
    if (!isInView) return;
    createViz();
  }, [xScale, yScale, boundsHeight, isInView]);

  const createViz = () => {
    const svgElement = d3.select(chartRef.current);
    svgElement.selectAll("*").remove();

    const allYears = xScale.domain();
    const filteredYears = allYears.filter((_, i) => i % 10 === 0);
    const xAxis = d3.axisTop(xScale).ticks(0).tickValues(filteredYears);

    const yAxis = d3
      .axisLeft(yScale)
      .tickFormat(() => "")
      .ticks(0);

    svgElement
      .append("g")
      .attr("transform", `translate(${boundsWidth},0)`)
      .attr("z-index", "10")
      .call(yAxis)
      .call((g) => g.select(".domain").attr("stroke", "none"));

    svgElement
      .append("path")
      .datum(negativeData)
      .attr("fill", "none")
      .attr("stroke", "#0077B6")
      .attr("stroke-width", 2)
      .attr("d", lineBuilder)
      .attr("stroke-dasharray", function () {
        return (this as SVGPathElement).getTotalLength();
      })
      .attr("stroke-dashoffset", function () {
        return (this as SVGPathElement).getTotalLength();
      })
      .transition()
      .duration(3000)
      .ease(d3.easeCubicInOut)
      .attr("stroke-dashoffset", 0);

    svgElement
      .append("path")
      .datum(positiveData)
      .attr("fill", "none")
      .attr("stroke", "#F84545")
      .attr("stroke-width", 2)
      .attr("d", lineBuilder)
      .attr("stroke-dasharray", function () {
        return (this as SVGPathElement).getTotalLength();
      })
      .attr("stroke-dashoffset", function () {
        return (this as SVGPathElement).getTotalLength();
      })
      .transition()
      .delay(3000)
      .duration(3000)
      .ease(d3.easeCubicInOut)
      .attr("stroke-dashoffset", 0);

    const negArea = svgElement
      .append("path")
      .datum(negativeData)
      .attr("fill", "rgba(120, 199, 214, 0.3)")
      .attr("d", areaBulder);

    const posArea = svgElement
      .append("path")
      .datum(positiveData)
      .attr("fill", "rgba(248, 69, 69, 0.3)")
      .attr("d", areaBulder);

    svgElement
      .append("g")
      .attr("transform", "translate(0," + yScale(0) + ")")
      .call(xAxis)
      .call((g) => {
        g.select(".domain").remove();
        g.selectAll("text")
          .style("font-weight", "bold")
          .style("font-size", "14")
          .style("font-family", "monospace")
          .style("fill", "#fff");
      })
      .raise();

    svgElement
      .append("circle")
      .attr(
        "cx",
        xScale(data.find((d) => d.max === maxSeaValue)?.year.toString()!)! +
          xScale.bandwidth() / 2
      )
      .attr("cy", yScale(maxSeaValue ?? 0))
      .attr("r", 0)
      .transition()
      .delay(6000)
      .duration(1000)
      .attr("r", 5)
      .attr("fill", "#F84545");

    svgElement
      .append("circle")
      .attr(
        "cx",
        xScale(data.find((d) => d.min === minSeaValue)?.year.toString()!)! +
          xScale.bandwidth() / 2
      )
      .attr("cy", yScale(minSeaValue ?? 0))
      .attr("r", 0)
      .transition()
      .duration(3000)
      .attr("r", 5)
      .attr("fill", "#0077B6");

    const lowestText = `Sea Level: ${minSeaValue?.toFixed(2)} mm`;
    const highestText = `Sea Level: ${maxSeaValue?.toFixed(2)} mm`;

    svgElement
      .append("text")
      .attr("x", xScale("1940")! + boundsWidth / 6)
      .attr("y", yScale(minSeaValue ?? 0))
      .attr("text-anchor", "middle")
      .style("font-family", "monospace")
      .style("font-size", "14px")
      .style("fill", "#0077B6")
      .text(lowestText);

    svgElement
      .append("text")
      .attr("x", xScale("2020")! - boundsWidth / 6)
      .attr("y", yScale(maxSeaValue ?? 0))
      .attr("text-anchor", "middle")
      .style("font-family", "monospace")
      .style("font-size", "14px")
      .style("fill", "#F84545")
      .text(highestText);

    const foreign = svgElement
      .append("foreignObject")
      .attr("x", 150)
      .attr("y", 50)
      .attr("width", 200)
      .attr("height", 200);

    foreign
      .append("xhtml:div")
      .style("font-family", "monospace")
      .style("font-size", "14px")
      .style("fill", "#333")
      .text("Year 2000 is the first to\nrecord sea levels above 0 mm");

    svgElement
      .append("defs")
      .append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 5)
      .attr("refY", 5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto-start-reverse")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
      .attr("fill", "#fff");

    svgElement
      .append("line")
      .attr("x1", 350)
      .attr("y1", 60)
      .attr("x2", xScale("2000")! - 10)
      .attr("y2", yScale(0) - 30)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .attr("marker-end", "url(#arrow)");

    svgElement
      .append("rect")
      .attr("width", boundsWidth)
      .attr("height", boundsHeight)
      .attr("fill", "transparent")
      .raise()
      .on("mousemove", function (event) {
        const [mouseX] = d3.pointer(event);
        const domain = xScale.domain();
        const positions = domain.map(
          (d) => xScale(d)! + xScale.bandwidth() / 2
        );

        const index = d3.bisectCenter(positions, mouseX);
        const year = domain[index];

        const pointData = data.find((d) => d.year.toString() === year);
        if (pointData) {
          const x = xScale(year)! + xScale.bandwidth() / 2 + MARGIN.left;
          const y = yScale(pointData.mean) + MARGIN.top;
          setCursor({ x, y, data: pointData });
        }
      })
      .on("mouseleave", () => {
        setCursor(null);
      });
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
        {cursor && <Cursor x={cursor.x} y={cursor.y} data={cursor.data} />}
      </svg>
    </div>
  );
};

const Description = () => {
  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto absolute bottom-8 right-2 font-mono z-0">
      <h2 className="text-2xl font-semibold text-white mb-4 tracking-tight text-end">
        Sea Level Rise from 1940-2020
      </h2>
      <p className="text-md text-slate-300 leading-relaxed">
        From 1940 to 2020, global sea levels have shown a gradual and persistent
        increase. Early in this period, most sea level anomalies remained below
        0mm. However, as clearly illustrated in the visualization, there is a
        distinct shift beginning around the year 2000—marking the point where
        anomalies start to rise consistently above 0mm. This visual trend
        highlights the accelerating impact of climate change on ocean levels
        over recent decades.
      </p>
    </div>
  );
};

const Cursor = ({ x, y, data }: CursorProps) => {
  const boxWidth = 180;
  const boxHeight = 180;

  const adjustedX = Math.max(0, x - boxWidth);
  const adjustedY = Math.max(0, y - boxHeight + 20);
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
            <p>Mean: {data.mean.toFixed(2)} mm</p>
            <p>Min: {data.min.toFixed(2)} mm</p>
            <p>Min: {data.max.toFixed(2)} mm</p>
          </div>
        </foreignObject>
      )}
    </>
  );
};
