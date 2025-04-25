import { jsx as _jsx } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useEffect, useState } from "react";
import { setItemAsync, deleteItemAsync, getItemAsync } from './SecureStore';
import axios from 'axios';
import { addDays } from "date-fns";
import { REFRESH_TOKEN_KEY, TOKEN_KEY, TOKEN_NAME, TOKEN_ROLE, TOKEN_USERNAME } from "@/global/globalVariables";
import { loadImages } from '@/services/firebase';
const provinces = [
    "Bengo",
    "Benguela",
    "Bié",
    "Cabinda",
    "Cuando Cubango",
    "Cuanza Norte",
    "Cuanza Sul",
    "Cunene",
    "Huambo",
    "Huíla",
    "Luanda",
    "Lunda Norte",
    "Lunda Sul",
    "Malanje",
    "Moxico",
    "Namibe",
    "Uíge",
    "Zaire"
];
export const API_URL = 'http://localhost:3010';
const AuthContext = createContext({});
export const useAuth = () => {
    return useContext(AuthContext);
};
export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        token: null,
        authenticated: null,
        username: null,
        name: null,
        role: null
    });
    const today = () => new Date();
    const moreDays = () => addDays(new Date(), 15);
    const [dateRange, setDateRange] = useState({
        from: today(),
        to: moreDays(),
    });
    const [mapData, setMapData] = useState();
    const [partiesData, setPartiesData] = useState();
    const [topVotesPerProvinces, setTopVotesPerProvinces] = useState([]);
    const [imageList, setImageList] = useState();
    const updateImages = () => {
        loadImages(setImageList);
    };
    useEffect(() => {
        const loadToken = async () => {
            const token = await getItemAsync(TOKEN_KEY);
            const username = await getItemAsync(TOKEN_USERNAME);
            const name = await getItemAsync(TOKEN_NAME);
            const role = await getItemAsync(TOKEN_ROLE);
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setAuthState({
                    token: token,
                    authenticated: true,
                    username: username,
                    name: name,
                    role: role
                });
            }
        };
        loadToken();
    }, []);
    const URL = 'http://localhost:3010/api/committee';
    const login = async (username, password) => {
        try {
            axios.defaults.withCredentials = true;
            const result = await axios.post(URL + '/auth-web', {
                username: username,
                password: password
            }, { withCredentials: true });
            setAuthState({
                token: result.data.accessToken,
                authenticated: true,
                username: result.data.username,
                name: result.data.name,
                role: result.data.role
            });
            axios.defaults.headers.common['Authorization'] = `Bearer ${result.data.accessToken}`;
            await setItemAsync(TOKEN_KEY, result.data.accessToken);
            await setItemAsync(REFRESH_TOKEN_KEY, result.data.refreshToken);
            await setItemAsync(TOKEN_USERNAME, result.data.username);
            await setItemAsync(TOKEN_NAME, result.data.name);
            return result;
        }
        catch (e) {
            return { error: true, msg: e };
        }
    };
    const logout = async () => {
        await deleteItemAsync(TOKEN_KEY);
        await deleteItemAsync(TOKEN_USERNAME);
        await deleteItemAsync(TOKEN_NAME);
        await deleteItemAsync(TOKEN_ROLE);
        axios.defaults.headers.common['Authorization'] = '';
        setAuthState({
            token: null,
            authenticated: false,
            username: "",
            name: "",
            role: ""
        });
    };
    const isLoggedIn = async () => {
        try {
            const refreshToken = await getItemAsync(REFRESH_TOKEN_KEY);
            axios.defaults.withCredentials = true;
            axios.defaults.headers.common['Authorization'] = `Bearer ${refreshToken}`;
            const response = await axios.get(URL + '/refresh-token-web', {
                withCredentials: true
            });
            const statusCode = response.status;
            if (statusCode === 201) {
                const token = response.data.accessToken;
                const refreshToken = response.data.refreshToken;
                setAuthState({
                    ...authState,
                    token: token,
                    authenticated: true,
                });
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                await setItemAsync(TOKEN_KEY, token);
                await setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
                return response;
            }
            else {
                await logout();
                return { error: true };
            }
        }
        catch (e) {
            await logout();
            return { error: true, msg: e };
        }
    };
    const value = {
        onLogin: login,
        onLogOut: logout,
        isLoggedIn: isLoggedIn,
        authState,
        // Global variables
        dateRange,
        setDateRange,
        mapData,
        setMapData,
        partiesData,
        setPartiesData,
        provinces,
        topVotesPerProvinces,
        setTopVotesPerProvinces,
        imageList,
        setImageList,
        updateImages,
    };
    return (_jsx(AuthContext.Provider, { value: value, children: children }));
};
