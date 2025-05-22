"use client";
import { mapdata } from "@/data/mapdata";
import { useDimensions } from "@/utils/useDimensions";
import * as d3 from "d3";
import { Feature, FeatureCollection } from "geojson";
import { useEffect, useMemo, useRef, useState } from "react";
import { ClusterComponent } from "./ClusterComponent";

type DataProps = {
  country: string;
  code: string;
  year: number;
  value: number;
};

const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };
const geodata = mapdata;
const FILTERS = {
  CLUSTER: "cluster",
  MAP: "map",
};

export const ContributionMap = () => {
  const vizRef = useRef(null);
  const { width, height } = useDimensions(vizRef);
  const [data, setData] = useState<DataProps[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2023);
  const [filter, setFilter] = useState<string>(FILTERS.CLUSTER);

  useEffect(() => {
    d3.csv("/globaltempcontributions.csv", (d) => ({
      country: d.country,
      code: d.code || "",
      year: +d.year,
      value: +d.value,
    })).then((parsed) => {
      const cleaned = parsed.filter((d) => d.year >= 1940 && d.code);
      setData(cleaned);
    });
  }, []);

  const uniqueYears = [...new Set(data.map((d) => d.year))];

  const colorScale = useMemo(() => {
    const colors = [
      "#FFFFFF",
      "#00FFF6",
      "#00A0CD",
      "#4B48FA",
      "#E988F0",
      "#FDE080",
      "#FF8C00",
    ];
    return d3.scaleQuantize<string>().domain([0, 1]).range(colors);
  }, [data]);

  return (
    <div
      ref={vizRef}
      className="w-full max-w-7xl min-h-[75rem] justify-center items-center mx-auto relative"
    >
      {data.length > 0 && vizRef && (
        <div>
          <YearComponent
            years={uniqueYears}
            current={selectedYear}
            setSelected={setSelectedYear}
          />
          <FilterSwitch
            current={filter}
            choices={Object.values(FILTERS)}
            setFilter={setFilter}
          />
          {filter === FILTERS.CLUSTER ? (
            <ClusterComponent
              width={width}
              height={height}
              data={data}
              selectedYear={selectedYear}
            />
          ) : (
            <MapComponent
              width={width}
              height={height}
              mapdata={geodata}
              data={data}
              selectedYear={selectedYear}
            />
          )}
          <Description />
        </div>
      )}
    </div>
  );
};

type YearProp = {
  years: number[];
  current: number;
  setSelected: (year: number) => void;
};

const YearComponent = ({ years, current, setSelected }: YearProp) => (
  <div className="absolute top-50 right-20 z-50">
    <div className="grid grid-cols-5 gap-2 max-w-full">
      {years.map((d) => (
        <button
          key={d}
          className={`text-xs font-mono hover:cursor-pointer  focus:outline-none ${
            current === d
              ? "text-blue-500 border-b border-blue-500"
              : "text-white"
          }`}
          onClick={() => setSelected(d)}
        >
          {d}
        </button>
      ))}
    </div>
  </div>
);

type MapProps = {
  width: number;
  height: number;
  data: DataProps[];
  mapdata: FeatureCollection;
  selectedYear: number;
};

const MapComponent = ({
  width,
  height,
  data,
  mapdata,
  selectedYear,
}: MapProps) => {
  const chartRef = useRef(null);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;
  const [tooltip, setTooltip] = useState<TooltipProps | null>(null);

  const filtered = data.filter((d) => d.year === selectedYear);
  const valueMap = new Map(filtered.map((d) => [d.code, d.value]));

  const colorScale = d3
    .scaleSequential()
    .interpolator(d3.interpolateInferno)
    .domain([0, 20]);

  const projection = d3.geoNaturalEarth1().fitSize([width, height], mapdata);

  const geoPathGenerator = d3.geoPath().projection(projection);

  useEffect(() => {
    const svgElement = d3.select(chartRef.current);
    svgElement.selectAll("*").remove();

    svgElement
      .selectAll("path")
      .data(mapdata.features.filter((shape) => shape.id !== "ATA"))
      .enter()
      .append("path")
      .attr("d", (d) => geoPathGenerator(d)!)
      .attr("stroke", "#FAFAFA") //2DFFFF
      .attr("stroke-width", 0.2)
      .attr("fill", (d) => {
        const id = d.id?.toString();
        const value = id ? valueMap.get(id) : undefined;
        return value !== undefined ? colorScale(value) : "#fff";
      })
      .attr("fill-opacity", 0.8)
      .on("mouseover", (event, shape) => {
        const [x, y] = d3.pointer(event);
        const id = shape.id?.toString();
        const value = id ? valueMap.get(id) : undefined;
        setTooltip({ x, y, shape, value });
      })
      .on("mouseleave", () => {
        setTooltip(null);
      });

    // Create gradient
    const defs = svgElement.append("defs");

    const gradient = defs
      .append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%");

    const stops = d3.range(0, 1.01, 1 / 10);
    stops.forEach((s, i) => {
      gradient
        .append("stop")
        .attr("offset", `${s * 100}%`)
        .attr(
          "stop-color",
          colorScale(
            colorScale.domain()[0] +
              s * (colorScale.domain()[1] - colorScale.domain()[0])
          )
        );
    });

    // Draw the gradient bar
    svgElement
      .append("rect")
      .attr("x", 0)
      .attr("y", boundsHeight)
      .attr("width", width)
      .attr("height", height)
      .style("fill", "url(#legend-gradient)");

    // Add axis
    const legendScale = d3
      .scaleLinear()
      .domain(colorScale.domain())
      .range([0, width]);

    const legendAxis = d3
      .axisBottom(legendScale)
      .ticks(5)
      .tickFormat((d) => `${d}`);

    const legendAxisGroup = svgElement
      .append("g")
      .attr("transform", `translate(0, ${boundsHeight - 50})`)
      .call(legendAxis);

    legendAxisGroup
      .selectAll("text")
      .style("fill", "white")
      .style("font-weight", "bold")
      .style("font-size", "14px");

    legendAxisGroup.selectAll("path, line").style("stroke", "white");
  }, [
    mapdata,
    boundsWidth,
    boundsHeight,
    valueMap,
    colorScale,
    geoPathGenerator,
  ]);

  return (
    <div className="relative">
      <svg width={width} height={height}>
        <g ref={chartRef} transform={`translate(-100, ${MARGIN.top})`} />
      </svg>

      {tooltip && (
        <Tooltip
          x={tooltip.x}
          y={tooltip.y}
          shape={tooltip.shape}
          value={tooltip.value}
        />
      )}
    </div>
  );
};

type TooltipProps = {
  x: number;
  y: number;
  shape: Feature;
  value: number | undefined;
};

const Tooltip = ({ x, y, shape, value }: TooltipProps) => {
  const name = shape.properties?.name ?? shape.id ?? "Unknown";
  const contribution = value?.toFixed(2) ?? "No data";
  return (
    <div
      className="absolute z-50 bg-black text-white px-2 py-1 border border-gray-500 rounded pointer-events-none shadow-md font-mono opacity-80"
      style={{ left: x - 80, top: y - 25 }}
    >
      <p className="text-md">{name}:</p>
      <p className="text-sm">Countribution: {contribution} %</p>
    </div>
  );
};

type FilterProps = {
  current: string;
  choices: string[];
  setFilter: (choice: string) => void;
};

const FilterSwitch = ({ current, choices, setFilter }: FilterProps) => {
  return (
    <div className="absolute top-12 left-0 font-mono z-100">
      <div className="flex gap-2 bg-gray-800 rounded-xl p-1">
        {choices.map((choice) => (
          <button
            key={choice}
            onClick={() => setFilter(choice)}
            className={`px-3 py-1 rounded-lg text-sm transition-colors duration-200
              ${
                current === choice
                  ? "bg-white text-black font-bold"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
};

const Description = () => {
  return (
    <div className="flex flex-col w-full max-w-4xl font-mono absolute top-20 left-0">
      <h2 className="mt-5 text-2xl font-semibold text-white mb-2">
        Contributions To Global Warming
      </h2>
      <p className="text-gray-100 leading-relaxed">
        Just a few countries have contributed to global warming as much as, or
        even more than, all other countries combined.
      </p>
    </div>
  );
};
