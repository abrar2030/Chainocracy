import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { PureComponent } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
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
export default class LineChartDemo extends PureComponent {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "chart", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (interval) => (_jsx(ResponsiveContainer, { height: 250, width: "100%", children: _jsxs(LineChart, { data: data, margin: { right: 0, top: 25 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "name", interval: interval }), _jsx(YAxis, { interval: interval }), _jsx(Line, { type: "monotone", dataKey: "pv", stroke: "#F29EB0", activeDot: { r: 8 } }), _jsx(Line, { type: "monotone", dataKey: "uv", stroke: "#82ca9d" })] }) }))
        });
    }
    render() {
        return (_jsx(_Fragment, { children: this.chart('preserveEnd') }));
    }
}
