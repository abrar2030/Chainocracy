/* eslint-disable @typescript-eslint/no-explicit-any */

import { geoEquirectangular, geoPath } from "d3-geo";
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

export interface ICoffeeDistributor {
  Rank: string;
  Country: string;
  Bags: string;
  MetricTons: string;
  Pounds: string;
}

export interface ITasteProfile {
  summary: string;
}

export interface IMapProvincy {
  OBJECTID: number;
  Cod_Alfa_P: string;
  Nome_Prov_: string;
  Cod_Alfa_N: string;
  tasteProfile: ITasteProfile | null;
  Cod_Pais: string;
  svg: SVGProps<SVGPathElement>;
}

const colors = {
  normal: {
    color: "#F29EB0",
    alt: "#F29EB0",
  },
  default: {
    color: "#5C92CD",
    alt: "#5C92CD",
  },
};

const constructProvincies = async (
  mapSize: [number, number],
): Promise<IMapProvincy[]> => {
  const geoJson = await loadGeoJson();
  const projection = geoEquirectangular().fitSize(mapSize, geoJson as any);
  const geoPathGenerator = geoPath().projection(projection);

  const americaCountry = geoJson.features.map((feature: any) => {
    const svgProps: SVGProps<SVGPathElement> = {
      d: geoPathGenerator(feature as any) || "",
      stroke: colors.default.color,
      fill: colors.default.color,
    };

    const res: IMapProvincy = {
      OBJECTID: feature.properties.OBJECTID,
      Cod_Alfa_P: feature.properties.Cod_Alfa_P,
      Nome_Prov_: feature.properties.Nome_Prov_,
      Cod_Alfa_N: feature.properties.Cod_Alfa_N,
      tasteProfile: feature.properties.Nome_Prov_,
      Cod_Pais: feature.properties.Cod_Pais,
      svg: svgProps,
    };

    return res;
  });

  return americaCountry;
};

const getCoffeeRegionName = (region: string) => {
  if (region in colors) {
    return region;
  }

  return null;
};

const getRegionColor = () => {
  return colors.default.color;
};

const getRegionHoverColor = () => {
  return colors.normal.color;
};

const isMatchCoffeeRegion = (source: IMapProvincy, target: IMapProvincy) => {
  return source.Nome_Prov_ === target.Nome_Prov_;
};

const useCoffeeDataAmerica = () => {
  return {
    constructProvincies,
    getCoffeeRegionName,
    getRegionColor,
    getRegionHoverColor,
    isMatchCoffeeRegion,
  };
};

export default useCoffeeDataAmerica;
