"use client";
import { useRef, useMemo, useEffect, useState } from "react";
import * as d3 from "d3";
import { useInView } from "@/lib/useInView";

type TreeNode = {
  type: string;
  country: string;
  code: string;
  year: number;
  value: number;
  children: LeafNode[];
};

type LeafNode = {
  type: string;
  country: string;
  code: string;
  year: number;
  value: number;
};

type Tree = TreeNode | LeafNode;

type DataProps = {
  country: string;
  code: string;
  year: number;
  value: number;
};

type ClusterProps = {
  width: number;
  height: number;
  data: DataProps[];
  selectedYear: number;
};

const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };

const COLORS = [
  "#e0ac2b",
  "#6689c6",
  "#a4c969",
  "#e85252",
  "#9a6fb0",
  "#a53253",
  "#7f7f7f",
];

const assignChildren = (
  bigboys: TreeNode[],
  allCountries: DataProps[]
): Tree => {
  const bigboyCodes = new Set(bigboys.map((b) => b.code));

  const smallCountries = allCountries.filter((c) => !bigboyCodes.has(c.code));

  let i = 0;
  for (const small of smallCountries) {
    const index = i % bigboys.length;
    const leafNode: LeafNode = {
      type: "leaf",
      country: small.country,
      code: small.code,
      year: small.year,
      value: small.value,
    };
    bigboys[index].children.push(leafNode);
    i++;
  }
  return {
    type: "node",
    country: "world",
    code: "WRLD",
    year: 2025,
    value: 0,
    children: bigboys,
  };
};

export const ClusterComponent = ({
  width,
  height,
  data,
  selectedYear,
}: ClusterProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, 0.3);
  const chartRef = useRef(null);
  const [tooltip, setTooltip] = useState<TooltipProps | null>(null);

  const filtered = useMemo(
    () => data.filter((d) => d.year === selectedYear),
    [data, selectedYear]
  );

  const nestedData = useMemo(() => {
    const big = filtered
      .filter((d) => d.value > 3)
      .map((d) => ({
        type: "node",
        country: d.country,
        code: d.code,
        year: d.year,
        value: d.value,
        children: [] as LeafNode[],
      }));

    return assignChildren(big, filtered);
  }, [filtered]);

  useEffect(() => {
    if (!isInView) return;
    console.log("NESTED: ", nestedData);
    createViz();
  }, [nestedData, isInView]);

  const createViz = () => {
    const svgElement = d3.select(chartRef.current);
    svgElement.select("*").remove();
    const hierarchy = d3
      .hierarchy(nestedData)
      .sum((d) => d.value)
      .sort((a, b) => b.value! - a.value!);

    const packGenerator = d3.pack<Tree>().size([width, height]).padding(4);
    const root = packGenerator(hierarchy);

    const firstLevelGroups = hierarchy?.children?.map(
      (child) => child.data.country
    );

    const colorScale = d3
      .scaleOrdinal<string>()
      .domain(firstLevelGroups || [])
      .range(COLORS);

    const g = svgElement
      .append("g")
      .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

    // Level 1 nodes (bigboys)
    const level1 = root.descendants().filter((d) => d.depth === 1);

    const bigBoyz = g
      .selectAll("g.level1")
      .data(level1)
      .enter()
      .append("g")
      .attr("class", "level1");

    bigBoyz
      .append("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 0) // start radius from 0
      .attr("fill", (d) => colorScale(d.data.country))
      .attr("stroke", (d) => colorScale(d.data.country))
      .attr("stroke-opacity", 0.3)
      .attr("fill-opacity", 0.1)
      .transition()
      .duration(1200)
      .ease(d3.easeCubicOut)
      .attr("r", (d) => d.r);

    bigBoyz
      .append("text")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y - d.r - 6)
      .attr("text-anchor", "start")
      .attr("alignment-baseline", "middle")
      .attr("fill", "#fafafa")
      .style("font-family", "monospace")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("opacity", 0)
      .text((d) => `${d.data.country} - ${d.data.value.toFixed(2)}`)
      .transition()
      .duration(2200)
      .style("opacity", 1);

    // Leaf nodes (small countries)
    const leaves = root.leaves();

    const leafGroups = g
      .selectAll("g.leaf")
      .data(leaves)
      .enter()
      .append("g")
      .attr("class", "leaf");

    leafGroups
      .append("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 0) // animate in
      .attr("stroke", (d) => colorScale(d.parent?.data.country || ""))
      .attr("fill", (d) => colorScale(d.parent?.data.country || ""))
      .attr("fill-opacity", 0.2)
      .on("mouseover", (event, hovered) => {
        const [x, y] = d3.pointer(event);
        const data = hovered.data;
        setTooltip({ x, y, data });
      })
      .on("mouseleave", () => {
        setTooltip(null);
      })
      .transition()
      .duration(2000)
      .ease(d3.easeCubicOut)
      .attr("r", (d) => d.r);

    leafGroups
      .filter((d) => d.r > 12) // Otherwise too small
      .append("text")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("fill", "#fafafa")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .style("font-size", "10px")
      .style("font-family", "monospace")
      .style("pointer-events", "none")
      .text((d) => d.data.code)
      .style("opacity", 0)
      .transition()
      .duration(2200)
      .style("opacity", 1);
  };

  return (
    <div ref={containerRef} className="relative">
      <svg ref={chartRef} width={width} height={height}></svg>
      {tooltip && <Tooltip x={tooltip.x} y={tooltip.y} data={tooltip.data} />}
      <Description />
    </div>
  );
};

type TooltipProps = {
  x: number;
  y: number;
  data: TreeNode | LeafNode;
};

const Tooltip = ({ x, y, data }: TooltipProps) => {
  return (
    <div
      className="absolute z-50 bg-black text-white px-2 py-1 border border-gray-500 rounded pointer-events-none shadow-md font-mono opacity-80"
      style={{ left: x - 80, top: y - 25 }}
    >
      <p className="text-md">{data.country}</p>
      <p className="text-sm">Contribution: {data.value.toFixed(2)}</p>
    </div>
  );
};

const Description = () => {
  return (
    <div className="flex flex-col w-full max-w-3xl font-mono absolute top-5 left-16">
      <h2 className="mt-5 text-2xl font-semibold text-white mb-2">
        Contributions To Global Warming
      </h2>
      <p className="text-gray-100 leading-relaxed">
        Just a small number of countries contribute increasing the global mean
        temperature as much — or more — than all the others combined.
      </p>
    </div>
  );
};
