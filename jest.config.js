const path = require('node:path');

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
  coverageReporters: ["text-summary", "lcov"],
  coverageThreshold: {
    global: {
      branches: 28,
      functions: 35,
      lines: 39,
      statements: 39
    },
    [path.join(__dirname, "apps/frontend/src/components/echo/VoiceRecorder.tsx")]: {
      branches: 85,
      functions: 100,
      lines: 90,
      statements: 90
    },
    [path.join(__dirname, "apps/frontend/src/lib/checkin.ts")]: {
      branches: 85,
      functions: 100,
      lines: 95,
      statements: 95
    },
    [path.join(__dirname, "apps/frontend/src/lib/peer-matching/engine.ts")]: {
      branches: 85,
      functions: 100,
      lines: 95,
      statements: 95
    },
    [path.join(__dirname, "apps/frontend/src/lib/rag/search.ts")]: {
      branches: 70,
      functions: 100,
      lines: 90,
      statements: 90
    }
  },
  testEnvironment: "jsdom"
};
