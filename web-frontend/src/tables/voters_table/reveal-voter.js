import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
export default function RevealModal({ isOpen, onOpenChange, identifier }) {
    const revealVoter = () => {
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onOpenChange, defaultOpen: false, children: _jsxs(DialogContent, { className: "sm:max-w-[425px]", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Reveal Voter" }), _jsx(DialogDescription, { children: "Scan the QR Code." })] }), _jsx("div", { className: "flex justify-center items-center h-full", children: _jsx("span", { children: "Information to be added." }) }), _jsx(DialogFooter, { className: "flex justify-center items-center", children: _jsx(Button, { type: "submit", onClick: () => {
                            // Handle click event
                        }, children: "OK" }) })] }) }));
}
