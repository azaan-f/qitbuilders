import { createDefaultPreset } from 'ts-jest/presets';

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} */
const config = {
  testEnvironment: 'node',
  transform: {
    ...tsJestTransformCfg,
  },
};

export default config;
