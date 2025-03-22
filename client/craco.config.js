const webpack = require('webpack');

module.exports = {
  jest: {
    configure: {
      testEnvironment: 'jest-environment-jsdom',
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
        '^.+\\.(css|sass|scss)$': 'jest-transform-stub',
        '^.+\\.(jpg|jpeg|png|gif|webp|svg|ico)$': 'jest-transform-stub'
      },
      setupFilesAfterEnv: [
        '<rootDir>/src/setupTests.ts'
      ],
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
        '^.+\\.svg$': 'jest-transform-stub'
      },
      testMatch: [
        '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
        '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}'
      ],
      collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.d.ts',
        '!src/mocks/**'
      ],
      coverageThreshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  },
  webpack: {
    configure: (webpackConfig) => {
      const fallback = webpackConfig.resolve.fallback || {};
      Object.assign(fallback, {
        "buffer": require.resolve("buffer"),
        "stream": require.resolve("stream-browserify"),
        "crypto": require.resolve("crypto-browserify"),
        "process": false
      });
      webpackConfig.resolve.fallback = fallback;
      webpackConfig.plugins = (webpackConfig.plugins || []).concat([
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: require.resolve("process/browser")
        })
      ]);
      return webpackConfig;
    }
  }
}; 