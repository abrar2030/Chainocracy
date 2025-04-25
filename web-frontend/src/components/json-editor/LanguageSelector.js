import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Button, Menu, MenuButton, MenuItem, MenuList, Text, } from "@chakra-ui/react";
import { LANGUAGE_VERSIONS } from "./constants";
const languages = Object.entries(LANGUAGE_VERSIONS);
const ACTIVE_COLOR = "blue.400";
const LanguageSelector = ({ language, onSelect }) => {
    return (_jsxs(Box, { ml: 2, mb: 4, children: [_jsx(Text, { mb: 2, fontSize: "lg", children: "Language:" }), _jsxs(Menu, { isLazy: true, children: [_jsx(MenuButton, { as: Button, children: language }), _jsx(MenuList, { bg: "#110c1b", children: languages.map(([lang, version]) => (_jsxs(MenuItem, { color: lang === language ? ACTIVE_COLOR : "", bg: lang === language ? "gray.900" : "transparent", _hover: {
                                color: ACTIVE_COLOR,
                                bg: "gray.900",
                            }, onClick: () => onSelect(lang), children: [lang, "\u00A0", _jsxs(Text, { as: "span", color: "gray.600", fontSize: "sm", children: ["(", version, ")"] })] }, lang))) })] })] }));
};
export default LanguageSelector;
