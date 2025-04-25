"use client";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { ProgressBar } from "./ProgressBar";
export const columns = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "candidate",
        header: "Candidate"
    },
    {
        accessorKey: "party",
        header: "Party"
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
        accessorKey: "numOfVotes",
        header: "Total # of votes",
        cell: ({ row }) => {
            const progress = parseFloat(row.original.percentage);
            const numVotes = row.original.numVotes;
            return _jsxs("div", { className: "flex flex-col justify-center items-center text-center", children: [_jsx(ProgressBar, { value: progress }), _jsxs("div", { className: "flex flex-col", children: [_jsxs("span", { children: [numVotes, " votes"] }), _jsxs("span", { children: [progress, "%"] })] })] });
        },
    }
];
