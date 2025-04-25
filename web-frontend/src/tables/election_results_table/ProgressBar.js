"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";
const ProgressBar = React.forwardRef(({ className, value, ...props }, ref) => (_jsx(ProgressPrimitive.Root, { ref: ref, className: cn("relative h-4 w-full overflow-hidden rounded-sm bg-red-200", className), ...props, children: _jsx(ProgressPrimitive.Indicator, { className: "h-full w-full flex-1 bg-red-500 transition-all", style: { transform: `translateX(-${100 - (value || 0)}%)` } }) })));
ProgressBar.displayName = ProgressPrimitive.Root.displayName;
export { ProgressBar };
