import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/no-explicit-any */
import BlockList from '@/components/blockchain-list/BlockList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JsonEditor from '@/components/json-editor/JsonEditor';
import EditorRaw from '@/components/json-editor/EditorRaw';
import { useParams } from 'react-router-dom';
import { GLOBAL_VARIABLES } from '@/global/globalVariables';
import { useQuery } from '@tanstack/react-query';
import TableTransactionsBlockDetails from '@/tables/transactions_block_details/page';
import { BlockCopyButton } from '@/components/ui/block-copy-button';
import { useEffect, useState } from 'react';
function BlockchainDetails() {
    const { id } = useParams();
    const [blockHash, setBlockHash] = useState("");
    const URI = 'http://' + GLOBAL_VARIABLES.LOCALHOST + `/api/blockchain/block-detail/${blockHash}`;
    const { isLoading, error, data, refetch } = useQuery({
        queryKey: ['block-details'],
        queryFn: () => fetch(URI).then((res) => res.json()),
    });
    const [blockHeader, setBlockHeader] = useState(null);
    const [blockSize, setBlockSize] = useState(0);
    const [blockIndex, setBlockIndex] = useState(0);
    const [transactionCounter, setTransactionCounter] = useState(0);
    useEffect(() => {
        if (data) {
            handleRefresh();
        }
    }, [data]);
    const handleRefresh = () => {
        setBlockHeader(data.blockHeader);
        setBlockSize(data.blockSize);
        setBlockIndex(data.blockIndex);
        setTransactionCounter(data.transactionCounter);
    };
    useEffect(() => {
        console.log("ID changed ...");
        setBlockHash(id ?? '');
        refetch();
    }, [id]);
    if (isLoading)
        return 'Loading...';
    if (error)
        return 'An error has occurred: ' + error.message;
    const blockItem = () => {
        const maxSize = 300;
        const perc = blockSize !== null ? Math.min((blockSize * 100) / maxSize, 100) : 100;
        return (_jsx("div", { style: { width: '160px', height: '100%', flex: '1', flexDirection: 'column', justifyContent: 'center', borderRadius: '0.50rem', alignItems: 'center', alignSelf: 'center', overflow: 'hidden' }, children: _jsxs("div", { className: 'flex flex-col', style: { width: '100%', height: '100%', backgroundColor: 'red', justifyContent: 'center', background: 'linear-gradient(to left top, #FFFFFF, #a2d7f6)' }, children: [_jsx("div", { className: 'flex', style: { flex: 1, backgroundColor: 'red', justifyContent: 'center', background: 'linear-gradient(to left top, #FFFFFF, #a2d7f6)', alignItems: 'center' } }), _jsx("div", { className: 'flex', style: { height: `${perc}%`, backgroundColor: 'red', justifyContent: 'center', background: 'linear-gradient(to left top, #FFFFFF, #2EA8ED)', alignItems: 'center' } })] }) }));
    };
    const getDate = (str) => {
        const x = parseInt(str);
        return new Date(x).toUTCString();
    };
    const itemStyle = "flex flex-col text-sm font-inria-sans text-gray-600 break-all";
    return (_jsxs("div", { className: 'flex gap-2 flex-col ', children: [_jsx("span", { className: 'font-inria-sans text-2xl text-gray-400', children: "Blockchain" }), _jsxs("div", { className: 'flex flex-col gap-1', children: [_jsx("span", { className: 'font-inria-sans text-md text-gray-400', children: "Blockchain" }), _jsx(BlockList, {})] }), _jsxs("div", { className: 'grid gap-2 ', children: [_jsx("div", { className: 'flex flex-col', children: _jsx("span", { className: 'font-inria-sans text-md text-gray-400', children: "Block details" }) }), _jsxs("div", { className: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-5 pl-3', children: [_jsxs("div", { className: 'flex flex-col gap-2 col-span-4', children: [_jsxs("div", { className: 'flex flex-row gap-3', children: [_jsx("div", { children: blockItem() }), _jsxs("div", { className: 'flex flex-col', children: [_jsx("div", { children: _jsx("span", { className: 'font-inria-sans text-sm text-gray-400', children: "Broadcasted on 06 Apr 2027 12:19:08 GMT+2" }) }), _jsx("div", { className: 'flex flex-col gap-1', children: _jsxs("div", { className: 'grid grid-cols-3 gap-2', children: [_jsxs("div", { className: itemStyle, children: [_jsx("span", { className: 'font-inria-sans text-sm text-gray-400', children: "Version:" }), _jsx("span", { className: '', children: blockHeader?.version })] }), _jsxs("div", { className: itemStyle, children: [_jsx("span", { className: 'font-inria-sans text-sm text-gray-400', children: "Hash Block:" }), _jsxs("div", { className: 'flex flex-row justify-center gap-2', children: [_jsx("span", { className: '', children: blockHeader?.blockHash }), _jsx(BlockCopyButton, { event: "copy_chunk_code", name: blockHeader?.blockHash ?? '', code: blockHeader?.blockHash ?? '', size: "icon" })] })] }), _jsxs("div", { className: itemStyle, children: [_jsx("span", { className: 'font-inria-sans text-sm text-gray-400', children: "Previous BlockHash:" }), _jsx("span", { className: '', children: blockHeader?.previousBlockHash })] }), _jsxs("div", { className: itemStyle, children: [_jsx("span", { className: 'font-inria-sans text-sm text-gray-400', children: "Merkle Root:" }), _jsxs("div", { className: 'flex flex-row justify-center gap-2', children: [_jsx("span", { className: '', children: blockHeader?.merkleRoot }), _jsx(BlockCopyButton, { event: "copy_chunk_code", name: blockHeader?.merkleRoot ?? '', code: blockHeader?.merkleRoot ?? '', size: "icon" })] })] }), _jsxs("div", { className: itemStyle, children: [_jsx("span", { className: 'font-inria-sans text-sm text-gray-400', children: "Timestamp:" }), _jsx("div", { children: _jsx("span", { className: 'break-all', children: getDate(blockHeader?.timestamp.toString() ?? '') }) })] }), _jsxs("div", { className: itemStyle, children: [_jsx("span", { className: 'font-inria-sans text-sm text-gray-400', children: "Difficulty Target:" }), _jsx("span", { className: '', children: blockHeader?.difficultyTarget })] }), _jsxs("div", { className: itemStyle, children: [_jsx("span", { className: 'font-inria-sans text-sm text-gray-400', children: "Nonce:" }), _jsx("span", { className: '', children: blockHeader?.nonce })] }), _jsxs("div", { className: itemStyle, children: [_jsx("span", { className: 'font-inria-sans text-sm text-gray-400', children: "Block Index:" }), _jsx("span", { className: '', children: blockIndex })] }), _jsxs("div", { className: itemStyle, children: [_jsx("span", { className: 'font-inria-sans text-sm text-gray-400', children: "Block Size:" }), _jsxs("span", { className: '', children: [blockSize, " bytes"] })] }), _jsxs("div", { className: itemStyle, children: [_jsx("span", { className: 'font-inria-sans text-sm text-gray-400', children: "Transaction Counter:" }), _jsx("span", { className: '', children: transactionCounter })] })] }) })] })] }), _jsxs("div", { children: [_jsx("span", { className: 'font-inria-sans text-md text-gray-400', children: "Transactions" }), _jsx(TableTransactionsBlockDetails, { detail: data })] })] }), _jsxs("div", { className: 'flex flex-col col-span-3', children: [_jsx("span", { className: 'font-bold font-inria-sans text-lg text-gray-400', children: "JSON" }), _jsx("div", { children: _jsxs(Tabs, { defaultValue: "pretty", className: "w-[500px]", children: [_jsxs(TabsList, { children: [_jsx(TabsTrigger, { value: "pretty", children: "Pretty" }), _jsx(TabsTrigger, { value: "raw", children: "Raw" })] }), _jsx(TabsContent, { value: "pretty", children: _jsx(JsonEditor, { data: data }) }), _jsx(TabsContent, { value: "raw", children: _jsx(EditorRaw, { data: data }) })] }) })] })] })] })] }));
}
export default BlockchainDetails;
