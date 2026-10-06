export async function sendSms(to: string, body: string): Promise<void> {
  console.log(`[sms] to=${to} body=${body}`)
}
