/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { addDays } from "date-fns";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type React from "react";
import {
  REFRESH_TOKEN_KEY,
  TOKEN_KEY,
  TOKEN_NAME,
  TOKEN_ROLE,
  TOKEN_USERNAME,
} from "@/global/globalVariables";
import { US_STATES } from "@/constants/usStates";
import { loadImages } from "@/services/firebase";
import { deleteItemAsync, getItemAsync, setItemAsync } from "./SecureStore";

const provinces = US_STATES;

export const API_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

interface AuthState {
  token: string | null;
  authenticated: boolean | null;
  username: string | null;
  name: string | null;
  role: string | null;
}

interface TopVoteProvince {
  id: number;
  province: string;
  percentage: number;
  number: string;
}

interface AuthContextType {
  authState: AuthState;
  onLogin: (username: string, password: string) => Promise<any>;
  onLogOut: () => Promise<void>;
  isLoggedIn: () => Promise<any>;
  dateRange: { from: Date; to: Date };
  setDateRange: React.Dispatch<React.SetStateAction<{ from: Date; to: Date }>>;
  mapData: any;
  setMapData: React.Dispatch<React.SetStateAction<any>>;
  partiesData: any;
  setPartiesData: React.Dispatch<React.SetStateAction<any>>;
  provinces: string[];
  topVotesPerProvinces: TopVoteProvince[];
  setTopVotesPerProvinces: React.Dispatch<
    React.SetStateAction<TopVoteProvince[]>
  >;
  imageList: Record<string, string> | undefined;
  setImageList: React.Dispatch<
    React.SetStateAction<Record<string, string> | undefined>
  >;
  updateImages: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    authenticated: null,
    username: null,
    name: null,
    role: null,
  });

  const today = () => new Date();
  const moreDays = () => addDays(new Date(), 15);
  const [dateRange, setDateRange] = useState({ from: today(), to: moreDays() });
  const [mapData, setMapData] = useState<any>();
  const [partiesData, setPartiesData] = useState<any>();
  const [topVotesPerProvinces, setTopVotesPerProvinces] = useState<
    TopVoteProvince[]
  >([]);
  const [imageList, setImageList] = useState<
    Record<string, string> | undefined
  >();

  const updateImages = useCallback(() => {
    loadImages(setImageList as any);
  }, []);

  useEffect(() => {
    const loadToken = async () => {
      const token = await getItemAsync(TOKEN_KEY);
      const username = await getItemAsync(TOKEN_USERNAME);
      const name = await getItemAsync(TOKEN_NAME);
      const role = await getItemAsync(TOKEN_ROLE);
      if (token) {
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        setAuthState({ token, authenticated: true, username, name, role });
      }
    };
    loadToken();
  }, []);

  const URL_AUTH = `${API_URL}/api/committee`;

  const login = useCallback(async (electoralId: string, password: string) => {
    try {
      axios.defaults.withCredentials = true;
      const result = await axios.post(
        `${URL_AUTH}/auth-mobile`,
        { electoralId, password },
        { withCredentials: true },
      );
      setAuthState({
        token: result.data.accessToken,
        authenticated: true,
        username: electoralId,
        name: result.data.email ?? "",
        role: "",
      });
      axios.defaults.headers.common.Authorization = `Bearer ${result.data.accessToken}`;
      await setItemAsync(TOKEN_KEY, result.data.accessToken);
      await setItemAsync(TOKEN_USERNAME, electoralId);
      await setItemAsync(TOKEN_NAME, result.data.email ?? "");
      return result;
    } catch (e: any) {
      return { error: true, status: e?.response?.status, msg: e };
    }
  }, []);

  const logout = useCallback(async () => {
    await deleteItemAsync(TOKEN_KEY);
    await deleteItemAsync(TOKEN_USERNAME);
    await deleteItemAsync(TOKEN_NAME);
    await deleteItemAsync(TOKEN_ROLE);
    await deleteItemAsync(REFRESH_TOKEN_KEY);
    axios.defaults.headers.common.Authorization = "";
    setAuthState({
      token: null,
      authenticated: false,
      username: "",
      name: "",
      role: "",
    });
  }, []);

  const isLoggedIn = useCallback(async () => {
    try {
      const token = await getItemAsync(TOKEN_KEY);
      if (!token) return { error: true };
      axios.defaults.withCredentials = true;
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      const response = await axios.get(`${URL_AUTH}/refresh-token`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        const newToken = response.data.accessToken;
        setAuthState((prev) => ({
          ...prev,
          token: newToken,
          authenticated: true,
        }));
        axios.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        await setItemAsync(TOKEN_KEY, newToken);
        return response;
      }
      await logout();
      return { error: true };
    } catch (e) {
      await logout();
      return { error: true, msg: e };
    }
  }, [logout]);

  const value: AuthContextType = {
    onLogin: login,
    onLogOut: logout,
    isLoggedIn,
    authState,
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
