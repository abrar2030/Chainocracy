import { jsx as _jsx } from "react/jsx-runtime";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { columns } from "./columns";
import { DataTable } from "./data-table";
function TableUsers({ data }) {
    return (_jsx("section", { children: _jsx(DataTable, { columns: columns, data: data }) }));
}
export default TableUsers;
