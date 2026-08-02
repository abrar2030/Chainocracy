/* eslint-disable @typescript-eslint/no-explicit-any */

import { geoAlbersUsa, geoPath } from "d3-geo";
import type { SVGProps } from "react";
import geoJsonUrl from "../assets/america.json?url";

let geoJsonCache: { features: any[] } | null = null;

const loadGeoJson = async (): Promise<{ features: any[] }> => {
  if (!geoJsonCache) {
    const res = await fetch(geoJsonUrl);
    geoJsonCache = await res.json();
  }
  return geoJsonCache as { features: any[] };
};

export interface IStateFeature {
  OBJECTID: number;
  STATE_FIPS: string;
  STATE_NAME: string;
  STATE_ABBR: string;
  svg: SVGProps<SVGPathElement>;
}

const colors = {
  hover: {
    color: "#F29EB0",
  },
  default: {
    color: "#5C92CD",
  },
};

const constructStates = async (
  mapSize: [number, number],
): Promise<IStateFeature[]> => {
  const geoJson = await loadGeoJson();
  const projection = geoAlbersUsa().fitSize(mapSize, geoJson as any);
  const geoPathGenerator = geoPath().projection(projection);

  const states = geoJson.features.map((feature: any) => {
    const svgProps: SVGProps<SVGPathElement> = {
      d: geoPathGenerator(feature as any) || "",
      stroke: colors.default.color,
      fill: colors.default.color,
    };

    const res: IStateFeature = {
      OBJECTID: feature.properties.OBJECTID,
      STATE_FIPS: feature.properties.STATE_FIPS,
      STATE_NAME: feature.properties.STATE_NAME,
      STATE_ABBR: feature.properties.STATE_ABBR,
      svg: svgProps,
    };

    return res;
  });

  return states;
};

const getRegionColor = () => {
  return colors.default.color;
};

const getRegionHoverColor = () => {
  return colors.hover.color;
};

const isMatchState = (source: IStateFeature, target: IStateFeature) => {
  return source.STATE_NAME === target.STATE_NAME;
};

const useUSStatesMap = () => {
  return {
    constructStates,
    getRegionColor,
    getRegionHoverColor,
    isMatchState,
  };
};

export default useUSStatesMap;
