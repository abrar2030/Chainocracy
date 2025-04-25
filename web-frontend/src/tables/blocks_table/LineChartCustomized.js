import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PureComponent } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Brush, AreaChart, Area, ResponsiveContainer, } from 'recharts';
const data = [
    {
        name: 'Day 1',
        uv: 4000,
        pv: 2400,
        amt: 2400,
    },
    {
        name: 'Day 2',
        uv: 3000,
        pv: 1398,
        amt: 2210,
    },
    {
        name: 'Day 3',
        uv: 2000,
        pv: 9800,
        amt: 2290,
    },
    {
        name: 'Day 4',
        uv: 2780,
        pv: 3908,
        amt: 2000,
    },
    {
        name: 'Day 5',
        uv: 1890,
        pv: 4800,
        amt: 2181,
    },
    {
        name: 'Day 6',
        uv: 2390,
        pv: 3800,
        amt: 2500,
    },
    {
        name: 'Day 7',
        uv: 3490,
        pv: 4300,
        amt: 2100,
    },
];
class LineChartCustomized extends PureComponent {
    render() {
        return (_jsxs("div", { style: { width: '100%' }, children: [_jsx("span", { className: 'font-inria-sans text-md text-gray-400', children: "Average # of transactions per day" }), _jsx(ResponsiveContainer, { width: "100%", height: 200, children: _jsxs(LineChart, { width: 500, height: 200, data: data, syncId: "anyId", margin: {
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                        }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "name" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Line, { type: "monotone", dataKey: "pv", stroke: "#82ca9d", fill: "#82ca9d" }), _jsx(Brush, {})] }) }), _jsx(ResponsiveContainer, { width: "100%", height: 200, children: _jsxs(AreaChart, { width: 500, height: 200, data: data, syncId: "anyId", margin: {
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                        }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "name" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Area, { type: "monotone", dataKey: "pv", stroke: "#82ca9d", fill: "#82ca9d" })] }) })] }));
    }
}
Object.defineProperty(LineChartCustomized, "demoUrl", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 'https://codesandbox.io/s/synchronized-line-charts-zc3nl'
});
export default LineChartCustomized;
