import 'dotenv/config'

export function getAfroMessageConfig() {
  const token = (process.env.AFROMESSAGE_TOKEN || '').trim()
  const sender = (process.env.AFROMESSAGE_SENDER || '').trim()
  const identifierId = (process.env.AFROMESSAGE_IDENTIFIER_ID || '').trim()
  const apiUrl = (process.env.AFROMESSAGE_API_URL || 'https://api.afromessage.com/api/send').trim()

  return {
    token,
    sender,
    identifierId,
    apiUrl,
    isConfigured: Boolean(token),
  }
}

// Startup status check
const initial = getAfroMessageConfig()
console.log(
  `[sms] AfroMessage initialised — ${initial.isConfigured ? 'token configured' : 'no token set (mock mode for local dev/testing)'}`
)
