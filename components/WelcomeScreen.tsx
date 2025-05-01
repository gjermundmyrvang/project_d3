"use client";
import { madebypath, paths2 } from "@/data/custompaths";
import { useDimensions } from "@/utils/useDimensions";
import * as d3 from "d3";
import { useEffect, useRef } from "react";

const pathsdata = paths2;
const pathsmadeby = madebypath;
const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };

export const WelcomeScreen = () => {
  const ref = useRef(null);
  const { width, height } = useDimensions(ref);
  const effectiveHeight = height === 0 ? 1200 : height;
  console.log("WIDTH AND HEIGHT WELCOME: ", { width, effectiveHeight });

  return (
    <div className="w-full h-screen bg-black flex flex-col justify-center items-center">
      <div
        ref={ref}
        className="w-full max-w-7xl h-[500px] flex justify-center items-center"
      >
        {width > 0 && height > 0 && (
          <LetterPaths
            width={width}
            height={effectiveHeight}
            paths={pathsdata}
          />
        )}
      </div>
    </div>
  );
};

type LetterPathsProps = {
  width: number;
  height: number;
  paths: string[];
};

const LetterPaths = ({ width, height, paths }: LetterPathsProps) => {
  const gRef = useRef<SVGGElement | null>(null);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  useEffect(() => {
    const svgElement = d3.select(gRef.current);
    svgElement.selectAll("*").remove();

    const pathsSelection = svgElement
      .selectAll("path")
      .data(paths)
      .enter()
      .append("path")
      .attr("d", (d) => d)
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("fill", "none")
      .attr("stroke-dasharray", function () {
        return (this as SVGPathElement).getTotalLength();
      })
      .attr("stroke-dashoffset", function () {
        return (this as SVGPathElement).getTotalLength();
      });

    pathsSelection
      .transition()
      .duration(3000)
      .ease(d3.easeCubicInOut)
      .attr("stroke-dashoffset", 0)
      .on("end", function () {
        d3.select(this).transition().duration(800).attr("fill", "#fff");
      });
  }, [paths]);

  return (
    <svg width={width} height={height}>
      <g
        ref={gRef}
        transform={`translate(${MARGIN.left}, ${MARGIN.top})`}
        width={boundsWidth}
        height={boundsHeight}
      />
    </svg>
  );
};
