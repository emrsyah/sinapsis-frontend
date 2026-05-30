import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { config } from './config'

declare global {
  interface Window {
    Pusher: typeof Pusher
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let echo: Echo<any> | null = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getEcho(token: string): Echo<any> {
  if (echo) return echo

  window.Pusher = Pusher

  echo = new Echo({
    broadcaster: 'reverb',
    key: config.reverb.appKey,
    wsHost: config.reverb.host,
    wsPort: config.reverb.port,
    wssPort: config.reverb.port,
    forceTLS: config.reverb.scheme === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${config.apiUrl}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  })

  return echo
}

export function disconnectEcho() {
  echo?.disconnect()
  echo = null
}

export function getEchoSocketId(): string | null {
  return echo?.socketId() ?? null
}
