import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useQuery, } from '@tanstack/react-query';
import { GLOBAL_VARIABLES } from "@/global/globalVariables";
export default function TableTransactions() {
    const URI = 'http://' + GLOBAL_VARIABLES.LOCALHOST + '/api/blockchain/transactions';
    const { isLoading, error, data, refetch } = useQuery({
        queryKey: ['transactions'],
        queryFn: () => fetch(URI).then((res) => res.json()),
    });
    useEffect(() => {
        const intervalId = setInterval(() => {
            refetch();
        }, 5000); // 5000 milliseconds = 5 seconds
        return () => clearInterval(intervalId);
    }, [refetch]);
    if (isLoading)
        return 'Loading...';
    if (error)
        return 'An error has occurred: ' + error.message;
    return (_jsx("section", { children: _jsx(DataTable, { columns: columns, data: data }) }));
}
