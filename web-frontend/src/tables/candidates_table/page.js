import { jsx as _jsx } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { columns } from "./columns";
import { DataTable } from "./data-table";
export default function TableCandidates({ data }) {
    return (_jsx("section", { children: _jsx(DataTable, { columns: columns, data: data }) }));
}
