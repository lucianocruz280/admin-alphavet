import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import axios from 'axios'

const handler = NextAuth({
  session: {
    strategy: 'jwt',
  },

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        console.log(credentials)
        if (!credentials) return null

        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
          {
            email: credentials.email,
            password: credentials.password,
          }
        )

        const data = res.data
        if (!data?.success) return null

        return {
          id: data.data.user.id,
          name: data.data.user.name,
          email: data.data.user.email,
          token: data.data.token,
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  pages: {
    signIn: '/auth-1/sign-in',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).token
        token.user = {
          id: (user as any).id,
          name: user.name ?? null,
          email: user.email ?? null,
        }
      }
      return token
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.user = token.user as any
      return session
    },
  },
})

export { handler as GET, handler as POST }
