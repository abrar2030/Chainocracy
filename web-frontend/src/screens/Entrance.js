import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Login from './Login';
import SideBarComponent from '@/components/SidebarComponent';
import Container from '@/components/Container';
import { loadImages } from '@/services/firebase';
function Entrance() {
    const { authState, isLoggedIn, setImageList } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        isLoggedIn();
        if (!authState?.authenticated) {
            navigate('/');
        }
        loadImages(setImageList);
    }, []);
    return (_jsxs("div", { className: 'flex flex-col gap-2 w-screen h-screen', children: [authState?.authenticated && (_jsxs("div", { className: 'flex flex-row', children: [_jsx("div", { children: _jsx(SideBarComponent, {}) }), _jsx("div", { className: 'pl-60 w-screen', children: _jsx("div", { className: 'p-3', style: { backgroundColor: '#FAFAFA' }, children: _jsx(Container, {}) }) })] })), !authState?.authenticated && (_jsx(Login, {}))] }));
}
export default Entrance;
