import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TabsEditAccountCard } from '@/components/edit-account-card';
function EditAccount() {
    return (_jsxs("div", { className: 'flex flex-col gap-2 w-auto h-screen ', children: [_jsx("div", { className: 'flex flex-row justify-start items-start gap-2  p-0', children: _jsx("span", { className: 'font-inria-sans text-2xl text-gray-400', children: "Edit Account" }) }), _jsx("div", { className: "flex w-full flex-grow  items-center justify-center p-0", children: _jsx(TabsEditAccountCard, {}) })] }));
}
export default EditAccount;
