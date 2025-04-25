import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { HiChartPie } from "react-icons/hi";
import { GiPublicSpeaker } from "react-icons/gi";
import { HiSpeakerphone } from "react-icons/hi";
import { MdOutlineOutput } from "react-icons/md";
import { FaUsers } from "react-icons/fa6";
import { FaMoon } from "react-icons/fa";
import { IoSettings } from "react-icons/io5";
import { SiHiveBlockchain } from "react-icons/si";
import { BiLogOutCircle } from "react-icons/bi";
import { Link } from "react-router-dom";
import { VscRepoPull } from "react-icons/vsc";
import { BsClipboardData } from "react-icons/bs";
import BlockchainIcon from '../assets/blockchain_icon.svg';
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Role } from "@/data_types";
function SideBarComponent() {
    const linkStyle = "flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700";
    const iconStyle = "w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white";
    const textTyle = "ml-3";
    const { authState, onLogOut, imageList } = useAuth();
    const navigate = useNavigate();
    const [url, setUrl] = useState();
    if (!authState || !authState.username) {
        return (_jsx("div", { children: "Loading ..." }));
    }
    const onLogOutUser = () => {
        onLogOut();
        navigate('/');
    };
    useEffect(() => {
        const userPhotoName = authState.name.toLowerCase().split(' ').join('.');
        if (imageList && imageList[userPhotoName]) {
            setUrl(imageList[userPhotoName] ?? 'default');
        }
    }, []);
    return (_jsx("aside", { className: "flex flex-col left-0 top-0 w-60 h-screen fixed transition-transform sm:translate-x-0", "aria-label": "Sidebar", children: _jsxs("div", { className: "gap-5 flex flex-col h-screen px-3 py-2 rounded bg-white dark:bg-gray-800", children: [_jsx("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' }, children: _jsx("span", { className: "text-2xl font-bold text-gray-500 uppercase tracking-wider", children: "ELECTION 2027" }) }), _jsxs("div", { children: [_jsxs(Link, { to: "dashboard", className: linkStyle, children: [_jsx(HiChartPie, { className: iconStyle }), _jsx("span", { className: textTyle, children: "Dashboard" })] }), _jsxs(Link, { to: "announce-election", className: linkStyle, children: [_jsx(HiSpeakerphone, { className: iconStyle }), _jsx("span", { className: textTyle, children: "Announce Election" })] }), _jsxs(Link, { to: "candidates", className: linkStyle, children: [_jsx(FaUsers, { className: iconStyle }), _jsx("span", { className: textTyle, children: "Candidates" })] }), _jsxs(Link, { to: "voters", className: linkStyle, children: [_jsx(BsClipboardData, { className: iconStyle }), _jsx("span", { className: textTyle, children: "Voters" })] }), _jsxs(Link, { to: "population-data", className: linkStyle, children: [_jsx(VscRepoPull, { className: iconStyle }), _jsx("span", { className: textTyle, children: "Population Data" })] }), _jsxs(Link, { to: "election-results", className: linkStyle, children: [_jsx(MdOutlineOutput, { className: iconStyle }), _jsx("span", { className: textTyle, children: "Election Results" })] }), _jsxs(Link, { to: "public-announcement", className: linkStyle, children: [_jsx(GiPublicSpeaker, { className: iconStyle }), _jsx("span", { className: textTyle, children: "Public Announcement" })] }), _jsxs(Link, { to: "blockchain", className: linkStyle, children: [_jsx(SiHiveBlockchain, { className: iconStyle }), _jsx("span", { className: textTyle, children: "Blockchain" })] }), authState?.authenticated && authState?.role === Role.ADMIN &&
                            _jsxs(Link, { to: "user", className: linkStyle, children: [_jsx(HiChartPie, { className: iconStyle }), _jsx("span", { className: textTyle, children: "User management" })] })] }), _jsxs("div", { className: " items-center h-svh flex flex-row justify-between h-500 mr-4 align-center ", children: [_jsxs("div", { className: "flex flex-row h-max items-center gap-2 h-500", children: [_jsx(FaMoon, { className: iconStyle }), _jsx("span", { className: "mt-1", children: "Dark mode" })] }), _jsx("div", { className: "flex h-max flex-col items-center ", children: _jsxs("label", { className: "inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", value: "", className: "sr-only peer", disabled: true }), _jsx("div", { className: "relative w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" })] }) })] }), _jsx("div", { className: "flex flex-max flex-col items-center", children: _jsx("img", { src: BlockchainIcon, width: 150 }) }), _jsx("div", { className: "flex h-screen flex-col justify-end", children: _jsxs("div", { className: "flex flex-col justify-end gap-2", children: [_jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("span", { className: "justify-start", children: "Profile" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { children: _jsx("img", { height: 50, width: 50, src: url, className: "rounded-full" }) }), _jsxs("div", { className: "flex flex-col bg-purple-0 gap-0", children: [_jsx("div", { className: " bg-slate-0", children: _jsx("span", { children: authState.name ?? "Unkown user" }) }), _jsx("div", { className: " bg-blue-0", children: _jsx("span", { children: authState.role === Role.ADMIN ? "Admin account" : "Normal account" }) })] })] })] }), _jsxs("div", { className: "flex items-center justify-between mr-4", children: [_jsxs("a", { className: linkStyle, onClick: onLogOutUser, children: [_jsx(BiLogOutCircle, {}), "Log out"] }), _jsx(Link, { className: linkStyle, to: "edit-account", children: _jsxs("div", { className: "flex flex-col items-center", children: [_jsx(IoSettings, {}), _jsx("span", { className: "mt-1", children: "Setting" })] }) })] })] }) })] }) }));
}
export default SideBarComponent;
