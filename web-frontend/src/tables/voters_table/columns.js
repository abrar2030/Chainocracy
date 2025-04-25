import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import CustomDropMenuVoter from "./CustomDropMenuVoters";
export const columns = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "identifier",
        header: "Identifier",
    },
    {
        accessorKey: "electoralId",
        header: "Electoral Number",
    },
    {
        accessorKey: "choiceCode",
        header: "Choice Code",
    },
    {
        accessorKey: "state",
        header: "Vote State",
        cell: ({ row }) => {
            const state = row.getValue("state");
            if (state !== "false") {
                return (_jsx("span", { className: "text-right bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-md dark:bg-green-900 dark:text-green-300", children: "Done" }));
            }
            return (_jsx("span", { className: "text-right  bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-md dark:bg-red-900 dark:text-red-300", children: "Not yet" }));
        },
    },
    {
        accessorKey: "secret",
        header: "Verification",
        cell: ({ row }) => {
            const secret = row.getValue("secret");
            if (typeof secret === 'string')
                return (_jsxs("span", { children: [secret.substring(0, ("0xabcdef123456789").length), "..."] }));
            else
                return '';
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const voter = row.original;
            return (_jsx(_Fragment, { children: _jsx(CustomDropMenuVoter, { voter: voter }) }));
        },
    },
];
