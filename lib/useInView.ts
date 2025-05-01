import { useState, useEffect } from "react";

export const useInView = (ref: React.RefObject<HTMLElement | null>, threshold = 0.5) => {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, threshold]);

  return isInView;
};