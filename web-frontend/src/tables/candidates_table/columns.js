import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import CustomDropMenuCandidate from "./CustomDropMenuCandidate";
import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader";
export const columns = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "code",
        header: "Code",
    },
    {
        accessorKey: "name",
        header: ({ column }) => (_jsx(DataTableColumnHeader, { column: column, title: "Full-name" })),
    },
    {
        accessorKey: "candidadePhoto",
        header: "Candidade Photo",
        cell: ({ row }) => {
            const user = row.original;
            const url = user.candidadePhoto;
            return (_jsx(_Fragment, { children: _jsx("img", { height: 60, width: 60, src: url, className: "rounded-full" }) }));
        },
    },
    {
        accessorKey: "partyImage",
        header: "Party Image",
        cell: ({ row }) => {
            const user = row.original;
            const url = user.partyImage;
            return (_jsx(_Fragment, { children: _jsx("img", { height: 60, width: 60, src: url, className: "rounded-full" }) }));
        },
    },
    {
        accessorKey: "party",
        header: ({ column }) => (_jsx(DataTableColumnHeader, { column: column, title: "Party" })),
    },
    {
        accessorKey: "acronym",
        header: "Acronym"
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
            const candidate = row.original;
            return (_jsx(_Fragment, { children: _jsx(CustomDropMenuCandidate, { candidate: candidate }) }));
        },
    },
];
