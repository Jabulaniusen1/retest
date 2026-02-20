'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TermsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
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
            <FileText className="h-8 w-8 md:h-10 md:w-10" />
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: February 20, 2026
          </p>
        </div>

        <Card className="p-6 md:p-8">
          <div className="prose prose-sm md:prose-base max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-3">1. Acceptance of Terms</h2>
              <p className="text-foreground/80 mb-4">
                By accessing and using Capital City Bank's services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-3">2. Account Registration</h2>
              <p className="text-foreground/80 mb-4">
                To use our services, you must:
              </p>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2 mb-4">
                <li>Be at least 18 years of age</li>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-3">3. Account Types and Services</h2>
              <p className="text-foreground/80 mb-4">
                Capital City Bank offers various account types including:
              </p>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2 mb-4">
                <li><strong>Checking Accounts:</strong> For daily transactions with no minimum balance requirement</li>
                <li><strong>Savings Accounts:</strong> High-yield accounts with competitive interest rates</li>
                <li><strong>Credit Accounts:</strong> Subject to credit approval and KYC verification</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-3">4. Fees and Charges</h2>
              <p className="text-foreground/80 mb-4">
                Our fee structure includes:
              </p>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2 mb-4">
                <li>Transfer fee: 0.5% of transaction amount</li>
                <li>International wire transfer fees may apply</li>
                <li>No monthly maintenance fees for standard accounts</li>
                <li>ATM fees may apply when using non-network ATMs</li>
                <li>Overdraft fees: $35 per occurrence</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-3">5. Transaction Limits</h2>
              <p className="text-foreground/80 mb-4">
                To ensure security and comply with regulations:
              </p>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2 mb-4">
                <li>Daily transfer limits apply based on account type and verification status</li>
                <li>International transfers require KYC verification</li>
                <li>We reserve the right to decline or reverse suspicious transactions</li>
                <li>Higher limits available upon request and approval</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-3">6. Security and Fraud Prevention</h2>
              <p className="text-foreground/80 mb-4">
                You agree to:
              </p>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2 mb-4">
                <li>Keep your login credentials confidential</li>
                <li>Use strong, unique passwords</li>
                <li>Report suspicious activity immediately</li>
                <li>Not share your account access with others</li>
                <li>Comply with our security recommendations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-3">7. KYC and Compliance</h2>
              <p className="text-foreground/80 mb-4">
                We are required by law to verify customer identities. You agree to:
              </p>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2 mb-4">
                <li>Provide accurate identification documents</li>
                <li>Complete KYC verification when requested</li>
                <li>Update your information if it changes</li>
                <li>Cooperate with compliance investigations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-3">8. Prohibited Activities</h2>
              <p className="text-foreground/80 mb-4">
                You may not use our services for:
              </p>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2 mb-4">
                <li>Illegal activities or transactions</li>
                <li>Money laundering or terrorist financing</li>
                <li>Fraud or deceptive practices</li>
                <li>Violating any applicable laws or regulations</li>
                <li>Interfering with our systems or security</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-3">9. Account Suspension and Termination</h2>
              <p className="text-foreground/80 mb-4">
                We reserve the right to suspend or terminate your account if:
              </p>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2 mb-4">
                <li>You violate these terms of service</li>
                <li>We detect suspicious or fraudulent activity</li>
                <li>Required by law or regulation</li>
                <li>You request account closure</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-3">10. Liability and Disclaimers</h2>
              <p className="text-foreground/80 mb-4">
                Capital City Bank is not liable for:
              </p>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2 mb-4">
                <li>Losses due to unauthorized access resulting from your negligence</li>
                <li>Service interruptions due to maintenance or technical issues</li>
                <li>Third-party service failures</li>
                <li>Market fluctuations affecting investment products</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-3">11. Changes to Terms</h2>
              <p className="text-foreground/80 mb-4">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Continued use of our services constitutes acceptance of modified terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-3">12. Governing Law</h2>
              <p className="text-foreground/80 mb-4">
                These terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-3">13. Contact Information</h2>
              <p className="text-foreground/80 mb-4">
                For questions about these terms, please contact us:
              </p>
              <ul className="list-none text-foreground/80 space-y-2">
                <li>Email: themarkhandle@gmail.com</li>
                <li>Phone: +1 (800) CAPITAL</li>
                <li>Address: Capital City Bank, 123 Financial District, New York, NY 10001</li>
              </ul>
            </section>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <Button onClick={() => router.push('/')}>
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
