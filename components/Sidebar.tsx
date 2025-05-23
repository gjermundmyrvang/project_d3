"use client";
import { useEffect, useState } from "react";

const sections = [
  { id: "welcome", label: "Welcome" },
  { id: "anomaly", label: "Global Warming" },
  { id: "map", label: "The Contributors" },
  { id: "co2", label: "Rising CO2 Levels" },
  { id: "river", label: "Melting Ice, Shrinking Glaciers" },
  { id: "sea", label: "Oceans on the Rise" },
  { id: "references", label: "References" },
];

export const Sidebar = () => {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <aside className="w-48 fixed top-0 left-0 h-full bg-gray-800 p-2 shadow z-50">
      <ul className="space-y-2">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={`block p-2 rounded font-semibold font-mono ${
                activeId === s.id ? "bg-gray-700 text-white" : "text-gray-400"
              }`}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
};
