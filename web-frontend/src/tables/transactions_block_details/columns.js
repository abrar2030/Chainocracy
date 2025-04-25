import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const columns = [
    {
        accessorKey: "id",
        header: "#",
    },
    {
        accessorKey: "transactionHash",
        header: "Hash Transaction",
        cell: ({ row }) => {
            const transactionHash = row.getValue("transactionHash");
            if (typeof transactionHash === 'string')
                return transactionHash.substring(0, ("0xabcdef123456789").length);
            return '';
        }
    },
    {
        accessorKey: "identifier",
        header: "Vote ID",
        cell: ({ row }) => {
            const identifier = row.getValue("identifier");
            if (typeof identifier === 'string')
                return (_jsx("span", { children: identifier.substring(0, ("000000000").length) }));
            return '';
        }
    },
    {
        accessorKey: "choiceCode",
        header: "Vote",
        cell: ({ row }) => {
            let choiceCode = row.getValue("choiceCode");
            if (typeof choiceCode === 'string') {
                choiceCode = choiceCode === '-' ? '' : choiceCode;
                return (_jsxs("span", { children: [choiceCode.substring(0, ("000000000").length), "..."] }));
            }
            return '';
        }
    },
    {
        accessorKey: "voteTime",
        header: "Date and Time",
        cell: ({ row }) => {
            const x = parseInt(row.getValue("voteTime"));
            return new Date(x).toUTCString();
        }
    }
];
