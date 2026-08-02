/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useUSStatesMap, { type IStateFeature } from "../../hooks/useUSStatesMap";
import "./AmericaMap.scss";
import { useAuth } from "@/context/AuthContext";
import Tooltip from "../Tooltip/Tooltip";

export default function AmericaMap() {
  const tooltip = useRef<HTMLDivElement>(null);
  const [tooltipContent, setTooltipContent] = useState<ReactNode>(null);
  const [mapStates, setMapStates] = useState<IStateFeature[]>([]);
  const { mapData, partiesData } = useAuth();

  const mapSize: [number, number] = useMemo(() => [400, 400], []);

  const { constructStates, isMatchState, getRegionColor, getRegionHoverColor } =
    useUSStatesMap();

  const renderTooltipContent = useCallback(
    (state: IStateFeature): ReactNode => {
      return (
        <div className="AmericaMap--tooltip">
          <div className="AmericaMap--tooltip--title">{state.STATE_NAME}</div>
          <hr />
          <div className="p-3">
            <div className="AmericaMap--tooltip--content">
              <ul>
                {partiesData?.map((e: string, index: number) => {
                  if (
                    mapData?.[state.STATE_NAME] !== undefined &&
                    mapData[state.STATE_NAME][e] !== undefined
                  ) {
                    return (
                      <li key={index}>
                        {`${e}: `}
                        {mapData[state.STATE_NAME][e]}
                      </li>
                    );
                  }
                  return null;
                })}
                {mapData?.[state.STATE_NAME]?.sum !== undefined && (
                  <span>Total # of votes: {mapData[state.STATE_NAME].sum}</span>
                )}
              </ul>
            </div>
          </div>
        </div>
      );
    },
    [mapData, partiesData],
  );

  const handleMouseOverState = useCallback(
    (evt: React.MouseEvent<SVGPathElement>, state: IStateFeature) => {
      if (tooltip.current) {
        tooltip.current.style.display = "block";
        tooltip.current.style.left = `${evt.pageX + 10}px`;
        tooltip.current.style.top = `${evt.pageY + 10}px`;
        setTooltipContent(renderTooltipContent(state));
      }
      setMapStates((prev) =>
        prev.map((m) => ({
          ...m,
          svg: {
            ...m.svg,
            stroke: isMatchState(m, state)
              ? getRegionHoverColor()
              : m.svg.stroke,
            fill: isMatchState(m, state) ? getRegionHoverColor() : m.svg.fill,
          },
        })),
      );
    },
    [renderTooltipContent, isMatchState, getRegionHoverColor],
  );

  const handleMouseLeaveState = useCallback(() => {
    if (tooltip.current) {
      tooltip.current.style.display = "none";
    }
    setMapStates((prev) =>
      prev.map((m) => ({
        ...m,
        svg: { ...m.svg, stroke: getRegionColor(), fill: getRegionColor() },
      })),
    );
  }, [getRegionColor]);

  useEffect(() => {
    let active = true;
    constructStates(mapSize).then((initial) => {
      if (active) setMapStates(initial);
    });
    return () => {
      active = false;
    };
  }, [constructStates, mapSize]);

  return (
    <div className="AmericaMap">
      <div ref={tooltip} style={{ position: "absolute", display: "none" }}>
        <Tooltip>{tooltipContent}</Tooltip>
      </div>
      <svg
        className="AmericaMap--svg"
        width={mapSize[0]}
        height={mapSize[1]}
        stroke="black"
      >
        {mapStates.map((state) => (
          <path
            id={state.OBJECTID.toString()}
            key={state.STATE_NAME}
            {...state.svg}
            onMouseMove={(e) => handleMouseOverState(e, state)}
            onMouseLeave={handleMouseLeaveState}
            stroke="white"
            strokeWidth={0.5}
          />
        ))}
      </svg>
    </div>
  );
}
