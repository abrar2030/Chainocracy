import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader";
import CustomDropMenuPopulation from "./CustomDropMenuPopulation";
export const columns = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "electoralId",
        header: "Electoral Number",
    },
    {
        accessorKey: "name",
        header: ({ column }) => (_jsx(DataTableColumnHeader, { column: column, title: "Full-name" })),
    },
    {
        accessorKey: "address",
        header: ({ column }) => {
            return (_jsxs(Button, { variant: "ghost", onClick: () => column.toggleSorting(column.getIsSorted() === "asc"), children: ["Address", _jsx(ArrowUpDown, { className: "ml-2 h-4 w-4" })] }));
        },
    },
    {
        accessorKey: "province",
        header: "Province",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status");
            if (status === "verified") {
                return (_jsx("span", { className: "text-right bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-md dark:bg-green-900 dark:text-green-300", children: status }));
            }
            else if (status === "pending" || status === "processing") {
                return (_jsx("span", { className: "text-right bg-orange-100 text-orange-800 text-sm font-medium px-2.5 py-0.5 rounded-md dark:bg-orange-900 dark:text-orange-300", children: status }));
            }
            return (_jsx("span", { className: "text-right  bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-md dark:bg-red-900 dark:text-red-300", children: status }));
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const citizen = row.original;
            return (_jsx(_Fragment, { children: _jsx(CustomDropMenuPopulation, { citizen: citizen, setData: citizen.setData, toast: citizen.toast }) }));
        },
    },
];
