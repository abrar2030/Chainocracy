import { jsx as _jsx } from "react/jsx-runtime";
import './Tooltip.scss';
const Tooltip = ({ children }) => {
    return (_jsx("div", { className: "Tooltip", children: _jsx("div", { className: "Tooltip--content", children: children }) }));
};
export default Tooltip;
