/** jest-expo preset + path aliases mirroring tsconfig.json. */
module.exports = {
  preset: "jest-expo",
  // RNTL v13 auto-extends Jest matchers via its main entry import, so there is
  // no standalone "@testing-library/react-native/extend-expect" setup file.
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^expo-router$": "<rootDir>/test/mocks/expo-router.tsx",
    "^@/assets/(.*)$": "<rootDir>/assets/$1",
    "^@cvx/(.*)$": "<rootDir>/convex/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  // Convex tests run under vitest (npm run test:convex), not jest.
  testPathIgnorePatterns: ["/node_modules/", "/\\.claude/", "/convex/"],
  // Ignore the worktree copy so Haste doesn't see duplicate package.json names.
  modulePathIgnorePatterns: ["<rootDir>/.claude/worktrees/"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|nativewind|react-native-css|react-native-svg|react-native-reanimated|react-native-worklets|react-native-gesture-handler|zustand))",
  ],
};
