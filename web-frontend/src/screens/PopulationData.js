import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import TablePopulation from '@/tables/population_table/page';
import { Toaster } from '@/components/toast/toaster';
import { useToast } from "@/components/ui/use-toast";
function PopulationData() {
    const { toast } = useToast();
    return (_jsxs("div", { className: 'flex gap-2 flex-col ', children: [_jsx("span", { className: 'font-inria-sans text-2xl text-gray-400', children: "Population Data" }), _jsxs("div", { className: 'md:items-center md:gap-2 w-full bg-red h-screen', children: [_jsx(Toaster, {}), _jsx(TablePopulation, { toast: toast })] })] }));
}
export default PopulationData;
