export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api',
  reverb: {
    host: process.env.NEXT_PUBLIC_REVERB_HOST ?? 'localhost',
    port: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    appKey: process.env.NEXT_PUBLIC_REVERB_APP_KEY ?? '',
    scheme: process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'http',
  },
} as const
