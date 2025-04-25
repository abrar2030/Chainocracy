"use client";
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Link } from "react-router-dom";
export const columns = [
    {
        accessorKey: "id",
        header: "#",
    },
    {
        accessorKey: "hashBlock",
        header: "Hash block",
        cell: ({ row }) => {
            const blockHash = row.getValue("hashBlock");
            if (typeof blockHash === 'string')
                return (_jsx(Link, { to: `/blockchain/block-details/${blockHash}`, children: _jsxs("span", { children: [blockHash.substring(0, ("0xabcdef123456789").length), "..."] }) }));
            return '';
        }
    },
    {
        accessorKey: "nonce",
        header: "Nonce"
    },
    {
        accessorKey: "numOfTransactions",
        header: "# of Tx",
    },
    {
        accessorKey: "dateAndTime",
        header: "Date and Time",
        cell: ({ row }) => {
            const x = parseInt(row.getValue("dateAndTime"));
            return new Date(x).toUTCString();
        }
    },
    {
        accessorKey: "size",
        header: "Size"
    }
];
