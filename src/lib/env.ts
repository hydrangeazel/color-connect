const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'Color Connect'

export const env = {
  appName: APP_NAME,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const
