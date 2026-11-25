import { Resend } from 'resend'

import { env } from '~/env.mjs'

let resendClient: Resend | null = null

function getResendClient(): Resend {
  if (!resendClient) {
    resendClient = new Resend(env.RESEND_API_KEY)
  }
  return resendClient
}

export const resend = new Proxy({} as Resend, {
  get(_target, prop) {
    const client = getResendClient()
    const value: unknown = Reflect.get(client, prop, client)
    if (typeof value === 'function') {
      return value.bind(client) as unknown
    }
    return value
  },
})
