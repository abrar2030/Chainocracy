"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { CheckIcon, ClipboardIcon } from "lucide-react";
import { trackEvent } from "./events";
import { Button } from "./button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
export function BlockCopyButton({ event, name, code, ...props }) {
    const [hasCopied, setHasCopied] = React.useState(false);
    React.useEffect(() => {
        setTimeout(() => {
            setHasCopied(false);
        }, 2000);
    }, [hasCopied]);
    return (_jsx(TooltipProvider, { children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsxs(Button, { size: "icon", variant: "outline", className: "h-7 w-7 rounded-[5px] p-2 [&_svg]:size-3.5", onClick: () => {
                            navigator.clipboard.writeText(code);
                            trackEvent({
                                name: event,
                                properties: {
                                    name,
                                },
                            });
                            setHasCopied(true);
                        }, ...props, children: [_jsx("span", { className: "sr-only", children: "Copy" }), hasCopied ? _jsx(CheckIcon, {}) : _jsx(ClipboardIcon, {})] }) }), _jsx(TooltipContent, { children: "Copy code" })] }) }));
}
