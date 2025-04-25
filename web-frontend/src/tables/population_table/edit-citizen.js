import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { api } from '../../services/api';
const provinces = [
    "Bengo",
    "Benguela",
    "Bié",
    "Cabinda",
    "Cuando Cubango",
    "Cuanza Norte",
    "Cuanza Sul",
    "Cunene",
    "Huambo",
    "Huíla",
    "Luanda",
    "Lunda Norte",
    "Lunda Sul",
    "Malanje",
    "Moxico",
    "Namibe",
    "Uíge",
    "Zaire"
];
const formSchema = z.object({
    name: z.string(),
    electoralId: z.string().optional(),
    email: z.string().email("Invalid e-mail."),
    address: z.string(),
    province: z.string(),
    status: z.string(),
});
export const CitizenForm = ({ defaultValues, onSubmitForm, }) => {
    const form = useForm({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues,
    });
    const onSubmit = (formData) => {
        onSubmitForm(formData);
    };
    return (_jsx(Form, { ...form, children: _jsx("div", { className: "grid gap-4", children: _jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "flex flex-col gap-3", children: [_jsx(FormField, { control: form.control, name: "name", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Name" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "Your name", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "electoralId", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Electoral Number" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "Electoral ID", ...field, readOnly: true }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "email", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "E-mail" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "E-mail", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "address", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Address" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "Address", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { name: "province", control: form.control, render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Province" }), _jsx(FormControl, { children: _jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Choose the option." }) }), _jsx(SelectContent, { children: provinces.map((province, index) => (_jsx(SelectItem, { value: province, children: province }, index))) })] }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { name: "status", control: form.control, render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Status" }), _jsx(FormControl, { children: _jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Pick an option" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "failed", children: "Failed" }), _jsx(SelectItem, { value: "processing", children: "Processing" }), _jsx(SelectItem, { value: "verified", children: "Verified" }), _jsx(SelectItem, { value: "pending", children: "Pending" })] })] }) }), _jsx(FormMessage, {})] })) }), _jsx(Button, { type: "submit", className: "self-center w-32", children: "Save" })] }) }) }));
};
export const EditCitizenModal = ({ isOpen, onOpenChange, defaultValues, setData, toast }) => {
    const updateCitizen = async (data) => {
        try {
            const response = await api.post("/committee/update-citizen", data);
            const registers = response.data.registers;
            if (registers) {
                let newData = registers.map((element) => ({
                    name: element.name,
                    operation: '',
                    electoralId: element.electoralId,
                    email: element.email,
                    address: element.address,
                    province: element.province,
                    password: element.password,
                    status: element.status,
                    verification: element.verification,
                    otp: element.otp,
                    toast: toast,
                    setData: setData
                }));
                newData.sort((a, b) => {
                    const nameA = a.name.toLowerCase();
                    const nameB = b.name.toLowerCase();
                    if (nameA < nameB)
                        return -1;
                    if (nameA > nameB)
                        return 1;
                    return 0;
                });
                newData = newData.map((element, index) => ({
                    id: index + 1,
                    ...element
                }));
                setData([...newData]);
                onOpenChange(false);
            }
        }
        catch (error) {
            // console.error(error);
            toast({
                title: "Feedback",
                description: "Error! Something went wrong."
            });
        }
    };
    const onSubmitForm = (data) => {
        updateCitizen(data);
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "sm:max-w-[425px]", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Edit Citizen" }) }), _jsx(CitizenForm, { onSubmitForm: onSubmitForm, defaultValues: defaultValues })] }) }));
};
