/* eslint-disable @typescript-eslint/no-explicit-any */

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BlockList from "@/components/blockchain-list/BlockList";
import EditorRaw from "@/components/json-editor/EditorRaw";
import JsonEditor from "@/components/json-editor/JsonEditor";
import { BlockCopyButton } from "@/components/ui/block-copy-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GLOBAL_VARIABLES } from "@/global/globalVariables";
import TableTransactionsBlockDetails from "@/tables/transactions_block_details/page";

interface BlockHeader {
  version: string;
  blockHash: string;
  previousBlockHash: string;
  merkleRoot: string;
  nonce: number;
  difficultyTarget: number;
  timestamp: number;
}

function BlockchainDetails() {
  const { id } = useParams();
  const [blockHash, setBlockHash] = useState(id ?? "");

  const URI = `http://${GLOBAL_VARIABLES.LOCALHOST}/api/blockchain/block-detail/${blockHash}`;

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["block-details", blockHash],
    // Backend responses are wrapped as {success, message, data, timestamp};
    // unwrap to the actual block-detail object here.
    queryFn: () =>
      fetch(URI)
        .then((res) => res.json())
        .then((json) => json.data),
    enabled: !!blockHash,
  });

  const [blockHeader, setBlockHeader] = useState<BlockHeader | null>(null);
  const [blockSize, setBlockSize] = useState<number | null>(0);
  const [blockIndex, setBlockIndex] = useState<number | null>(0);
  const [transactionCounter, setTransactionCounter] = useState<number | null>(
    0,
  );

  useEffect(() => {
    if (data) {
      setBlockHeader(data.blockHeader ?? null);
      setBlockSize(data.blockSize ?? 0);
      setBlockIndex(data.blockIndex ?? 0);
      setTransactionCounter(data.transactionCounter ?? 0);
    }
  }, [data]);

  useEffect(() => {
    if (id) {
      setBlockHash(id);
    }
  }, [id]);

  useEffect(() => {
    if (blockHash) refetch();
  }, [blockHash, refetch]);

  const getDate = (str: string | undefined) => {
    if (!str) return "—";
    const x: number = parseInt(str, 10);
    if (isNaN(x)) return "—";
    return new Date(x).toUTCString();
  };

  const maxSize: number = 300;
  const perc: number =
    blockSize !== null ? Math.min((blockSize * 100) / maxSize, 100) : 0;

  const itemStyle =
    "flex flex-col text-sm font-inria-sans text-gray-600 break-all";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <p className="text-red-500 font-medium">
            Failed to load block details
          </p>
          <p className="text-gray-400 text-sm">{(error as Error).message}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 flex-col">
      <span className="font-inria-sans text-2xl text-gray-400">Blockchain</span>
      <div className="flex flex-col gap-1">
        <span className="font-inria-sans text-md text-gray-400">
          Blockchain
        </span>
        <BlockList />
      </div>

      <div className="grid gap-2">
        <div className="flex flex-col">
          <span className="font-inria-sans text-md text-gray-400">
            Block details
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-5 pl-3">
          <div className="flex flex-col gap-2 col-span-4">
            <div className="flex flex-row gap-3">
              {/* Block visual */}
              <div
                style={{
                  width: "160px",
                  height: "100%",
                  flex: "1",
                  flexDirection: "column",
                  justifyContent: "center",
                  borderRadius: "0.50rem",
                  alignItems: "center",
                  alignSelf: "center",
                  overflow: "hidden",
                }}
              >
                <div
                  className="flex flex-col"
                  style={{
                    width: "100%",
                    height: "100%",
                    justifyContent: "center",
                    background:
                      "linear-gradient(to left top, #FFFFFF, #a2d7f6)",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      background:
                        "linear-gradient(to left top, #FFFFFF, #a2d7f6)",
                    }}
                  />
                  <div
                    style={{
                      height: `${perc}%`,
                      background:
                        "linear-gradient(to left top, #FFFFFF, #2EA8ED)",
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <div>
                  <span className="font-inria-sans text-sm text-gray-400">
                    {blockHeader?.timestamp
                      ? getDate(blockHeader.timestamp.toString())
                      : "Timestamp unavailable"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="grid grid-cols-3 gap-2">
                    <div className={itemStyle}>
                      <span className="font-inria-sans text-sm text-gray-400">
                        Version:
                      </span>
                      <span>{blockHeader?.version ?? "—"}</span>
                    </div>
                    <div className={itemStyle}>
                      <span className="font-inria-sans text-sm text-gray-400">
                        Hash Block:
                      </span>
                      <div className="flex flex-row justify-center gap-2">
                        <span>{blockHeader?.blockHash ?? "—"}</span>
                        {blockHeader?.blockHash && (
                          <BlockCopyButton
                            event="copy_chunk_code"
                            name={blockHeader.blockHash}
                            code={blockHeader.blockHash}
                            size="icon"
                          />
                        )}
                      </div>
                    </div>
                    <div className={itemStyle}>
                      <span className="font-inria-sans text-sm text-gray-400">
                        Previous BlockHash:
                      </span>
                      <span>{blockHeader?.previousBlockHash ?? "—"}</span>
                    </div>
                    <div className={itemStyle}>
                      <span className="font-inria-sans text-sm text-gray-400">
                        Merkle Root:
                      </span>
                      <div className="flex flex-row justify-center gap-2">
                        <span>{blockHeader?.merkleRoot ?? "—"}</span>
                        {blockHeader?.merkleRoot && (
                          <BlockCopyButton
                            event="copy_chunk_code"
                            name={blockHeader.merkleRoot}
                            code={blockHeader.merkleRoot}
                            size="icon"
                          />
                        )}
                      </div>
                    </div>
                    <div className={itemStyle}>
                      <span className="font-inria-sans text-sm text-gray-400">
                        Timestamp:
                      </span>
                      <span>{getDate(blockHeader?.timestamp?.toString())}</span>
                    </div>
                    <div className={itemStyle}>
                      <span className="font-inria-sans text-sm text-gray-400">
                        Difficulty Target:
                      </span>
                      <span>{blockHeader?.difficultyTarget ?? "—"}</span>
                    </div>
                    <div className={itemStyle}>
                      <span className="font-inria-sans text-sm text-gray-400">
                        Nonce:
                      </span>
                      <span>{blockHeader?.nonce ?? "—"}</span>
                    </div>
                    <div className={itemStyle}>
                      <span className="font-inria-sans text-sm text-gray-400">
                        Block Index:
                      </span>
                      <span>{blockIndex ?? "—"}</span>
                    </div>
                    <div className={itemStyle}>
                      <span className="font-inria-sans text-sm text-gray-400">
                        Block Size:
                      </span>
                      <span>
                        {blockSize != null ? `${blockSize} bytes` : "—"}
                      </span>
                    </div>
                    <div className={itemStyle}>
                      <span className="font-inria-sans text-sm text-gray-400">
                        Transaction Counter:
                      </span>
                      <span>{transactionCounter ?? "—"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <span className="font-inria-sans text-md text-gray-400">
                Transactions
              </span>
              <TableTransactionsBlockDetails detail={data} />
            </div>
          </div>

          <div className="flex flex-col col-span-3">
            <span className="font-bold font-inria-sans text-lg text-gray-400">
              JSON
            </span>
            <Tabs defaultValue="pretty" className="w-full max-w-[500px]">
              <TabsList>
                <TabsTrigger value="pretty">Pretty</TabsTrigger>
                <TabsTrigger value="raw">Raw</TabsTrigger>
              </TabsList>
              <TabsContent value="pretty">
                <JsonEditor data={data ?? {}} />
              </TabsContent>
              <TabsContent value="raw">
                <EditorRaw data={data ?? {}} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlockchainDetails;
