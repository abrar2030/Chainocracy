import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { uploadImage } from "@/services/firebase";
import { useAuth } from "@/context/AuthContext";
import { GLOBAL_VARIABLES } from "@/global/globalVariables";
const formSchema = z.object({
    name: z.string(),
    code: z.string().refine((val) => {
        const num = Number(val);
        return !isNaN(num) && num > 0;
    }, {
        message: "Code must be a number greater than 0"
    }),
    partyImageFile: z.any().optional(),
    candidatePhotoFile: z.any().optional(),
    party: z.string(),
    status: z.string(),
});
export const CandidateForm = ({ defaultValues, onSubmitForm, mode, }) => {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ...defaultValues,
            partyImageFile: null,
            candidatePhotoFile: null
        }
    });
    const onSubmit = (formData) => {
        onSubmitForm(formData);
    };
    return (_jsx(Form, { ...form, children: _jsx("div", { className: "grid gap-4", children: _jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "flex flex-col gap-3", children: [_jsx(FormField, { control: form.control, name: "name", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Name" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "Candidate name", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "code", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Code" }), _jsx(FormControl, { children: mode === "update"
                                        ? _jsx(Input, { placeholder: "Candidate code", ...field, readOnly: true })
                                        : _jsx(Input, { placeholder: "Candidate code", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "party", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Party" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "Party name", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "candidatePhotoFile", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Candidate Photo " + (mode === "update" ? "(Optional)" : "") }), _jsx(FormControl, { children: _jsx(Input, { type: "file", onChange: (event) => {
                                            field.onChange(event.target.files[0]);
                                        } }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "partyImageFile", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Party Image " + (mode === "update" ? "(Optional)" : "") }), _jsx(FormControl, { children: _jsx(Input, { type: "file", onChange: (event) => {
                                            field.onChange(event.target.files[0]);
                                        } }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { name: "status", control: form.control, render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Status" }), _jsx(FormControl, { children: _jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Choose a status of the candidade..." }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "pending", children: "Pending" }), _jsx(SelectItem, { value: "verified", children: "Verified" }), _jsx(SelectItem, { value: "failed", children: "Failed" })] })] }) }), _jsx(FormMessage, {})] })) }), _jsx(Button, { type: "submit", className: "self-center w-32", children: "Save" })] }) }) }));
};
const getAcronym = (str) => {
    const acronym = str.toUpperCase().split(' ').map(x => x[0]).join('');
    return acronym;
};
export const CandidadeModal = ({ isOpen, onOpenChange, defaultValues, mode, toast, setData }) => {
    const { imageList, setImageList, updateImages } = useAuth();
    const addCandidate = async (data) => {
        const candidatePhotoName = data.name.toLowerCase().split(' ').join('.');
        const partyPhotoName = data.party.toLowerCase().split(' ').join('.');
        console.log("cand: ", data.candidatePhotoFile, " | ", candidatePhotoName);
        console.log("part: ", data.partyImageFile, " | ", partyPhotoName);
        uploadImage(data.candidatePhotoFile, candidatePhotoName, setImageList);
        uploadImage(data.partyImageFile, partyPhotoName, setImageList);
        const URL = 'http://' + GLOBAL_VARIABLES.LOCALHOST + '/api/committee/add-candidate';
        const body = {
            code: data.code,
            name: data.name,
            party: data.party,
            acronym: getAcronym(data.party),
            status: data.status,
        };
        const response = await axios.post(URL, body);
        const statusCode = response.status;
        if (statusCode === 200) {
            const candidates = response.data.candidates;
            const newData = candidates.map((element, index) => {
                const candidateName = element.name.toLowerCase().split(' ').join('.');
                const partyName = element.party.toLowerCase().split(' ').join('.');
                return ({
                    id: index + 1,
                    code: element.code,
                    name: element.name,
                    acronym: element.acronym,
                    candidadePhoto: imageList[candidateName] ?? 'default',
                    partyImage: imageList[partyName] ?? 'default',
                    party: element.party,
                    status: element.status
                });
            });
            updateImages();
            setData([...newData]);
            onOpenChange(false);
        }
        else {
            toast({
                title: "Feedback",
                description: "Error! Something went wrong."
            });
        }
    };
    const updateCandidate = async (data) => {
        const candidatePhotoName = data.name.toLowerCase().split(' ').join('.');
        const partyPhotoName = data.party.toLowerCase().split(' ').join('.');
        console.log("cand: ", data.candidatePhotoFile, " | ", candidatePhotoName);
        console.log("part: ", data.partyImageFile, " | ", partyPhotoName);
        uploadImage(data.candidatePhotoFile, candidatePhotoName, setImageList);
        uploadImage(data.partyImageFile, partyPhotoName, setImageList);
        const URL = 'http://' + GLOBAL_VARIABLES.LOCALHOST + '/api/committee/add-candidate';
        const body = {
            code: data.code,
            name: data.name,
            party: data.party,
            acronym: getAcronym(data.party),
            status: data.status
        };
        const response = await axios.post(URL, body);
        const statusCode = response.status;
        if (statusCode === 200) {
            const candidates = response.data.candidates;
            const newData = candidates.map((element, index) => {
                const candidateName = element.name.toLowerCase().split(' ').join('.');
                const partyName = element.party.toLowerCase().split(' ').join('.');
                return ({
                    id: index + 1,
                    code: element.code,
                    name: element.name,
                    acronym: element.acronym,
                    candidadePhoto: imageList[candidateName],
                    partyImage: imageList[partyName],
                    party: element.party,
                    status: element.status
                });
            });
            updateImages();
            setData([...newData]);
            onOpenChange(false);
            toast({
                title: "Feedback",
                description: "Success! Candidate added."
            });
        }
        else {
            toast({
                title: "Feedback",
                description: "Error! Something went wrong."
            });
        }
    };
    const onSubmitForm = (data) => {
        if (mode) {
            addCandidate(data);
        }
        else {
            updateCandidate(data);
        }
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "sm:max-w-[425px]", children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { children: [" ", mode ? "Add Candidade" : "Edit Candidate"] }) }), _jsx(CandidateForm, { onSubmitForm: onSubmitForm, defaultValues: defaultValues, mode: mode ? "create" : "update" })] }) }));
};
