import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import VerificationModal from './verification-modal';
import RevealModal from './reveal-voter';
export default function CustomDropMenuVoter({ voter }) {
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
    const [isRevealModalOpen, setIsRevealModalOpen] = useState(false);
    return (_jsxs(_Fragment, { children: [_jsx(VerificationModal, { isOpen: isVerificationModalOpen, onOpenChange: setIsVerificationModalOpen, url: voter.secret }), _jsx(RevealModal, { isOpen: isRevealModalOpen, onOpenChange: setIsRevealModalOpen, identifier: voter.identifier }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "ghost", className: "h-8 w-8 p-0", children: [_jsx("span", { className: "sr-only", children: "Open menu" }), _jsx(MoreHorizontal, { className: "h-4 w-4" })] }) }), _jsxs(DropdownMenuContent, { align: "end", children: [_jsx(DropdownMenuLabel, { children: "Actions" }), _jsx(DropdownMenuItem, { onClick: () => navigator.clipboard.writeText(JSON.stringify(voter).toString()), children: "Copy row data" }), _jsx(DropdownMenuSeparator, {}), _jsx(DropdownMenuItem, { onClick: () => setIsVerificationModalOpen(true), children: "Verification Code" }), _jsx(DropdownMenuItem, { onClick: () => setIsRevealModalOpen(true), children: "Reveal voter" })] })] })] }));
}
