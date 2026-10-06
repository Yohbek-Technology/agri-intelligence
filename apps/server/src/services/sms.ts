export async function sendSms(to: string, body: string): Promise<void> {
  console.log(`[sms] to=${to} body=${body}`)
}

export async function onPhoneVerified(userId: string): Promise<void> {
  console.log(`[sms] phone verified for user: ${userId}`)
}
