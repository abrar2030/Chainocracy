import { jsx as _jsx } from "react/jsx-runtime";
import { columns } from "./columns";
import { DataTable } from "./data-table-public";
export default function TableElectionResultsPublic({ data }) {
    if (data === undefined) {
        return (_jsx("div", { children: _jsx("span", { children: "Table unavaialble!" }) }));
    }
    return (_jsx("section", { children: _jsx(DataTable, { columns: columns, data: data }) }));
}
