import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Toaster } from '@/components/toast/toaster';
import { useToast } from "@/components/ui/use-toast";
import TableVoters from '@/tables/voters_table/page';
function Voters() {
    const { toast } = useToast();
    return (_jsxs("div", { className: 'flex gap-2 flex-col ', children: [_jsx("span", { className: 'font-inria-sans text-2xl text-gray-400', children: "Voters" }), _jsxs("div", { className: 'md:items-center md:gap-2 w-full bg-red h-screen', children: [_jsx(Toaster, {}), _jsx(TableVoters, { toast: toast })] })] }));
}
export default Voters;
