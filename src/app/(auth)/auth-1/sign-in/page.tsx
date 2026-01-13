'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

import AppLogo from '@/components/AppLogo'
import { currentYear } from '@/helpers'
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  FormControl,
  FormLabel,
  Row,
  Alert,
} from 'react-bootstrap'

const Page = () => {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    console.log('signIn response:', res)

    if (res?.error) {
      setError('Invalid email or password')
    } else {
      router.push('/') // o /dashboard
    }

    setLoading(false)
  }

  return (
    <div
      className="auth-box overflow-hidden align-items-center d-flex"
      style={{ minHeight: '100vh' }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col xxl={4} md={6} sm={8}>
            <Card className="p-4 position-relative">
              <div className="auth-brand text-center mb-4">
                <AppLogo />
                <p className="text-muted w-lg-75 mt-3 mx-auto">
                  Let’s get you signed in. Enter your email and password to continue.
                </p>
              </div>

              <Form onSubmit={handleSubmit}>
                <div className="mb-3 form-group">
                  <FormLabel>
                    Email address <span className="text-danger">*</span>
                  </FormLabel>
                  <FormControl
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="mb-3 form-group">
                  <FormLabel>
                    Password <span className="text-danger">*</span>
                  </FormLabel>
                  <FormControl
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {error && (
                  <Alert variant="danger" className="py-2">
                    {error}
                  </Alert>
                )}

                <div className="d-grid">
                  <Button
                    type="submit"
                    className="btn-primary fw-semibold py-2"
                    disabled={loading}
                  >
                    {loading ? 'Signing in…' : 'Sign In'}
                  </Button>
                </div>
              </Form>

              <p className="text-muted text-center mt-4 mb-0">
                New here?{' '}
                <Link
                  href="/auth-1/sign-up"
                  className="text-decoration-underline fw-semibold"
                >
                  Create an account
                </Link>
              </p>
            </Card>

            <p className="text-center text-muted mt-4 mb-0">
              © {currentYear} UBold — by{' '}
              <span className="fw-semibold">Coderthemes</span>
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Page
