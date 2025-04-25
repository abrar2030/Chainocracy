/* eslint-disable @typescript-eslint/no-explicit-any */
import geoJson from '../assets/angola.json';
import { geoEquirectangular, geoPath } from 'd3-geo';
const colors = {
    'normal': {
        color: '#F29EB0',
        alt: '#F29EB0'
    },
    'default': {
        color: '#5C92CD',
        alt: '#5C92CD'
    }
};
const constructProvincies = (mapSize) => {
    const projection = geoEquirectangular().fitSize(mapSize, geoJson);
    const geoPathGenerator = geoPath().projection(projection);
    const angolaCountry = geoJson.features.map((feature) => {
        const svgProps = {
            d: geoPathGenerator(feature) || '',
            stroke: colors['default'].color,
            fill: colors['default'].color,
        };
        const res = {
            OBJECTID: feature.properties.OBJECTID,
            Cod_Alfa_P: feature.properties.Cod_Alfa_P,
            Nome_Prov_: feature.properties.Nome_Prov_,
            Cod_Alfa_N: feature.properties.Cod_Alfa_N,
            tasteProfile: feature.properties.Nome_Prov_,
            Cod_Pais: feature.properties.Cod_Pais,
            svg: svgProps
        };
        return res;
    });
    return angolaCountry;
};
const getCoffeeRegionName = (region) => {
    if (region in colors) {
        return region;
    }
    return null;
};
const getRegionColor = () => {
    return colors['default'].color;
};
const getRegionHoverColor = () => {
    return colors['normal'].color;
};
const isMatchCoffeeRegion = (source, target) => {
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
