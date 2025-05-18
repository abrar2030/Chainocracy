// import { Voter } from "@/data_types";

export const columns = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "voted",
    header: "Voted",
    cell: ({ row }) => {
      return row.original.voted ? "Yes" : "No";
    },
  },
  {
    accessorKey: "votedFor",
    header: "Voted For",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const voter = row.original;
      return (
        <div>
          <button onClick={() => console.log("View voter", voter.id)}>View</button>
          <button onClick={() => console.log("Verify voter", voter.id)}>Verify</button>
        </div>
      );
    },
  },
];
