module.exports = {
  roots: ["<rootDir>/apps/frontend/src"],
  testMatch: ["**/__tests__/**/*.+(ts|tsx|js)", "**/?(*.)+(spec|test).+(ts|tsx|js)"],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "<rootDir>/apps/frontend/tsconfig.jest.json" }]
  },
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleNameMapper: {
    "^@frontend/(.*)$": "<rootDir>/apps/frontend/src/$1"
  },
  collectCoverageFrom: [
    "apps/frontend/src/**/*.{ts,tsx}",
    "!apps/frontend/src/**/*.d.ts",
    "!apps/frontend/src/**/*.stories.tsx"
  ],
  coveragePathIgnorePatterns: ["/node_modules/", "/.next/"],
  testEnvironment: "jsdom"
};
