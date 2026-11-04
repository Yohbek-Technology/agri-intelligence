import { createRequire } from 'module'
import type { ATSmsClient } from '@repo/shared'

const require = createRequire(import.meta.url)

const useProduction = process.env.NODE_ENV === 'production' && Boolean(process.env.AT_USERNAME?.trim())

const username = useProduction ? (process.env.AT_USERNAME || 'sandbox') : 'sandbox'
const apiKey   = (useProduction ? process.env.AT_API_KEY : process.env.AT_SANDBOX_API_KEY) || 'dummy_key_for_testing'

const AT = require('africastalking')({ apiKey, username })

export const smsClient  = AT.SMS as ATSmsClient
export const senderId   = process.env.AT_SENDER_ID ?? ''
export const AT_SUCCESS = 101

console.log(`[sms] Africa's Talking initialised — ${useProduction ? 'production' : 'sandbox'} (username: ${username})`)
