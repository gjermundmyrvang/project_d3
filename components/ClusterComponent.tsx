"use client";
import * as d3 from "d3";
import { useEffect, useMemo, useRef, useState } from "react";

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
    createViz();
  }, [nestedData]);

  const createViz = () => {
    const g = d3.select(chartRef.current);
    g.selectAll("*").remove();

    const hierarchy = d3
      .hierarchy(nestedData)
      .sum((d) => d.value)
      .sort((a, b) => b.value! - a.value!);

    const packGenerator = d3
      .pack<Tree>()
      .size([
        width - MARGIN.left - MARGIN.right,
        height - MARGIN.top - MARGIN.bottom,
      ])
      .padding(4);

    const root = packGenerator(hierarchy);
    const level1 = root.descendants().filter((d) => d.depth === 1);

    const firstLevelGroups = level1.map((d) => d.data.country);

    const colorScale = d3
      .scaleOrdinal<string>()
      .domain(firstLevelGroups)
      .range(COLORS);

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
      .attr("r", 0)
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
      .text((d) => `${d.data.country} - ${d.data.value.toFixed(2)} %`)
      .transition()
      .duration(2200)
      .style("opacity", 1);

    // Leaf nodes
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
      .attr("r", 0)
      .attr("stroke", (d) => colorScale(d.parent?.data.country || ""))
      .attr("fill", (d) => colorScale(d.parent?.data.country || ""))
      .attr("fill-opacity", 0.2)
      .on("mouseover", (event, hovered) => {
        const [x, y] = d3.pointer(event);
        const data = hovered.data;
        setTooltip({ x, y, data });
      })
      .on("mouseleave", () => setTooltip(null))
      .transition()
      .duration(2000)
      .ease(d3.easeCubicOut)
      .attr("r", (d) => d.r);

    leafGroups
      .filter((d) => d.r > 12)
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
    <div className="relative pt-28">
      <svg width={width} height={height}>
        <g ref={chartRef} transform={`translate(-100, ${MARGIN.top})`} />
      </svg>
      {tooltip && <Tooltip x={tooltip.x} y={tooltip.y} data={tooltip.data} />}
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
      <p className="text-sm">Contribution: {data.value.toFixed(2)} %</p>
    </div>
  );
};
