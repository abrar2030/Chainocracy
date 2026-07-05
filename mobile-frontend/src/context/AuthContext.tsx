import * as SecureStore from "expo-secure-store";
import {
  createContext,
  type Dispatch,
  type SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "src/api/axios";
import type { HashMap } from "src/data_types";
import { Config } from "../constants/config";

interface AuthProps {
  authState?: {
    token: string | null;
    authenticated: boolean | null;
    email: string | null;
    electoralId?: string | null;
    port?: string | null;
  };
  onLogin?: (electoralId: string, password: string) => Promise<any>;
  isLoggedIn?: () => Promise<any>;
  onRegister?: (body: any) => Promise<any>;
  onLogOut?: () => Promise<any>;
  imageList: HashMap<any>;
  setImageList: Dispatch<SetStateAction<HashMap<any>>>;
  isLoading: boolean;
}

export const TOKEN_KEY = Config.STORAGE_KEYS.JWT_TOKEN;
export const TOKEN_EMAIL = Config.STORAGE_KEYS.EMAIL;
export const TOKEN_ELECTORAL_ID = Config.STORAGE_KEYS.ELECTORAL_ID;
export const TOKEN_PORT = Config.STORAGE_KEYS.PORT;

const LOGIN_URL = Config.ENDPOINTS.LOGIN;
const REGISTER_URL = Config.ENDPOINTS.REGISTER;
const REFRESH_URL = Config.ENDPOINTS.REFRESH_TOKEN;

const AuthContext = createContext<AuthProps>({
  imageList: {},
  setImageList: () => {},
  isLoading: true,
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: any) => {
  const [authState, setAuthState] = useState<{
    token: string | null;
    authenticated: boolean | null;
    email: string | null;
    electoralId?: string | null;
    port?: string | null;
  }>({
    token: null,
    authenticated: null,
    email: null,
    electoralId: null,
    port: null,
  });

  const [imageList, setImageList] = useState<HashMap<any>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        const email = await SecureStore.getItemAsync(TOKEN_EMAIL);
        const electoralId = await SecureStore.getItemAsync(TOKEN_ELECTORAL_ID);
        const port = await SecureStore.getItemAsync(TOKEN_PORT);

        if (token) {
          axios.defaults.headers.common.Authorization = `Bearer ${token}`;
          axios.defaults.headers.common.Cookie = `jwt=${token}`;

          setAuthState({
            token: token,
            authenticated: true,
            email: email,
            electoralId: electoralId,
            port: port,
          });
        }
      } catch (error) {
        if (Config.APP.SHOW_LOGS) {
          console.error("Error loading token:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  const register = async (body: any) => {
    try {
      const response = await axios.post(REGISTER_URL, body);
      return {
        success: true,
        data: response.data,
        message: response.data.message || "Registration successful",
      };
    } catch (e: any) {
      return {
        error: true,
        success: false,
        message:
          e.response?.data?.msg ||
          e.response?.data?.note ||
          "Registration failed. Please try again.",
      };
    }
  };

  const login = async (electoralId: string, password: string) => {
    try {
      const result = await axios.post(LOGIN_URL, {
        electoralId: electoralId,
        password: password,
      });

      const { accessToken, email, port } = result.data;

      setAuthState({
        token: accessToken,
        authenticated: true,
        email: email,
        electoralId: electoralId,
        port: port,
      });

      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      axios.defaults.headers.common.Cookie = `jwt=${accessToken}`;

      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(TOKEN_EMAIL, email);
      await SecureStore.setItemAsync(TOKEN_ELECTORAL_ID, electoralId);
      await SecureStore.setItemAsync(TOKEN_PORT, port);

      return {
        success: true,
        data: result.data,
        message: "Login successful",
      };
    } catch (e: any) {
      return {
        error: true,
        success: false,
        message:
          e.response?.data?.msg ||
          e.response?.data?.note ||
          "Login failed. Please check your credentials.",
      };
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(TOKEN_EMAIL);
      await SecureStore.deleteItemAsync(TOKEN_ELECTORAL_ID);
      await SecureStore.deleteItemAsync(TOKEN_PORT);

      axios.defaults.headers.common.Authorization = "";
      axios.defaults.headers.common.Cookie = "";

      setAuthState({
        token: null,
        authenticated: false,
        email: null,
        electoralId: null,
        port: null,
      });

      return { success: true };
    } catch (error) {
      if (Config.APP.SHOW_LOGS) {
        console.error("Logout error:", error);
      }
      return { success: false, error: true };
    }
  };

  const isLoggedIn = async () => {
    try {
      if (!axios.defaults.headers.common.Authorization) {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token) {
          axios.defaults.headers.common.Authorization = `Bearer ${token}`;
          axios.defaults.headers.common.Cookie = `jwt=${token}`;
        }
      }

      const response = await axios.get(REFRESH_URL, {
        withCredentials: true,
      });

      const statusCode = response.status;

      if (statusCode === 200) {
        const token = response.data.accessToken;
        const email = await SecureStore.getItemAsync(TOKEN_EMAIL);
        const electoralId = await SecureStore.getItemAsync(TOKEN_ELECTORAL_ID);
        const port = await SecureStore.getItemAsync(TOKEN_PORT);

        setAuthState({
          token: token,
          authenticated: true,
          email: email || "",
          electoralId: electoralId || "",
          port: port || "",
        });

        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        await SecureStore.setItemAsync(TOKEN_KEY, token);

        return { success: true, authenticated: true };
      } else {
        await logout();
        return { success: false, authenticated: false };
      }
    } catch (_e: any) {
      await logout();
      return {
        error: true,
        success: false,
        authenticated: false,
        message: "Session expired. Please login again.",
      };
    }
  };

  const value = {
    onRegister: register,
    onLogin: login,
    onLogOut: logout,
    isLoggedIn: isLoggedIn,
    authState,
    imageList,
    setImageList,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
