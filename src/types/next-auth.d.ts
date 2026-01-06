import NextAuth, { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    user?: {
      id?: string
      name?: string | null
      email?: string | null
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    user?: {
      id?: string
      name?: string | null
      email?: string | null
    }
  }
}
