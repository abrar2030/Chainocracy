import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { flexRender, getSortedRowModel, getCoreRowModel, getPaginationRowModel, useReactTable, getFilteredRowModel, } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { DataTablePagination } from "@/components/ui/DataTablePagination";
export function DataTable({ columns, data, }) {
    const [sorting, setSorting] = React.useState([]);
    const [columnFilters, setColumnFilters] = React.useState([]);
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 4,
    });
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
            pagination,
        },
        onPaginationChange: setPagination,
    });
    return (_jsxs("div", { className: "", children: [_jsxs("div", { className: "flex gap-2 justify-between py-4", children: [_jsx(Input, { placeholder: "Filter Hash Transaction ...", value: table.getColumn("transactionHash")?.getFilterValue() ?? "", onChange: (event) => table.getColumn("transactionHash")?.setFilterValue(event.target.value), className: "max-w-lg" }), _jsx(Input, { placeholder: "Filter Vote ID ...", value: table.getColumn("identifier")?.getFilterValue() ?? "", onChange: (event) => table.getColumn("identifier")?.setFilterValue(event.target.value), className: "max-w-md" })] }), _jsx("div", { className: "rounded-md border", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: table.getHeaderGroups().map((headerGroup) => (_jsx(TableRow, { children: headerGroup.headers.map((header) => {
                                    return (_jsx(TableHead, { children: header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext()) }, header.id));
                                }) }, headerGroup.id))) }), _jsx(TableBody, { children: table.getRowModel().rows?.length ? (table.getRowModel().rows.map((row) => (_jsx(TableRow, { "data-state": row.getIsSelected() && "selected", children: row.getVisibleCells().map((cell) => (_jsx(TableCell, { children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id))) }, row.id)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: columns.length, className: "h-24 text-center", children: "No results." }) })) })] }) }), _jsx("div", { className: "flex items-center justify-end space-x-2 py-4", children: _jsx(DataTablePagination, { table: table }) })] }));
}
