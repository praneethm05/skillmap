const toBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === 'true';
};

const trimOrEmpty = (value: string | undefined): string => (value ?? '').trim();

export const appEnv = {
  clerkPublishableKey: trimOrEmpty(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY),
  apiBaseUrl: trimOrEmpty(import.meta.env.VITE_API_BASE_URL),
  useMockApi: toBoolean(import.meta.env.VITE_USE_MOCK_API, true),
  enableInsights: toBoolean(import.meta.env.VITE_ENABLE_INSIGHTS, true),
  enableExport: toBoolean(import.meta.env.VITE_ENABLE_EXPORT, true),
  enableSocial: toBoolean(import.meta.env.VITE_ENABLE_SOCIAL, false),
  enableSharing: toBoolean(import.meta.env.VITE_ENABLE_SHARING, false),
  enableAccountability: toBoolean(import.meta.env.VITE_ENABLE_ACCOUNTABILITY, false),
};

export const getStartupIssues = (): string[] => {
  const issues: string[] = [];

  if (!appEnv.clerkPublishableKey) {
    issues.push('Missing VITE_CLERK_PUBLISHABLE_KEY in environment configuration.');
  }

  if (!appEnv.useMockApi && !appEnv.apiBaseUrl) {
    issues.push('VITE_API_BASE_URL is required when VITE_USE_MOCK_API is false.');
  }

  return issues;
};
