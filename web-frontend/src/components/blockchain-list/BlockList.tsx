/* eslint-disable @typescript-eslint/no-explicit-any */

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { GLOBAL_VARIABLES } from "@/global/globalVariables";

interface Block {
  id: number;
  hashBlock: string;
  size: number;
}

function getData(start: number, count: number): Block[] {
  const blocks: Block[] = [];
  for (let id = start; id <= count; id++) {
    const randomSize = Math.floor(Math.random() * 301);
    blocks.push({ id, hashBlock: "", size: randomSize });
  }
  return blocks;
}

const leftItem = () => (
  <div
    className="justify-start"
    style={{ width: "40px", height: "2px", backgroundColor: "#999999" }}
  />
);

const rightItem = () => (
  <div
    className="justify-end"
    style={{ width: "40px", height: "2px", backgroundColor: "#999999" }}
  />
);

const middleItem = (id: number, hashBlock: string, blockSize: number) => {
  const maxSize: number = 300;
  const perc: number = Math.min((blockSize * 100) / maxSize, 100);

  return (
    <div
      style={{
        width: "60px",
        height: "90px",
        flex: "1",
        padding: 4,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        border: "2px solid #999999",
        boxShadow: "2px 2px 6px rgba(0, 0, 0, 0.1)",
        background: "#f9f9f9",
        borderRadius: "0.5rem",
      }}
    >
      <div
        className="flex flex-col"
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          justifyContent: "center",
          background: "linear-gradient(to left top, #FFFFFF, #a2d7f6)",
          boxShadow: "inset 2px 2px 6px rgba(0, 0, 0, 0.1)",
          borderRadius: "0.4rem",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            flex: 1,
            background: "linear-gradient(to left top, #FFFFFF, #a2d7f6)",
          }}
        />
        <div
          style={{
            height: `${perc}%`,
            background: "linear-gradient(to left top, #FFFFFF, #2EA8ED)",
          }}
        />
      </div>
      <div>
        <Link to={`/blockchain/block-details/${hashBlock}`}>
          <span
            className="font-inria-sans text-sm text-gray-400 flex justify-center relative bottom-0"
            style={{ paddingTop: "10px" }}
          >
            #{id}
          </span>
        </Link>
      </div>
    </div>
  );
};

const CardItem = ({
  id,
  hashBlock,
  index,
  len,
  blockSize,
}: {
  id: number;
  hashBlock: string;
  index: number;
  len: number;
  blockSize: number;
}) => (
  <div key={id} className="flex flex-col items-center gap-0.5">
    <div className="flex flex-row items-center h-full">
      {leftItem()}
      {middleItem(id, hashBlock, blockSize)}
      {index + 1 < len ? rightItem() : null}
    </div>
  </div>
);

export default function BlockList() {
  const URI = `http://${GLOBAL_VARIABLES.LOCALHOST}/api/blockchain/blocks`;

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["block-list"],
    // Backend responses are wrapped as {success, message, data, timestamp};
    // unwrap to the actual block list here.
    queryFn: () =>
      fetch(URI)
        .then((res) => res.json())
        .then((json) => json.data),
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      refetch();
    }, 10000);
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
    return (
      <div className="py-2 text-sm text-gray-400">
        Could not load blockchain data. Backend may be offline.
      </div>
    );
  }

  const allBlocks = Array.isArray(data)
    ? data.concat(getData(data.length + 1, 100)).flat()
    : getData(1, 10);

  return (
    <div className="flex">
      <ul
        className="overflow-x-auto no-scrollbar"
        style={{
          display: "flex",
          flexDirection: "row",
          height: "max",
          padding: 0,
          paddingBottom: 25,
          margin: 0,
          listStyle: "none",
        }}
      >
        {allBlocks.map((item: any, index: number) => (
          <li key={`${item.id}-${index}`}>
            <CardItem
              id={item.id}
              hashBlock={item.hashBlock}
              index={index}
              len={Array.isArray(data) ? data.length : 0}
              blockSize={item.size}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
