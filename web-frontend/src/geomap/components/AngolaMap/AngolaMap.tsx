/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useCoffeeDataAmerica, {
  type IMapProvincy,
} from "../../hooks/useCoffeeDataAmerica";
import "./AngolaMap.scss";
import { useAuth } from "@/context/AuthContext";
import Tooltip from "../Tooltip/Tooltip";

export default function AngolaMap() {
  const tooltip = useRef<HTMLDivElement>(null);
  const [tooltipContent, setTooltipContent] = useState<ReactNode>(null);
  const [mapProvincies, setMapProvincies] = useState<IMapProvincy[]>([]);
  const { mapData, partiesData } = useAuth();

  const mapSize: [number, number] = useMemo(() => [400, 400], []);

  const {
    constructProvincies,
    isMatchCoffeeRegion,
    getRegionColor,
    getRegionHoverColor,
  } = useCoffeeDataAmerica();

  const renderTooltipContent = useCallback(
    (provincy: IMapProvincy): ReactNode => {
      return (
        <div className="WorldMap--tooltip">
          <div className="WorldMap--tooltip--title">{provincy.Nome_Prov_}</div>
          <hr />
          <div className="p-3">
            <div className="WorldMap--tooltip--content">
              <ul>
                {partiesData?.map((e: string, index: number) => {
                  if (
                    mapData?.[provincy.Nome_Prov_] !== undefined &&
                    mapData[provincy.Nome_Prov_][e] !== undefined
                  ) {
                    return (
                      <li key={index}>
                        {`${e}: `}
                        {mapData[provincy.Nome_Prov_][e]}
                      </li>
                    );
                  }
                  return null;
                })}
                {mapData?.[provincy.Nome_Prov_]?.sum !== undefined && (
                  <span>
                    Total # of votes: {mapData[provincy.Nome_Prov_].sum}
                  </span>
                )}
              </ul>
            </div>
          </div>
        </div>
      );
    },
    [mapData, partiesData],
  );

  const handleMouseOverCountry = useCallback(
    (evt: React.MouseEvent<SVGPathElement>, provincy: IMapProvincy) => {
      if (tooltip.current) {
        tooltip.current.style.display = "block";
        tooltip.current.style.left = `${evt.pageX + 10}px`;
        tooltip.current.style.top = `${evt.pageY + 10}px`;
        setTooltipContent(renderTooltipContent(provincy));
      }
      setMapProvincies((prev) =>
        prev.map((m) => ({
          ...m,
          svg: {
            ...m.svg,
            stroke: isMatchCoffeeRegion(m, provincy)
              ? getRegionHoverColor()
              : m.svg.stroke,
            fill: isMatchCoffeeRegion(m, provincy)
              ? getRegionHoverColor()
              : m.svg.fill,
          },
        })),
      );
    },
    [renderTooltipContent, isMatchCoffeeRegion, getRegionHoverColor],
  );

  const handleMouseLeaveCountry = useCallback(() => {
    if (tooltip.current) {
      tooltip.current.style.display = "none";
    }
    setMapProvincies((prev) =>
      prev.map((m) => ({
        ...m,
        svg: {
          ...m.svg,
          stroke: getRegionColor(),
          fill: getRegionColor(),
        },
      })),
    );
  }, [getRegionColor]);

  useEffect(() => {
    let active = true;
    constructProvincies(mapSize).then((initial) => {
      if (active) setMapProvincies(initial);
    });
    return () => {
      active = false;
    };
  }, [constructProvincies, mapSize]);

  return (
    <div className="AngolaMap">
      <div ref={tooltip} style={{ position: "absolute", display: "none" }}>
        <Tooltip>{tooltipContent}</Tooltip>
      </div>
      <svg
        className="AngolaMap--svg"
        width={mapSize[0]}
        height={mapSize[1]}
        stroke="black"
      >
        {mapProvincies.map((provincy) => (
          <path
            id={provincy.OBJECTID.toString()}
            key={provincy.Nome_Prov_}
            {...provincy.svg}
            onMouseMove={(e) => handleMouseOverCountry(e, provincy)}
            onMouseLeave={handleMouseLeaveCountry}
            stroke="white"
            strokeWidth={0.5}
          />
        ))}
      </svg>
    </div>
  );
}
