module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@react-native-picker|phosphor-react-native|styled-components)",
  ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1",
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@screens/(.*)$": "<rootDir>/src/screens/$1",
    "^@routes/(.*)$": "<rootDir>/src/routes/$1",
    "^@assets/(.*)$": "<rootDir>/src/assets/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "\\.png$": "<rootDir>/__mocks__/fileMock.js",
    "\\.svg$": "<rootDir>/__mocks__/fileMock.js",
  },
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  testPathIgnorePatterns: ["/node_modules/", "/__tests__/fixtures/"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/assets/**",
    "!src/@types/**",
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  testEnvironment: "node",
};
