"use client";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { useAuth } from '@/context/AuthContext';
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
export function DatePickerWithRange({ className, }) {
    /*  const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(2022, 0, 20),
        to: addDays(new Date(2022, 0, 20), 20),
      });
    */
    const { dateRange, setDateRange } = useAuth();
    useEffect(() => {
        //console.log("Date range: ", dateRange);
    }, []);
    return (_jsx("div", { className: cn("grid gap-2", className), children: _jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { id: "date", variant: "outline", className: cn("w-[300px] justify-start text-left font-normal", !dateRange && "text-muted-foreground"), children: [_jsx(CalendarIcon, { className: "mr-2 h-4 w-4" }), dateRange?.from ? (dateRange.to ? (_jsxs(_Fragment, { children: [format(dateRange.from, "LLL dd, y"), " -", " ", format(dateRange.to, "LLL dd, y")] })) : (format(dateRange.from, "LLL dd, y"))) : (_jsx("span", { children: "Pick a date" }))] }) }), _jsx(PopoverContent, { className: "w-auto p-0", align: "start", children: _jsx(Calendar, { initialFocus: true, mode: "range", defaultMonth: dateRange?.from, selected: dateRange, onSelect: setDateRange, numberOfMonths: 2 }) })] }) }));
}
