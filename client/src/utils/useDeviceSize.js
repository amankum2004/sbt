import { useEffect, useMemo, useState } from "react";

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

const FALLBACK_WIDTH = BREAKPOINTS.lg;
const FALLBACK_HEIGHT = 900;

const getDeviceSize = (width) => {
  if (width >= BREAKPOINTS["2xl"]) return "2xl";
  if (width >= BREAKPOINTS.xl) return "xl";
  if (width >= BREAKPOINTS.lg) return "lg";
  if (width >= BREAKPOINTS.md) return "md";
  if (width >= BREAKPOINTS.sm) return "sm";
  return "xs";
};

const getViewport = () => {
  if (typeof window === "undefined") {
    return { width: FALLBACK_WIDTH, height: FALLBACK_HEIGHT };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

const useDeviceSize = () => {
  const [viewport, setViewport] = useState(() => getViewport());

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    let rafId = 0;

    const updateViewport = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        setViewport(getViewport());
      });
    };

    window.addEventListener("resize", updateViewport, { passive: true });
    window.addEventListener("orientationchange", updateViewport, { passive: true });
    updateViewport();

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener("resize", updateViewport);
      window.removeEventListener("orientationchange", updateViewport);
    };
  }, []);

  return useMemo(() => {
    const { width, height } = viewport;
    const deviceSize = getDeviceSize(width);
    const isLandscape = width > height;
    const isMobile = width < BREAKPOINTS.md;
    const isTablet = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
    const isDesktop = width >= BREAKPOINTS.lg;

    return {
      width,
      height,
      deviceSize,
      breakpoints: BREAKPOINTS,
      isLandscape,
      isPortrait: !isLandscape,
      isMobile,
      isTablet,
      isDesktop,
      isSmallMobile: width < BREAKPOINTS.sm,
    };
  }, [viewport]);
};

export default useDeviceSize;
