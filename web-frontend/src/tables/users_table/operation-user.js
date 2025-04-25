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
import { uploadImage } from "@/services/firebase";
import { GLOBAL_VARIABLES } from "@/global/globalVariables";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
const formSchema = z.object({
    name: z.string().min(1, { message: "Name cannot be empty" }),
    username: z.string().min(1, { message: "Username cannot be empty" }),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    photoFile: z.any().optional(),
    role: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // path of error
});
export const UserForm = ({ defaultValues, onSubmitForm, mode, }) => {
    const form = useForm({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            ...defaultValues,
            password: '',
            confirmPassword: '',
            photoFile: null
        }
    });
    const onSubmit = (formData) => {
        onSubmitForm(formData);
    };
    return (_jsx(Form, { ...form, children: _jsx("div", { className: "grid gap-4", children: _jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "flex flex-col gap-3", children: [_jsx(FormField, { control: form.control, name: "name", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Name" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "Enter your name...", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "username", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Username" }), _jsx(FormControl, { children: mode === "update"
                                        ? _jsx(Input, { placeholder: "Username", autoComplete: "username", ...field, readOnly: true })
                                        : _jsx(Input, { placeholder: "Username", autoComplete: "username", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "password", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Password" }), _jsx(FormControl, { children: _jsx(Input, { type: "password", autoComplete: "new-password", placeholder: "Password", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "confirmPassword", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Confirm Password" }), _jsx(FormControl, { children: _jsx(Input, { type: "password", autoComplete: "new-password", placeholder: "Confirm Password", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "photoFile", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Photo " + (mode === "update" ? "(Optional)" : "") }), _jsx(FormControl, { children: _jsx(Input, { type: "file", onChange: (event) => {
                                            field.onChange(event.target.files[0]);
                                        } }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { name: "role", control: form.control, render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Role" }), _jsx(FormControl, { children: _jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Choose the status..." }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "admin", children: "Admin" }), _jsx(SelectItem, { value: "normal", children: "Normal" })] })] }) }), _jsx(FormMessage, {})] })) }), _jsx(Button, { type: "submit", className: "self-center w-32", children: "Save" })] }) }) }));
};
export const UserModal = ({ isOpen, onOpenChange, defaultValues, mode, toast, setData }) => {
    const { imageList, setImageList, updateImages } = useAuth();
    const updateUser = async (data) => {
        try {
            const userPhotoName = data.name.toLowerCase().split(' ').join('.');
            uploadImage(data.photoFile, userPhotoName, setImageList);
            const response = await api.post("/committee/update-user", data);
            const users = response.data.users;
            if (users) {
                const newData = users.map((element, index) => {
                    const userPhoto = element.name.toLowerCase().split(' ').join('.');
                    return ({
                        id: index + 1,
                        name: element.name,
                        username: element.username,
                        password: element.password,
                        role: parseInt(element.role) === 0 ? "admin" : "normal",
                        photo: imageList ? imageList[userPhoto] ?? 'default' : '',
                        refreshToken: element.refreshToken,
                        timestamp: new Date(element.timestamp).toLocaleString(),
                        setData: setData,
                        toast: toast
                    });
                });
                updateImages();
                setData([...newData]);
                onOpenChange(false);
            }
        }
        catch (error) {
            toast({
                title: "Feedback",
                description: "Error! Something went wrong."
            });
        }
    };
    const addUser = async (data) => {
        try {
            const userPhotoName = data.name.toLowerCase().split(' ').join('.');
            uploadImage(data.photoFile, userPhotoName, setImageList);
            const URL = 'http://' + GLOBAL_VARIABLES.LOCALHOST + '/api/committee/add-user';
            const body = {
                name: data.name,
                username: data.username,
                password: data.password,
                role: data.role
            };
            const response = await axios.post(URL, body);
            const statusCode = response.status;
            if (statusCode === 200) {
                const users = response.data.users;
                if (users !== undefined) {
                    const newData = users.map((element, index) => {
                        const userPhoto = element.name.toLowerCase().split(' ').join('.');
                        return ({
                            id: index + 1,
                            name: element.name,
                            username: element.username,
                            password: element.password,
                            role: parseInt(element.role) === 0 ? "admin" : "normal",
                            photo: imageList ? imageList[userPhoto] ?? 'default' : '',
                            refreshToken: element.refreshToken,
                            timestamp: new Date(element.timestamp).toLocaleString(),
                            setData: setData,
                            toast: toast
                        });
                    });
                    updateImages();
                    setData([...newData]);
                    onOpenChange(false);
                }
            }
        }
        catch (error) {
            toast({
                title: "Feedback",
                description: "Error! Something went wrong."
            });
        }
    };
    const onSubmitForm = (data) => {
        if (mode) {
            addUser(data);
        }
        else {
            updateUser(data);
        }
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "sm:max-w-[425px]", children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { children: [" ", mode ? "Add User" : "Edit User"] }) }), _jsx(UserForm, { onSubmitForm: onSubmitForm, defaultValues: defaultValues })] }) }));
};
