import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { CandidadeModal } from './operation-candidate';
export default function CustomDropMenuCandidate({ candidate }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    return (_jsxs(_Fragment, { children: [_jsx(CandidadeModal, { isOpen: isModalOpen, onOpenChange: setIsModalOpen, setData: candidate.setEditCandidate, toast: candidate.toast, defaultValues: candidate, mode: false }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "ghost", className: "h-8 w-8 p-0", children: [_jsx("span", { className: "sr-only", children: "Open menu" }), _jsx(MoreHorizontal, { className: "h-4 w-4" })] }) }), _jsxs(DropdownMenuContent, { align: "end", children: [_jsx(DropdownMenuLabel, { children: "Actions" }), _jsx(DropdownMenuItem, { onClick: () => navigator.clipboard.writeText(JSON.stringify(candidate)), children: "Copy row data" }), _jsx(DropdownMenuSeparator, {}), _jsx(DropdownMenuItem, { onClick: () => setIsModalOpen(true), children: " Edit" }), _jsx(DropdownMenuItem, { onClick: () => {
                                    const toast = candidate.toast;
                                    toast({
                                        title: "Feedback",
                                        description: "Operation not supported."
                                    });
                                }, children: "Remove" })] })] })] }));
}
