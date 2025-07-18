export default {
  displayName: 'zookeeper',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/zookeeper',
  // Add memory allocation settings to prevent heap out of memory
  maxWorkers: 1,
  workerIdleMemoryLimit: '512MB',
  // Increase timeout for tests that might take longer
  testTimeout: 30000,
};
