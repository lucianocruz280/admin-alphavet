    import { withAuth } from 'next-auth/middleware'
import type { NextRequest } from 'next/server'

export default withAuth(
  function middleware(req: NextRequest) {
  },
  {
    pages: {
      signIn: '/auth-1/sign-in',
    },
  }
)

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/pets/:path*',
    '/appointments/:path*',
  ],
}
