import { jsx as _jsx } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
export default function TableTransactionsBlockDetails({ detail }) {
    const getTransactionsDetails = (transactions) => {
        const res = transactions.map((x, index) => {
            const newVal = {
                id: index + 1,
                transactionHash: x.transactionHash,
                identifier: x.data.identifier,
                choiceCode: x.data.choiceCode,
                voteTime: x.data.voteTime,
            };
            return newVal;
        });
        return res;
    };
    const [data, setData] = useState(getTransactionsDetails(detail['transactions']));
    useEffect(() => {
        // console.log("Data -> ", detail['transactions']);
        setData(getTransactionsDetails(detail['transactions']));
    }, [detail]);
    return (_jsx("section", { children: _jsx(DataTable, { columns: columns, data: data }) }));
}
