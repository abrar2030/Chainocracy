import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { GLOBAL_VARIABLES } from "@/global/globalVariables";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default function TableBlocks() {
  const URI = `http://${GLOBAL_VARIABLES.LOCALHOST}/api/blockchain/blocks`;

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["blocks"],
    // Backend responses are wrapped as {success, message, data, timestamp};
    // unwrap to the actual block list here.
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
        <span className="text-sm text-gray-400">Loading blocks...</span>
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-sm text-gray-400 py-2">Unable to load blocks.</p>;
  }

  return (
    <section>
      <DataTable columns={columns} data={Array.isArray(data) ? data : []} />
    </section>
  );
}
