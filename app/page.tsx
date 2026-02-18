'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useEffect } from 'react'
import { ArrowRight, Lock, TrendingUp, Send, Shield, Smartphone, CreditCard, PiggyBank, Users, DollarSign, Star, Calendar, ArrowUpRight } from 'lucide-react'

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-foreground/60">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60"></div>
              <span className="text-xl font-bold text-foreground">Capital City Bank</span>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => router.push('/login')}>
                Sign In
              </Button>
              <Button onClick={() => router.push('/signup')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Asymmetric Split Layout */}
      <section className="relative pt-20 pb-0 overflow-hidden min-h-screen flex items-center">
        {/* Diagonal Background Split */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-background"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-primary/10 to-transparent" style={{clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)'}}></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-40 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        
        <div className="relative mx-auto max-w-7xl px-4 md:px-8 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="order-2 md:order-1">
              
              <h1 className="mb-6 text-5xl md:text-7xl font-bold text-foreground leading-tight">
                Banking
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/60">
                  Reimagined
                </span>
              </h1>
              <p className="mb-8 text-lg md:text-xl text-foreground/70">
                Break free from traditional banking. Experience instant transfers, AI-powered insights, and military-grade security.
              </p>
              
              {/* Stacked CTAs */}
              <div className="space-y-4 mb-8 lg:flex items-center gap-4">
                <Button size="lg" className="w-full md:w-auto text-lg px-10 py-7 shadow-lg shadow-primary/20" onClick={() => router.push('/signup')}>
                  Start Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <div className="flex items-center gap-4 ">
                  <Button size="lg" variant="ghost" className="text-base px-10 py-7" onClick={() => router.push('/login')}>
                    Sign In
                  </Button>
                  <span className="text-sm text-foreground/50">No credit card required</span>
                </div>
              </div>

              {/* Mini Stats */}
              <div className="flex gap-8 pt-6 border-t border-border/50">
                <div>
                  <div className="text-2xl font-bold text-foreground">500K+</div>
                  <div className="text-xs text-foreground/60">Users</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">$2B+</div>
                  <div className="text-xs text-foreground/60">Volume</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">99.9%</div>
                  <div className="text-xs text-foreground/60">Uptime</div>
                </div>
              </div>
            </div>

            {/* Right Content - Floating Cards */}
            <div className="order-1 md:order-2 relative h-[500px]">
              {/* Card 1 - Top Right */}
              <Card className="absolute top-0 right-0 w-64 p-6 bg-card/80 backdrop-blur-xl border-primary/30 shadow-2xl transform rotate-3 hover:rotate-0 transition-all">
                <Lock className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-bold mb-2">Military-Grade Security</h3>
                <p className="text-sm text-foreground/60">256-bit encryption</p>
              </Card>
              
              {/* Card 2 - Middle Left */}
              <Card className="absolute top-32 left-0 w-64 p-6 bg-card/80 backdrop-blur-xl border-primary/30 shadow-2xl transform -rotate-2 hover:rotate-0 transition-all">
                <Send className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-bold mb-2">Instant Transfers</h3>
                <p className="text-sm text-foreground/60">Send in seconds</p>
              </Card>
              
              {/* Card 3 - Bottom Right */}
              <Card className="absolute bottom-0 right-12 w-64 p-6 bg-card/80 backdrop-blur-xl border-primary/30 shadow-2xl transform rotate-2 hover:rotate-0 transition-all">
                <TrendingUp className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-bold mb-2">AI Analytics</h3>
                <p className="text-sm text-foreground/60">Smart insights</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Diagonal Services Section */}
      <section className="relative py-32 px-4 overflow-hidden">
        {/* Diagonal Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-background" style={{clipPath: 'polygon(0 10%, 100% 0, 100% 90%, 0 100%)'}}></div>
        
        <div className="relative mx-auto max-w-7xl">
          {/* Offset Title */}
          <div className="mb-20 md:ml-20">
            <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
              Built for
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Everyone</span>
            </h2>
            <p className="text-lg text-foreground/70 max-w-xl">From students to businesses, we've got the tools you need</p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Large Card - Spans 2 columns */}
            <Card className="md:col-span-2 md:row-span-2 p-10 bg-gradient-to-br from-primary/10 to-card border-primary/20 hover:border-primary/40 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
              <div className="relative">
                <Shield className="h-12 w-12 text-primary mb-6" />
                <h3 className="text-3xl font-bold mb-4">Premium Savings</h3>
                <p className="text-foreground/70 text-lg mb-6">Earn up to 4.5% APY with our high-yield savings accounts. Your money works harder for you.</p>
                <Button variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>

            {/* Small Cards */}
            <Card className="p-8 bg-card/80 backdrop-blur border-primary/10 hover:border-primary/30 transition-all">
              <CreditCard className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Credit Cards</h3>
              <p className="text-sm text-foreground/60">Cashback & rewards on every purchase</p>
            </Card>

            <Card className="p-8 bg-card/80 backdrop-blur border-primary/10 hover:border-primary/30 transition-all">
              <Smartphone className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Mobile First</h3>
              <p className="text-sm text-foreground/60">Bank on the go with our app</p>
            </Card>

            <Card className="md:col-span-2 p-8 bg-card/80 backdrop-blur border-primary/10 hover:border-primary/30 transition-all">
              <PiggyBank className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Smart Investments</h3>
              <p className="text-sm text-foreground/60">Automated portfolio management with AI-powered recommendations</p>
            </Card>

            <Card className="p-8 bg-card/80 backdrop-blur border-primary/10 hover:border-primary/30 transition-all">
              <Users className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">24/7 Support</h3>
              <p className="text-sm text-foreground/60">Always here to help</p>
            </Card>
          </div>
        </div>
      </section>


      {/* Unique CTA Section - Side by Side */}
      <section className="relative py-0 overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Left - Dark CTA */}
          <div className="bg-foreground text-background p-16 md:p-20 flex flex-col justify-center">
            <div className="max-w-lg">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Start Your Journey</h2>
              <p className="text-lg mb-8 opacity-80">
                Join 500,000+ users building their financial future with Capital City Bank
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-10 py-7 w-full md:w-auto"
                onClick={() => router.push('/signup')}
              >
                Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-sm mt-4 opacity-60">No credit card required • Free forever</p>
            </div>
          </div>

          {/* Right - Stats Grid */}
          <div className="bg-gradient-to-br from-primary/10 to-background p-16 md:p-20 flex items-center">
            <div className="grid grid-cols-2 gap-8 w-full">
              <div className="text-center p-6 bg-card/50 backdrop-blur rounded-2xl border border-primary/20">
                <DollarSign className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-foreground mb-1">$2B+</div>
                <div className="text-sm text-foreground/60">Transaction Volume</div>
              </div>
              <div className="text-center p-6 bg-card/50 backdrop-blur rounded-2xl border border-primary/20">
                <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-foreground mb-1">500K+</div>
                <div className="text-sm text-foreground/60">Happy Users</div>
              </div>
              <div className="text-center p-6 bg-card/50 backdrop-blur rounded-2xl border border-primary/20">
                <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-foreground mb-1">99.9%</div>
                <div className="text-sm text-foreground/60">Uptime SLA</div>
              </div>
              <div className="text-center p-6 bg-card/50 backdrop-blur rounded-2xl border border-primary/20">
                <Star className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-foreground mb-1">4.9/5</div>
                <div className="text-sm text-foreground/60">User Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-12 md:grid-cols-4 py-16">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60"></div>
                <span className="text-xl font-bold text-foreground">Capital City Bank</span>
              </div>
              <p className="text-sm text-foreground/70">
                Modern digital banking for the modern world. Secure, fast, and reliable.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Products</h4>
              <ul className="space-y-3 text-sm text-foreground/70">
                <li><a href="#" className="hover:text-primary transition-colors">Checking</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Savings</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Credit Cards</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Investments</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-foreground/70">
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-3 text-sm text-foreground/70">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border py-8 text-center text-sm text-foreground/60">
            <p>&copy; 2026 Capital City Bank. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
