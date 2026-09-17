/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'ESNext',
          moduleResolution: 'bundler',
          target: 'ES2022',
          esModuleInterop: true,
          types: ['node', 'jest'],
        },
      },
    ],
  },
  testMatch: ['**/tests/**/*.test.ts'],
  testTimeout: 30000,
};
