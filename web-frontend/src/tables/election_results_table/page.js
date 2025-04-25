import { jsx as _jsx } from "react/jsx-runtime";
import { columns } from "./columns";
import { DataTable } from "./data-table";
export default function TableElectionResults({ data }) {
    if (data === undefined) {
        return (_jsx("div", { children: _jsx("span", { children: "Table unavaialble!" }) }));
    }
    return (_jsx("section", { children: _jsx(DataTable, { columns: columns, data: data }) }));
}
