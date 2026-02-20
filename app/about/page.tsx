'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Building2, Users, Shield, TrendingUp, Globe, Award } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AboutPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3 mb-2">
            <Building2 className="h-8 w-8 md:h-10 md:w-10" />
            About Capital City Bank
          </h1>
          <p className="text-lg text-muted-foreground">
            Your trusted partner in modern banking
          </p>
        </div>

        {/* Hero Section */}
        <Card className="p-8 md:p-12 mb-8 bg-gradient-to-br from-primary/10 to-primary/5">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Banking Made Simple, Secure, and Smart
          </h2>
          <p className="text-foreground/80 text-lg mb-6">
            Capital City Bank is a modern digital banking platform designed to meet the financial needs of today's customers. We combine cutting-edge technology with traditional banking values to provide a seamless, secure, and personalized banking experience.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">500K+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">$2B+</div>
              <div className="text-sm text-muted-foreground">Assets Managed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">50+</div>
              <div className="text-sm text-muted-foreground">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
          </div>
        </Card>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Our Mission
            </h3>
            <p className="text-foreground/80">
              To empower individuals and businesses with innovative financial solutions that simplify banking, enhance financial wellness, and foster economic growth. We strive to make banking accessible, transparent, and rewarding for everyone.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              Our Vision
            </h3>
            <p className="text-foreground/80">
              To become the world's most trusted digital banking platform, setting new standards for customer experience, security, and innovation. We envision a future where banking is seamless, intelligent, and tailored to each customer's unique needs.
            </p>
          </Card>
        </div>

        {/* Core Values */}
        <Card className="p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Security First</h3>
              <p className="text-sm text-foreground/80">
                We employ bank-level encryption and multi-layered security protocols to protect your financial data and transactions.
              </p>
            </div>

            <div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Customer Centric</h3>
              <p className="text-sm text-foreground/80">
                Your needs drive our innovation. We listen, adapt, and continuously improve to deliver exceptional banking experiences.
              </p>
            </div>

            <div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Excellence</h3>
              <p className="text-sm text-foreground/80">
                We maintain the highest standards in everything we do, from product development to customer service.
              </p>
            </div>
          </div>
        </Card>

        {/* Services */}
        <Card className="p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Personal Banking</h3>
              <ul className="text-sm text-foreground/80 space-y-2">
                <li>• Checking and Savings Accounts</li>
                <li>• Debit and Virtual Cards</li>
                <li>• Instant Money Transfers</li>
                <li>• Mobile and Online Banking</li>
                <li>• Bill Payment Services</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Advanced Features</h3>
              <ul className="text-sm text-foreground/80 space-y-2">
                <li>• Cryptocurrency Wallet</li>
                <li>• Personal Loans</li>
                <li>• Government Grants & Tax Refunds</li>
                <li>• Financial Insights & Analytics</li>
                <li>• International Wire Transfers</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Why Choose Us */}
        <Card className="p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Why Choose Capital City Bank?</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">No Hidden Fees</h3>
                <p className="text-sm text-foreground/80">
                  Transparent pricing with no monthly maintenance fees on standard accounts.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Instant Transfers</h3>
                <p className="text-sm text-foreground/80">
                  Send money instantly between accounts or to other users with real-time processing.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">24/7 Support</h3>
                <p className="text-sm text-foreground/80">
                  Our dedicated support team is available around the clock to assist you.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Advanced Security</h3>
                <p className="text-sm text-foreground/80">
                  Multi-factor authentication, encryption, and fraud detection keep your money safe.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Modern Technology</h3>
                <p className="text-sm text-foreground/80">
                  Intuitive mobile and web apps with features like budgeting tools and spending insights.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Contact CTA */}
        <Card className="p-8 text-center bg-gradient-to-br from-primary to-primary/80 text-white">
          <h2 className="text-2xl font-bold mb-3">Ready to Get Started?</h2>
          <p className="mb-6 text-white/90">
            Join thousands of satisfied customers and experience modern banking today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => router.push('/signup')}
            >
              Open an Account
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => router.push('/dashboard/support')}
            >
              Contact Us
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
