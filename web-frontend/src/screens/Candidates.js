import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import TableCandidates from '@/tables/candidates_table/page';
import { useToast } from '@/components/toast/use-toast';
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { GLOBAL_VARIABLES } from "@/global/globalVariables";
import axios from "axios";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "../components/ui/alert-dialog";
import { useAuth } from '@/context/AuthContext';
import { CandidadeModal } from '@/tables/candidates_table/operation-candidate';
import { Toaster } from '@/components/toast/toaster';
function Candidates() {
    const { toast } = useToast();
    const [data, setData] = useState([]);
    const [editCandidate, setEditCandidate] = useState({});
    const { imageList, setImageList, updateImages } = useAuth();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    useEffect(() => {
        onPressLoadCandidates();
    }, []);
    const onPressLoadCandidates = () => {
        if (!imageList)
            return;
        axios.get('http://' + GLOBAL_VARIABLES.LOCALHOST + '/api/blockchain/candidates')
            .then(response => {
            const candidates = response.data.candidates;
            if (candidates) {
                const newData = candidates.map((element, index) => {
                    const candidatePhotoName = element.name.toLowerCase().split(' ').join('.');
                    const partyPhotoName = element.party.toLowerCase().split(' ').join('.');
                    return ({
                        id: index + 1,
                        code: element.code.toString(),
                        name: element.name,
                        party: element.party,
                        acronym: element.acronym,
                        candidadePhoto: imageList[candidatePhotoName] ?? 'default',
                        partyImage: imageList[partyPhotoName] ?? 'default',
                        status: element.status,
                        toast: toast,
                        editCandidate: editCandidate,
                        setEditCandidate: setEditCandidate
                    });
                });
                setData(newData);
            }
        })
            .catch(error => { });
    };
    const onPressLoadCandidatesNotDeployed = () => {
        axios.get('http://' + GLOBAL_VARIABLES.LOCALHOST + '/api/committee/candidates')
            .then(response => {
            const candidates = response.data.candidates;
            if (candidates) {
                const newData = candidates.map((element, index) => {
                    const candidatePhotoName = element.name.toLowerCase().split(' ').join('.');
                    const partyPhotoName = element.party.toLowerCase().split(' ').join('.');
                    return ({
                        id: index + 1,
                        code: element.code.toString(),
                        name: element.name,
                        party: element.party,
                        acronym: element.acronym,
                        candidadePhoto: imageList[candidatePhotoName],
                        partyImage: imageList[partyPhotoName],
                        status: element.status,
                        toast: toast,
                        editCandidate: editCandidate,
                        setEditCandidate: setEditCandidate
                    });
                });
                setData(newData);
            }
        })
            .catch(error => { });
    };
    const onPressDeployBlockchain = () => {
        axios.get('http://' + GLOBAL_VARIABLES.LOCALHOST + '/api/blockchain/deploy-candidates')
            .then(response => {
            const candidates = response.data.candidates;
            if (candidates) {
                const newData = candidates.map((element, index) => {
                    const candidatePhotoName = element.name.toLowerCase().split(' ').join('.');
                    const partyPhotoName = element.party.toLowerCase().split(' ').join('.');
                    return ({
                        id: index + 1,
                        code: element.code,
                        name: element.name,
                        party: element.party,
                        acronym: element.acronym,
                        candidadePhoto: imageList[candidatePhotoName],
                        partyImage: imageList[partyPhotoName],
                        status: element.status,
                        toast: toast,
                        editCandidate: editCandidate,
                        setEditCandidate: setEditCandidate
                    });
                });
                setData(newData);
                toast({
                    title: "Feedback",
                    description: "Success! Data deployed successfully ..."
                });
            }
        })
            .catch(error => {
            toast({
                title: "Feedback",
                description: "Error! Something went wrong."
            });
        });
    };
    const onPressDeleteFromBlockchain = () => {
        axios.get('http://' + GLOBAL_VARIABLES.LOCALHOST + '/api/committee/clear-candidates')
            .then(response => {
            const candidates = response.data.candidates;
            if (candidates) {
                const newData = [];
                setData([...newData]);
                toast({
                    title: "Feedback",
                    description: "Success! Data deployed successfully ..."
                });
            }
        })
            .catch(error => {
            toast({
                title: "Feedback",
                description: "Error! Something went wrong."
            });
        });
    };
    const openDialogDeploy = () => {
        return _jsxs(AlertDialog, { children: [_jsx(AlertDialogTrigger, { children: _jsx("span", { className: "max-w-lg inline-block text-md bg-green-900 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-gray-800", children: "Deploy to Blockchain" }) }), _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: "Are you absolutely sure?" }), _jsx(AlertDialogDescription, { children: "This action cannot be undone. This will permanently erase all data stored in the smart-contract and register the new data." })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { children: "Cancel" }), _jsx(AlertDialogAction, { onClick: onPressDeployBlockchain, children: "Continue" })] })] })] });
    };
    const openDialogDelete = () => {
        return _jsxs(AlertDialog, { children: [_jsx(AlertDialogTrigger, { children: _jsx("span", { className: "max-w-lg inline-block text-md bg-red-900 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-gray-800", children: "Delete from Blockchain" }) }), _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: "Are you absolutely sure?" }), _jsx(AlertDialogDescription, { children: "This action cannot be undone. This will permanently erase all data stored in the smart-contract and register the new data." })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { children: "Cancel" }), _jsx(AlertDialogAction, { onClick: onPressDeleteFromBlockchain, children: "Continue" })] })] })] });
    };
    return (_jsxs("div", { className: 'flex gap-2 flex-col ', children: [_jsx("span", { className: 'font-inria-sans text-2xl text-gray-400', children: "Candidates" }), _jsx(Toaster, {}), _jsxs("div", { className: 'md:items-center md:gap-2 w-full bg-red h-screen', children: [_jsxs("div", { className: "flex flex-col md:flex-row gap-2 py-4", children: [_jsx(CandidadeModal, { isOpen: isAddModalOpen, onOpenChange: setIsAddModalOpen, setData: setData, toast: toast, defaultValues: null, mode: true }), _jsxs("div", { className: "flex flex-col md:flex-row gap-2", children: [_jsx(Button, { className: "max-w-lg md:w-auto", onClick: () => {
                                            setIsAddModalOpen(true);
                                        }, children: "Add Candidate" }), _jsx(Button, { className: "max-w-lg md:w-auto", onClick: () => {
                                            updateImages();
                                            onPressLoadCandidates();
                                        }, children: "Load Candidates" }), _jsx(Button, { className: "max-w-lg md:w-auto", onClick: onPressLoadCandidatesNotDeployed, children: "Load Candidates [Not Deployed]" })] }), openDialogDeploy(), openDialogDelete()] }), _jsx(TableCandidates, { data: data, setData: setData, toast: toast })] })] }));
}
export default Candidates;
