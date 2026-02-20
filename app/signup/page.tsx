'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export default function SignupPage() {
  // Account credentials
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Personal information
  const [fullName, setFullName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [phone, setPhone] = useState('')
  
  // Address information
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  
  // UI state
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState<'credentials' | 'personal' | 'address'>('credentials')
  
  const { signup } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const validateCredentials = () => {
    if (!email || !password || !confirmPassword) {
      setError('All fields are required')
      return false
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }

    return true
  }

  const validatePersonal = () => {
    if (!fullName || !dateOfBirth || !phone) {
      setError('All personal information fields are required')
      return false
    }

    // Validate age (must be 18+)
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (age < 18 || (age === 18 && monthDiff < 0)) {
      setError('You must be at least 18 years old to open an account')
      return false
    }

    // Validate phone format (basic)
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/
    if (!phoneRegex.test(phone)) {
      setError('Please enter a valid phone number')
      return false
    }

    return true
  }

  const validateAddress = () => {
    if (!address || !city || !state || !zipCode) {
      setError('All address fields are required')
      return false
    }

    // Validate ZIP code (US format)
    const zipRegex = /^\d{5}(-\d{4})?$/
    if (!zipRegex.test(zipCode)) {
      setError('Please enter a valid ZIP code')
      return false
    }

    return true
  }

  const handleNext = () => {
    setError('')
    
    if (step === 'credentials') {
      if (validateCredentials()) {
        setStep('personal')
      }
    } else if (step === 'personal') {
      if (validatePersonal()) {
        setStep('address')
      }
    }
  }

  const handleBack = () => {
    setError('')
    if (step === 'address') {
      setStep('personal')
    } else if (step === 'personal') {
      setStep('credentials')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateAddress()) {
      return
    }

    setLoading(true)

    try {
      // Create auth account
      await signup(email, password)
      
      // Get the newly created user
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Create/update profile with all information
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: fullName,
            phone: phone,
            date_of_birth: dateOfBirth,
            address: address,
            city: city,
            state: state,
            zip_code: zipCode,
            updated_at: new Date().toISOString()
          })
        
        if (profileError) {
          console.error('Profile creation error:', profileError)
        }
      }
      
      // Show success state
      setSuccess(true)
      
      // Show success toast
      toast({
        title: "Account Created Successfully! 🎉",
        description: "Your checking account has been created. Redirecting to dashboard...",
        duration: 3000,
      })
      
      // Wait 3 seconds before redirecting
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Form */}
      <div className="w-full bg-white px-8 py-12 flex flex-col justify-between md:w-1/3 overflow-y-auto">
        <div>
          {/* Logo */}
          <div className="mb-8 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary"></div>
            <span className="text-xl font-bold text-foreground">Capital City Bank</span>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8 flex items-center gap-2">
            <div className={`h-2 flex-1 rounded-full ${step === 'credentials' ? 'bg-primary' : 'bg-primary'}`}></div>
            <div className={`h-2 flex-1 rounded-full ${step === 'personal' || step === 'address' ? 'bg-primary' : 'bg-gray-200'}`}></div>
            <div className={`h-2 flex-1 rounded-full ${step === 'address' ? 'bg-primary' : 'bg-gray-200'}`}></div>
          </div>

          {/* Form Content */}
          <div>
            <h1 className="mb-2 text-4xl font-bold text-foreground">
              {step === 'credentials' && 'Create Account'}
              {step === 'personal' && 'Personal Information'}
              {step === 'address' && 'Address Details'}
            </h1>
            <p className="mb-8 text-muted-foreground">
              {step === 'credentials' && 'Start your banking journey with us'}
              {step === 'personal' && 'Tell us about yourself'}
              {step === 'address' && 'Where can we reach you?'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Step 1: Credentials */}
              {step === 'credentials' && (
                <>
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
                      className="border-border bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Password*
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        required
                        className="border-border bg-background text-foreground pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Confirm Password*
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        required
                        className="border-border bg-background text-foreground pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Step 2: Personal Information */}
              {step === 'personal' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Full Name*
                    </label>
                    <Input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="border-border bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Date of Birth* (Must be 18+)
                    </label>
                    <Input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      required
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      className="border-border bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone Number*
                    </label>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      required
                      className="border-border bg-background text-foreground"
                    />
                  </div>
                </>
              )}

              {/* Step 3: Address */}
              {step === 'address' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Street Address*
                    </label>
                    <Input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Main St"
                      required
                      className="border-border bg-background text-foreground"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        City*
                      </label>
                      <Input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="New York"
                        required
                        className="border-border bg-background text-foreground"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        State*
                      </label>
                      <Input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="NY"
                        required
                        maxLength={2}
                        className="border-border bg-background text-foreground"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      ZIP Code*
                    </label>
                    <Input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="10001"
                      required
                      maxLength={10}
                      className="border-border bg-background text-foreground"
                    />
                  </div>
                </>
              )}

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                  {error}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                {step !== 'credentials' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1"
                  >
                    Back
                  </Button>
                )}
                
                {step !== 'address' ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-6"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading || success}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-6"
                  >
                    {success ? (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        Account Created!
                      </span>
                    ) : loading ? (
                      'Creating account...'
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                )}
              </div>
            </form>

            {/* Sign In Link */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Button
                type="button"
                variant="link"
                onClick={() => router.push('/login')}
                className="text-foreground font-semibold p-0 h-auto"
              >
                Sign in
              </Button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground mt-8">
          © 2010 Capital City Bank. All rights reserved.
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
