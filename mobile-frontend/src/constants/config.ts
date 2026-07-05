/**
 * Application Configuration
 * Centralized configuration for API endpoints, timeouts, and feature flags
 */

// Default targets the backend on port 3000 (its default). Emulators can reach
// the host via localhost; a physical device must use the host machine's LAN IP,
// for example http://192.168.0.38:3000. Override at runtime with updateApiBaseUrl.
const DEFAULT_API_BASE_URL = "http://localhost:3000";

export const Config = {
  // API Configuration
  API_BASE_URL: DEFAULT_API_BASE_URL,
  API_TIMEOUT: 30000, // 30 seconds

  // Endpoints
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: "/api/committee/auth-mobile",
    REGISTER: "/api/committee/register-voter",
    REFRESH_TOKEN: "/api/committee/refresh-token",
    LOGOUT: "/api/committee/log-out",
    VERIFY_OTP: "/api/committee/verify-otp",
    SEND_EMAIL: "/api/committee/send-email",

    // Data endpoints
    CANDIDATES: "/api/committee/candidates",
    ANNOUNCEMENT: "/api/committee/announcement",
    REGISTERS: "/api/committee/registers",
  },

  // Feature Flags
  FEATURES: {
    ENABLE_QR_SCANNER: true,
    ENABLE_BIOMETRIC_AUTH: false,
    ENABLE_OFFLINE_MODE: false,
  },

  // Storage Keys
  STORAGE_KEYS: {
    JWT_TOKEN: "my-jwt",
    EMAIL: "my-email",
    ELECTORAL_ID: "my-electoral-id",
    PORT: "my-port",
  },

  // App Settings
  APP: {
    DEBUG_MODE: __DEV__,
    SHOW_LOGS: __DEV__,
  },
};

/**
 * Get full API URL
 */
export const getApiUrl = (endpoint: string): string => {
  return `${Config.API_BASE_URL}${endpoint}`;
};

/**
 * Update API base URL (useful for dynamic configuration)
 */
export const setApiBaseUrl = (url: string): void => {
  Config.API_BASE_URL = url;
};
