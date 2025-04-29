import { useState, useEffect, useLayoutEffect } from 'react';

export const useDimensions = (targetRef: React.RefObject<HTMLDivElement | null>) => {
  const getDimensions = () => {
    if (targetRef.current) {
      return {
        width: targetRef.current.offsetWidth,
        height: targetRef.current.offsetHeight,
      };
    } else {
      return { width: 0, height: 0 }; // Default to 0 if the ref is null
    }
  };

  const [dimensions, setDimensions] = useState(getDimensions);

  const handleResize = () => {
    setDimensions(getDimensions());
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useLayoutEffect(() => {
    handleResize();
  }, []);

  return dimensions;
};