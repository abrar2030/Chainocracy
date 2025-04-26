import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LoginAccountCard } from '@/components/login-account-card';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import AmericaIcon from '../assets/americaIcon.svg';
function Login() {
    const { onLogOut } = useAuth();
    useEffect(() => {
        onLogOut();
    }, []);
    return (_jsxs("div", { className: 'flex flex-col items-center justify-center gap-2 w-screen h-screen', children: [_jsx("img", { src: AmericaIcon, alt: "American Logo", style: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: '-1', opacity: 0.6 }, width: "65%" }), _jsx("div", { className: "flex flex-col items-center justify-center relative", style: { height: "100%" }, children: _jsx(LoginAccountCard, {}) }), _jsx("footer", { className: "bg-gray-100 text-gray-400 text-center py-2 w-screen", children: _jsx("div", { children: _jsxs("span", { children: ["\u00A9 ", new Date().getFullYear(), " Chainocracy, Abrar Ahmed. All rights reserved."] }) }) })] }));
}
export default Login;
