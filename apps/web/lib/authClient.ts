import { createAuthClient } from 'better-auth/react'
import { phoneNumberClient, usernameClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000',
  fetchOptions: {
    credentials: 'include',
  },
  plugins: [
    phoneNumberClient(),
    usernameClient({ displayUsername: false }),
  ],
})

export const { useSession, signIn, signOut, signUp } = authClient
