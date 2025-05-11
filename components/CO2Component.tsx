"use client";
import { useDimensions } from "@/utils/useDimensions";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

type DataProps = {
  year: number;
  ppm: number;
};

const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };

export const CO2Component = () => {
  const vizRef = useRef(null);
  const { width, height } = useDimensions(vizRef);
  const [data, setData] = useState<DataProps[] | null>(null);

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
    <div className="w-full max-w-7xl justify-center items-center mx-auto m-6 pb-10 pt-10">
      <div className="w-full min-h-[60rem] relative" ref={vizRef}>
        {data && <CO2Viz width={width} height={height} data={data} />}
      </div>
    </div>
  );
};

type CO2VizProps = {
  width: number;
  height: number;
  data: DataProps[];
};

const MIN_RADIUS = 4;
const RADIUS_SCALE = 7;

const CO2Viz = ({ width, height, data }: CO2VizProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const boundsWidth = width - MARGIN.left - MARGIN.right;
  const boundsHeight = height / 2 + 500;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    setParticles(generateParticles(data[0].ppm));
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !data.length) return;

    let frame: number;
    let running = true;

    const draw = () => {
      if (!running || !ctx) return;

      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0 || p.x > boundsWidth) p.dx *= -1;
        if (p.y < 0 || p.y > boundsHeight) p.dy *= -1;
      });

      ctx.fillStyle = "#000";
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      frame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      running = false;
      cancelAnimationFrame(frame);
    };
  }, [particles, width, height]);

  const startAnimation = () => {
    let yearIndex = 0;

    const step = () => {
      if (yearIndex >= data.length) return;

      const current = data[yearIndex];
      const nextParticleCount = Math.floor(current.ppm);

      setParticles((prev) => {
        const currentCount = prev.length;
        const countToAdd = nextParticleCount - currentCount;
        const newParticles = generateParticles(countToAdd);
        return [...prev, ...newParticles];
      });

      setCurrentIndex(yearIndex);
      yearIndex++;

      setTimeout(step, 300);
    };

    step();
  };

  const generateParticles = (num: number) => {
    const newParticles = d3.range(num).map(() => ({
      x: Math.random() * boundsWidth,
      y: Math.random() * boundsHeight,
      r: Math.random() * RADIUS_SCALE + MIN_RADIUS,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
    }));
    return newParticles;
  };

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        width={width}
        height={height / 2}
        style={{ display: "block" }}
      />
      <YearsComponent
        data={data}
        current={data[currentIndex]}
        setCurrent={(newCurrent) => {
          const index = data.findIndex((d) => d.year === newCurrent.year);
          setCurrentIndex(index);
          const particleCount = Math.floor(newCurrent.ppm);
          const newParticles = generateParticles(particleCount);
          setParticles(newParticles);
        }}
        playAnimation={startAnimation}
      />
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
