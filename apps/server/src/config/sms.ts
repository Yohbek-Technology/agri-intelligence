import { createRequire } from 'module'
import type { ATSmsClient } from '@repo/shared'

const require = createRequire(import.meta.url)

const isDev = process.env.NODE_ENV !== 'production'

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`[sms] Environment variable ${key} is required`)
  return value
}

const username = isDev ? 'sandbox' : requireEnv('AT_USERNAME')
const apiKey   = isDev ? requireEnv('AT_SANDBOX_API_KEY') : requireEnv('AT_API_KEY')

const AT = require('africastalking')({ apiKey, username })

export const smsClient  = AT.SMS as ATSmsClient
export const senderId   = process.env.AT_SENDER_ID ?? ''
export const AT_SUCCESS = 101

console.log(`[sms] Africa's Talking initialised — ${isDev ? 'sandbox' : 'production'} (username: ${username})`)
