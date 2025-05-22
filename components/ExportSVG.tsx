"use client";
import { useCallback } from "react";

export default function ExportSVGsButton() {
  const exportSVGs = useCallback(() => {
    document.querySelectorAll("svg").forEach((svg, index) => {
      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(svg);

      if (!source.includes('xmlns="http://www.w3.org/2000/svg"')) {
        source = source.replace(
          /^<svg/,
          '<svg xmlns="http://www.w3.org/2000/svg"'
        );
      }
      if (!source.includes("xmlns:xlink")) {
        source = source.replace(
          /^<svg/,
          '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
        );
      }

      const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `exported_svg_${index + 1}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }, []);

  return (
    <button
      onClick={exportSVGs}
      className="absolute bottom-4 px-8 rounded font-semibold font-mono p-2 bg-orange-300 hover:cursor-pointer hover:bg-orange-100"
    >
      Export SVGs
    </button>
  );
}
