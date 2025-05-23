"use client";
import { useDimensions } from "@/utils/useDimensions";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

type DataProps = {
  year: number;
  ppm: number;
};

const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };

const FILTERS = {
  PARTCILES: "particles",
  BAR: "barchart",
};

export const CO2Component = () => {
  const vizRef = useRef(null);
  const { width, height } = useDimensions(vizRef);
  const [data, setData] = useState<DataProps[] | null>(null);
  const [filter, setFilter] = useState<string>(FILTERS.PARTCILES);

  useEffect(() => {
    readData();
  }, []);

  const readData = () => {
    d3.csv("/co2.csv", (d) => ({
      year: +d.year,
      ppm: +d.ppm,
    })).then((data) => {
      console.log("CO2 DATA:", data);
      setData(data);
    });
  };

  return (
    <div className="w-full max-w-7xl justify-center items-center mx-auto  pb-10">
      <div className="w-full min-h-[60rem] relative" ref={vizRef}>
        {data && (
          <>
            <FilterSwitch
              current={filter}
              choices={Object.values(FILTERS)}
              setFilter={setFilter}
            />
            {filter === FILTERS.PARTCILES ? (
              <CO2Viz width={width} height={height} data={data} />
            ) : (
              <CO2BarChart width={width} height={height} data={data} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

type CO2VizProps = {
  width: number;
  height: number;
  data: DataProps[];
};

const MIN_R = 10;
const MAX_R = 30;

const CO2Viz = ({
  width,
  height,
  data,
}: {
  width: number;
  height: number;
  data: DataProps[];
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const boundsWidth = width - MARGIN.left - MARGIN.right;
  const boundsHeight = height / 2 - MARGIN.top;
  const [currentIndex, setCurrentIndex] = useState(0);
  const particles = useRef<any[]>([]);
  const frameRef = useRef<number | null>(null);

  const generateParticles = (num: number) => {
    return d3.range(num).map(() => ({
      x: Math.random() * boundsWidth,
      y: Math.random() * boundsHeight,
      r: d3.randomUniform(MIN_R, MAX_R)(),
      dx: (Math.random() - 0.5) * 0.6,
      dy: (Math.random() - 0.5) * 0.6,
    }));
  };

  const updatePositions = () => {
    for (let p of particles.current) {
      p.x += p.dx;
      p.y += p.dy;

      if (p.x < 0 || p.x > boundsWidth) p.dx *= -1;
      if (p.y < 0 || p.y > boundsHeight) p.dy *= -1;
    }
  };

  const renderParticles = () => {
    const svg = d3.select(svgRef.current);
    const group = svg.select("g.particles");

    const join = group.selectAll("circle").data(particles.current);

    join
      .join(
        (enter) =>
          enter
            .append("circle")
            .attr("r", (d) => d.r)
            .attr("fill", (d) =>
              d3.interpolateGreys(0.7 + ((d.r - MIN_R) / (MAX_R - MIN_R)) * 0.3)
            ),
        (update) => update,
        (exit) => exit.remove()
      )
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y);
  };

  const tick = () => {
    updatePositions();
    renderParticles();
    frameRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg
      .append("g")
      .attr("class", "particles")
      .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const startAnimation = () => {
    let yearIndex = 0;

    const step = () => {
      if (yearIndex >= data.length) return;

      const targetCount = Math.floor(data[yearIndex].ppm);
      const currentCount = particles.current.length;

      if (targetCount > currentCount) {
        const newParticles = generateParticles(targetCount - currentCount);
        particles.current = [...particles.current, ...newParticles];
      } else if (targetCount < currentCount) {
        particles.current = particles.current.slice(0, targetCount);
      }

      setCurrentIndex(yearIndex);
      yearIndex++;

      setTimeout(step, 250);
    };

    step();
  };

  return (
    <div className="w-full">
      <Description />
      <svg
        ref={svgRef}
        width={width}
        height={height / 2}
        className="rounded-lg backdrop-blur-md bg-white/20 border border-white/20"
      />
      <YearsComponent
        data={data}
        current={data[currentIndex]}
        setCurrent={(newCurrent) => {
          const index = data.findIndex((d) => d.year === newCurrent.year);
          setCurrentIndex(index);
          particles.current = generateParticles(Math.floor(newCurrent.ppm));
        }}
        playAnimation={startAnimation}
      />
    </div>
  );
};

const CO2BarChart = ({ width, height, data }: CO2VizProps) => {
  const chartRef = useRef(null);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  const xScale = useMemo(() => {
    return d3
      .scaleBand()
      .domain(data.map((d) => d.year.toString()))
      .range([0, boundsWidth])
      .padding(0.2);
  }, [boundsWidth, data]);

  const yScale = useMemo(() => {
    return d3.scaleLinear().domain([290, 430]).range([boundsHeight, 0]);
  }, [boundsHeight]);

  const colorScale = d3
    .scaleLinear<string>()
    .domain([200, 300, 400])
    .range(["#FAFAFA", "#787878", "#101010"])
    .interpolate(d3.interpolateRgb);

  useEffect(() => {
    const createViz = () => {
      const svgElement = d3.select(chartRef.current);
      svgElement.selectAll("*").remove();
      const allYears = xScale.domain();
      const filteredYears = allYears.filter((_, i) => i % 10 === 0);
      const xAxis = d3.axisBottom(xScale).tickValues(filteredYears);
      const yAxis = d3.axisLeft(yScale).ticks(6);
      svgElement
        .append("g")
        .attr("transform", "translate(0," + boundsHeight + ")")
        .call(xAxis)
        .call((g) => g.select(".domain").attr("stroke", "#ccc"));

      svgElement
        .append("g")
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
        .data(data)
        .enter()
        .append("rect")
        .attr("x", (d) => xScale(d.year.toString())!)
        .attr("width", xScale.bandwidth())
        .attr("y", yScale(290))
        .attr("height", 0)
        .attr("fill", (d) => colorScale(d.ppm))
        .transition()
        .delay((_, i) => i * 30) // Delay per bar
        .duration(500)
        .ease(d3.easeCubicOut)
        .attr("y", (d) => yScale(d.ppm))
        .attr("height", (d) => boundsHeight - yScale(d.ppm));
    };
    createViz();
  }, [boundsHeight, boundsWidth, colorScale, data, xScale, yScale]);

  return (
    <div>
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

type YearProps = {
  data: DataProps[];
  current: DataProps;
  setCurrent: (current: DataProps) => void;
  playAnimation: () => void;
};

const YearsComponent = ({
  data,
  current,
  setCurrent,
  playAnimation,
}: YearProps) => {
  return (
    <div className="w-full mt-4">
      <div className="grid grid-cols-15 gap-2">
        {data.map((d) => (
          <div
            key={d.year}
            className="flex flex-col items-center text-sm font-mono"
          >
            <button
              className={`px-3 py-1 rounded-lg text-sm transition-colors duration-200 hover:cursor-pointer ${
                current.year === d.year
                  ? "bg-white text-black font-bold"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              onClick={() => setCurrent(d)}
            >
              {d.year}
            </button>
            <p className="text-xs text-gray-600 mt-0.5">
              {d.ppm.toFixed(0)}ppm
            </p>
          </div>
        ))}
      </div>
      <button
        className="my-8 px-3 py-2 rounded-lg text-sm font-bold font-mono transition-colors duration-200 bg-blue-500 text-white hover:bg-blue-400 hover:cursor-pointer"
        onClick={() => playAnimation()}
      >
        Start Animation
      </button>
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
    <div className="absolute top-5 right-0 font-mono z-100">
      <div className="flex gap-2 bg-gray-800 rounded-xl p-1">
        {choices.map((choice) => (
          <button
            key={choice}
            onClick={() => setFilter(choice)}
            className={`px-3 py-1 rounded-lg text-sm transition-colors duration-200 hover:cursor-pointer
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
    <div className="flex flex-col w-full font-mono">
      <h2 className="mt-5 text-2xl font-semibold text-gray-800 mb-2">
        Carbon dioxide concentrations in the atmosphere
      </h2>
      <p className="font-mono text-gray-700">
        CO₂ concentration is measured in parts per million (ppm), which tells us
        how many carbon dioxide molecules are present in a million air
        molecules. Over the last 100 years, levels have risen sharply—from
        around 300 ppm to over 400 ppm—mostly due to human activities. A year
        with 200 ppm would indicate a much cleaner atmosphere, while 400 ppm
        means significantly more heat-trapping gases, accelerating global
        warming.
      </p>
    </div>
  );
};
