import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/no-explicit-any */
import useCoffeeDataamerica from '../../hooks/useCoffeeDataamerica';
import './americaMap.scss';
import { useEffect, useMemo, useRef, useState, } from 'react';
import { useAuth } from '@/context/AuthContext';
import Tooltip from '../Tooltip/Tooltip';
export default function americaMap() {
    const tooltip = useRef(null);
    const [tooltipContent, setTooltipContent] = useState(null);
    const [mapProvincies, setMapProvincies] = useState([]);
    const { mapData, partiesData } = useAuth();
    const width = 400;
    const height = 400;
    const { constructProvincies, isMatchCoffeeRegion, getRegionColor, getRegionHoverColor, } = useCoffeeDataamerica();
    const mapSize = useMemo(() => {
        return [
            (width) || 0,
            (height) || 0
        ];
    }, [height, width]);
    const handleMouseOverCountry = (evt, provincy) => {
        if (tooltip?.current) {
            tooltip.current.style.display = "block";
            tooltip.current.style.left = evt.pageX + 10 + 'px';
            tooltip.current.style.top = evt.pageY + 10 + 'px';
            setTooltipContent(renderTooltipContent(provincy));
        }
        setMapProvincies(mapProvincies
            .map(m => {
            if (isMatchCoffeeRegion(m, provincy)) {
                return {
                    ...m,
                    svg: {
                        ...m.svg,
                        stroke: getRegionHoverColor(),
                        fill: getRegionHoverColor(),
                    }
                };
            }
            return m;
        }));
    };
    const handleMouseLeaveCountry = () => {
        if (tooltip?.current) {
            tooltip.current.style.display = "none";
        }
        setMapProvincies(mapProvincies
            .map(m => {
            return {
                ...m,
                svg: {
                    ...m.svg,
                    stroke: getRegionColor(),
                    fill: getRegionColor(),
                }
            };
        }));
    };
    const renderTooltipContent = (provincy) => {
        return (_jsxs("div", { className: "WorldMap--tooltip", children: [_jsx("div", { className: "WorldMap--tooltip--title", children: provincy.Nome_Prov_ }), _jsx("hr", {}), _jsx("div", { className: 'p-3', children: _jsx("div", { className: "WorldMap--tooltip--content", children: _jsxs("ul", { children: [partiesData && partiesData.map((e, index) => {
                                    if (mapData[provincy.Nome_Prov_] !== undefined && mapData[provincy.Nome_Prov_][e] !== undefined) {
                                        return (_jsxs("li", { children: [e + ': ', mapData[provincy.Nome_Prov_][e]] }, index));
                                    }
                                    return null;
                                }), mapData[provincy.Nome_Prov_] && mapData[provincy.Nome_Prov_]['sum'] !== undefined && (_jsxs("span", { children: ["Total # of votes: ", mapData[provincy.Nome_Prov_]['sum']] }, 100))] }) }) })] }));
    };
    useEffect(() => {
        const initialmapProvincies = constructProvincies(mapSize);
        setMapProvincies(initialmapProvincies);
    }, [constructProvincies, mapSize]);
    return (_jsxs("div", { className: "americaMap", children: [_jsx("div", { ref: tooltip, style: { position: 'absolute', display: 'none' }, children: _jsx(Tooltip, { children: tooltipContent }) }), _jsx("svg", { className: "americaMap--svg", width: mapSize[0], height: mapSize[1], stroke: 'black', children: mapProvincies && mapProvincies.map(provincy => {
                    return (_jsx("path", { id: provincy.OBJECTID.toString(), ...provincy.svg, onMouseMove: (e) => handleMouseOverCountry(e, provincy), onMouseLeave: () => handleMouseLeaveCountry(), stroke: 'white', strokeWidth: 0.5 }, provincy.Nome_Prov_));
                }) })] }));
}
