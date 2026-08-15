import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { GLOBAL_VARIABLES } from "@/global/globalVariables";
import { DataTable } from "./data-table";
import { columns } from "./columns";

export default function TablePendingTransactions() {
  const URI = `http://${GLOBAL_VARIABLES.LOCALHOST}/api/blockchain/pending-transactions`;

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["pending"],
    // Backend responses are wrapped as {success, message, data, timestamp};
    // unwrap to the actual transaction list here.
    queryFn: () =>
      fetch(URI)
        .then((res) => res.json())
        .then((json) => json.data),
  });

  useEffect(() => {
    const intervalId = setInterval(() => refetch(), 5000);
    return () => clearInterval(intervalId);
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
        <span className="text-sm text-gray-400">Loading transactions...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="text-sm text-gray-400 py-2">
        Unable to load pending transactions.
      </p>
    );
  }

  return (
    <section>
      <DataTable columns={columns} data={Array.isArray(data) ? data : []} />
    </section>
  );
}
