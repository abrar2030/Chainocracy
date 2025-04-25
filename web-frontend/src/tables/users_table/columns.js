import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import CustomDropMenuUser from "./CustomDropMenuUser";
export const columns = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "username",
        header: "Username",
    },
    {
        accessorKey: "password",
        header: "Password",
        cell: ({ row }) => {
            const password = row.getValue("password");
            if (typeof password === 'string')
                return (_jsxs("span", { children: [password.substring(0, ("0xabcdef123456789").length), "..."] }));
            else
                return '';
        }
    },
    {
        accessorKey: "photo",
        header: "Photo",
        cell: ({ row }) => {
            const user = row.original;
            const url = user.photo;
            return (_jsx(_Fragment, { children: _jsx("img", { height: 60, width: 60, src: url, className: "rounded-full" }) }));
        },
    },
    {
        accessorKey: "refreshToken",
        header: "Refresh Token",
        cell: ({ row }) => {
            const refreshToken = row.getValue("refreshToken");
            if (typeof refreshToken === 'string')
                return (_jsxs("span", { children: [refreshToken.substring(0, ("rerewrwererxabcdef123456789").length), "..."] }));
            else
                return '';
        }
    },
    {
        accessorKey: "role",
        header: "Role",
    },
    {
        accessorKey: "timestamp",
        header: "Created at",
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const user = row.original;
            return (_jsx(_Fragment, { children: _jsx(CustomDropMenuUser, { user: user }) }));
        },
    },
];
