'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, Github } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('demo@example.com')
  const [password, setPassword] = useState('Password123!')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Form */}
      <div className="w-full bg-white px-8 py-12 flex flex-col justify-between md:w-1/3">
        <div>
          {/* Logo */}
          <div className="mb-12 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary"></div>
            <span className="text-xl font-bold text-foreground">Capital City Bank</span>
          </div>

          {/* Form Content */}
          <div>
            <h1 className="mb-2 text-4xl font-bold text-foreground">
              Welcome Back
            </h1>
            <p className="mb-8 text-muted-foreground">
              Login and Deploy in seconds
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email*
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="johndoe@gmail.com"
                  required
                  className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-foreground">
                    Password*
                  </label>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="text-primary p-0 h-auto"
                  >
                    Forgot Password?
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="border-border bg-background text-foreground placeholder:text-muted-foreground pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                  {error}
                </div>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-6 text-base font-semibold"
              >
                {loading ? 'Signing in...' : 'Login'}
              </Button>
            </form>

            {/* Sign Up Link */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Not yet registered?{' '}
              <Button
                type="button"
                variant="link"
                onClick={() => router.push('/signup')}
                className="text-foreground font-semibold p-0 h-auto"
              >
                Create an Account
              </Button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground">
          © 2026 Capital City Bank. All rights reserved.
        </p>
      </div>

      {/* Right Side - Background Image */}
      <div className="hidden md:flex md:w-4/5 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/young-colleagues-having-coffee-break.jpg')" }}
        >
          {/* Subtle dark overlay for depth */}
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
      </div>
    </div>
  )
}
