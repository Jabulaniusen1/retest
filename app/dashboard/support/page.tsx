'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Mail, Phone, MessageSquare, HelpCircle, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface FAQ {
  question: string
  answer: string
  category: string
}

export default function SupportPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: ''
  })
  const [sending, setSending] = useState(false)

  const faqs: FAQ[] = [
    {
      category: 'Account',
      question: 'How do I create a new account?',
      answer: 'You can create a new account from your dashboard by clicking on the "Create Account" button. Choose your account type (Checking, Savings, or Credit) and follow the prompts.'
    },
    {
      category: 'Account',
      question: 'How do I close my account?',
      answer: 'To close an account, please contact our support team via email at capitalcitybankorg@gmail.com  or call us. We\'ll guide you through the process and ensure all pending transactions are settled.'
    },
    {
      category: 'Transfers',
      question: 'What are the transfer fees?',
      answer: 'We charge a 0.5% fee on all transfers. Internal transfers between your own accounts, local transfers, and international wire transfers all have the same fee structure.'
    },
    {
      category: 'Transfers',
      question: 'How long do transfers take?',
      answer: 'Internal transfers are instant. Local transfers typically take 1-2 business days. International wire transfers can take 3-5 business days depending on the destination country.'
    },
    {
      category: 'Security',
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page. Enter your email address and we\'ll send you a password reset link. Follow the instructions in the email to create a new password.'
    },
    {
      category: 'Security',
      question: 'Is my money safe?',
      answer: 'Yes, your money is protected by industry-standard encryption and security measures. We use bank-level security protocols and your deposits are insured.'
    },
    {
      category: 'Cards',
      question: 'How do I request a new card?',
      answer: 'Go to the Cards section in your dashboard and click "Request New Card". Choose between physical debit cards or virtual cards for online purchases.'
    },
    {
      category: 'Cards',
      question: 'What should I do if my card is lost or stolen?',
      answer: 'Immediately lock your card from the Cards section in your dashboard, or contact our 24/7 support line. We\'ll help you secure your account and issue a replacement card.'
    },
    {
      category: 'KYC',
      question: 'Why do I need to complete KYC verification?',
      answer: 'KYC (Know Your Customer) verification is required by law to prevent fraud and money laundering. It\'s necessary for certain features like international transfers and higher transaction limits.'
    },
    {
      category: 'KYC',
      question: 'What documents do I need for KYC?',
      answer: 'You\'ll need a government-issued ID (passport, driver\'s license, or national ID card) and proof of address (utility bill or bank statement from the last 3 months).'
    }
  ]

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const categories = Array.from(new Set(faqs.map(faq => faq.category)))

  const handleSubmitContact = async () => {
    if (!contactForm.subject || !contactForm.message) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      })
      return
    }

    try {
      setSending(true)
      // Simulate sending
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast({
        title: 'Message Sent',
        description: 'We\'ll get back to you within 24 hours'
      })
      
      setContactForm({ subject: '', message: '' })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/dashboard')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <HelpCircle className="h-6 w-6 md:h-8 md:w-8" />
          Help & Support
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Get help with your account and banking needs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Email Support */}
        <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 border-0 text-white">
          <Mail className="h-8 w-8 mb-3" />
          <h3 className="text-lg font-semibold mb-2">Email Support</h3>
          <p className="text-sm text-purple-100 mb-4">
            We'll respond within 24 hours
          </p>
          <a href="mailto:capitalcitybankorg@gmail.com " className="text-sm font-medium underline">
            capitalcitybankorg@gmail.com 
          </a>
        </Card>

        {/* Phone Support */}
        <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
          <Phone className="h-8 w-8 mb-3" />
          <h3 className="text-lg font-semibold mb-2">Phone Support</h3>
          <p className="text-sm text-blue-100 mb-4">
            Available 24/7
          </p>
          <a href="tel:+1-800-CAPITAL" className="text-sm font-medium underline">
            +1 (800) CAPITAL
          </a>
        </Card>

        {/* Live Chat */}
        <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 border-0 text-white">
          <MessageSquare className="h-8 w-8 mb-3" />
          <h3 className="text-lg font-semibold mb-2">Contact Form</h3>
          <p className="text-sm text-green-100 mb-4">
            Send us a message
          </p>
          <a href="#contact-form" className="text-sm font-medium underline">
            Fill out form below
          </a>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
        
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <Button
              key={category}
              variant="outline"
              size="sm"
              onClick={() => setSearchTerm(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filteredFAQs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No FAQs found. Try a different search term.
            </p>
          ) : (
            filteredFAQs.map((faq, index) => (
              <Card
                key={index}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {faq.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground">{faq.question}</h3>
                    {expandedFAQ === index && (
                      <p className="text-sm text-muted-foreground mt-2">{faq.answer}</p>
                    )}
                  </div>
                  {expandedFAQ === index ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>

      {/* Contact Form */}
      <Card className="p-6" id="contact-form">
        <h2 className="text-xl font-bold text-foreground mb-4">Send Us a Message</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Can't find what you're looking for? Send us a message and we'll get back to you.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Subject
            </label>
            <Input
              value={contactForm.subject}
              onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
              placeholder="What do you need help with?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Message
            </label>
            <Textarea
              value={contactForm.message}
              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              placeholder="Describe your issue or question in detail..."
              rows={6}
            />
          </div>

          <Button onClick={handleSubmitContact} disabled={sending} className="w-full md:w-auto">
            <Mail className="mr-2 h-4 w-4" />
            {sending ? 'Sending...' : 'Send Message'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
