import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import { GLOBAL_VARIABLES } from '@/global/globalVariables';
import { Toaster } from '@/components/toast/toaster';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/toast/use-toast';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import TableUsers from '@/tables/users_table/page';
import { UserModal } from '@/tables/users_table/operation-user';
function Users() {
    const [data, setData] = useState([]);
    const { imageList, setImageList, updateImages } = useAuth();
    const { toast } = useToast();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    useEffect(() => {
        onPressLoadUsers();
    }, []);
    const onPressLoadUsers = () => {
        updateImages();
        axios.get('http://' + GLOBAL_VARIABLES.LOCALHOST + '/api/committee/users')
            .then(response => {
            const users = response.data.users;
            if (users !== undefined) {
                // console.log("users: ", users);
                let newData = users.map((element, index) => {
                    const userPhotoName = element.name.toLowerCase().split(' ').join('.');
                    return ({
                        id: index + 1,
                        name: element.name,
                        username: element.username,
                        password: element.password,
                        role: parseInt(element.role) === 0 ? "admin" : "normal",
                        photo: imageList ? imageList[userPhotoName] ?? '' : '',
                        refreshToken: element.refreshToken,
                        timestamp: new Date(element.timestamp).toLocaleString(),
                        setData: setData,
                        toast: toast
                    });
                });
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
                    ...element,
                    id: index + 1
                }));
                setData([...newData]);
            }
        }).catch(error => { });
    };
    return (_jsxs("div", { className: 'flex gap-2 flex-col ', children: [_jsx("span", { className: 'font-inria-sans text-2xl text-gray-400', children: "User Management" }), _jsxs("div", { className: 'md:items-center md:gap-2 w-full bg-red h-screen', children: [_jsxs("div", { className: "flex gap-2 py-4", children: [_jsx(UserModal, { isOpen: isAddModalOpen, onOpenChange: setIsAddModalOpen, setData: setData, toast: toast, defaultValues: null, mode: true }), _jsx(Button, { className: "max-w-lg md:w-auto", onClick: () => {
                                    setIsAddModalOpen(true);
                                }, children: "Add User" }), _jsx(Button, { className: "max-w-lg", onClick: onPressLoadUsers, children: "Load / Refresh Users" })] }), _jsx(Toaster, {}), _jsx(TableUsers, { data: data })] })] }));
}
export default Users;
