import React, { ReactNode } from "react";
import clsx from "clsx";

type StickyProps = {
  margin: number;
  children: ReactNode;
  bg?: string;
};

export const Sticky = ({ margin, children, bg = "bg-white" }: StickyProps) => {
  return (
    <div className={clsx("relative", bg)} style={{ height: `${margin}vh` }}>
      <div className="sticky top-0">{children}</div>
    </div>
  );
};
