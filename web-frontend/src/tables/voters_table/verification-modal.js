import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import * as qrcode from 'qrcode';
export default function VerificationModal({ isOpen, onOpenChange, url }) {
    const [qrCodeURL, setQrCodeURL] = useState("");
    const generateQRCode = async (str_code) => {
        try {
            const qrCodeData = await new Promise((resolve, reject) => {
                qrcode.toDataURL(str_code, (err, data) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                });
            });
            return qrCodeData;
        }
        catch (error) {
            console.error(error);
            return null;
        }
    };
    const VerifySecret = async () => {
        const qrCodeData = await generateQRCode(url);
        setQrCodeURL(qrCodeData ?? "");
    };
    useEffect(() => {
        VerifySecret();
    }, []);
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onOpenChange, defaultOpen: false, children: _jsxs(DialogContent, { className: "sm:max-w-[425px]", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Voter verification" }), _jsx(DialogDescription, { children: "Scan the QR Code." })] }), _jsx("div", { className: "flex justify-center items-center h-full", children: _jsx("img", { src: qrCodeURL, className: "w-64 h-64" }) }), _jsx(DialogFooter, { className: "flex justify-center items-center" })] }) }));
}
