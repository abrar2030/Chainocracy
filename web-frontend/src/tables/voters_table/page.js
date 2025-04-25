import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { GLOBAL_VARIABLES, TOKEN_KEY } from "@/global/globalVariables";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import axios from 'axios';
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "../../components/ui/alert-dialog";
import { getItemAsync } from "@/context/SecureStore";
function TableVoters({ toast }) {
    const [data, setData] = useState([]);
    useEffect(() => {
        onPressLoadIdentifiers();
    }, []);
    const removeExtraEquals = (str) => {
        if (str.substring(0, str.length - 2) !== "==") {
            return str;
        }
        return str.substring(0, str.length - 2); // Removes the extra ==
    };
    const onPressGenerateIdentifiers = async () => {
        const token = await getItemAsync(TOKEN_KEY);
        axios.defaults.withCredentials = true;
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        axios.get('http://' + GLOBAL_VARIABLES.LOCALHOST + '/api/committee/generate-identifiers', { withCredentials: true })
            .then(response => {
            const votersGenerated = response.data.voters;
            const newData = votersGenerated.map((element, index) => ({
                id: index + 1,
                identifier: removeExtraEquals(element.identifier),
                electoralId: removeExtraEquals(element.electoralId),
                choiceCode: element.choiceCode,
                state: element.state ? "true" : "false",
                secret: element.secret,
            }));
            setData([...newData]);
        })
            .catch(error => console.error(error));
    };
    const onPressDeployBlockchain = () => {
        axios.get('http://' + GLOBAL_VARIABLES.LOCALHOST + '/api/blockchain/deploy-voters')
            .then(response => {
            const votersGenerated = response.data.voters;
            const newData = votersGenerated.map((element, index) => ({
                id: index + 1,
                identifier: removeExtraEquals(element.identifier),
                electoralId: removeExtraEquals(element.electoralId),
                choiceCode: element.choiceCode,
                state: element.state ? "true" : "false",
                secret: element.secret,
            }));
            setData([...newData]);
            toast({
                title: "Feedback",
                description: "Success! Data deployed successfully ..."
            });
        })
            .catch(error => {
            toast({
                title: "Feedback",
                description: "Error! Something went wrong."
            });
            console.error(error);
        });
    };
    const openDialog = () => {
        return _jsxs(AlertDialog, { children: [_jsx(AlertDialogTrigger, { asChild: true, children: _jsx("span", { className: "max-w-lg inline-block text-md bg-green-900 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-gray-800", children: "Deploy to Blockchain" }) }), _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: "Are you absolutely sure?" }), _jsx(AlertDialogDescription, { children: "This action cannot be undone. This will permanently erase all data stored in the smart-contract and register the new data." })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { children: "Cancel" }), _jsx(AlertDialogAction, { children: _jsx(Button, { onClick: onPressDeployBlockchain, children: "Continue" }) })] })] })] });
    };
    const onPressLoadIdentifiers = () => {
        axios.get('http://' + GLOBAL_VARIABLES.LOCALHOST + '/api/blockchain/voters')
            .then(response => {
            const voters = response.data.voters;
            if (voters) {
                const newData = voters.map((element, index) => ({
                    id: index + 1,
                    identifier: removeExtraEquals(element.identifier),
                    electoralId: removeExtraEquals("*******"),
                    choiceCode: element.choiceCode,
                    state: element.state ? "true" : "false",
                    secret: element.secret,
                }));
                setData([...newData]);
            }
        })
            .catch(error => console.error(error));
    };
    return (_jsxs("section", { children: [_jsxs("div", { className: "flex gap-2 py-4", children: [_jsx(Button, { className: "max-w-lg", onClick: onPressGenerateIdentifiers, children: "Generate Identifiers" }), _jsx(Button, { className: "max-w-lg", onClick: onPressLoadIdentifiers, children: "Load Identifiers" }), openDialog()] }), _jsx(DataTable, { columns: columns, data: data })] }));
}
export default TableVoters;
