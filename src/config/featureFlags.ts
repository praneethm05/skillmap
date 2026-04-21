import { appEnv } from './env';

export const featureFlags = {
  useMockApi: appEnv.useMockApi,
  enableInsights: appEnv.enableInsights,
  enableExport: appEnv.enableExport,
};
