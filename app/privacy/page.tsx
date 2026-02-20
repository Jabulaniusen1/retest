'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PrivacyPage() {
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
            <Shield className="h-8 w-8 md:h-10 md:w-10" />
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: February 20, 2026
          </p>
        </div>

        <Card className="p-6 md:p-8">
          <div className="prose prose-sm md:prose-base max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-3">1. Introduction</h2>
              <p className="text-foreground/80 mb-4">
                Capital City Bank ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our banking services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-3">2. Information We Collect</h2>
              <p className="text-foreground/80 mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2 mb-4">
                <li><strong>Personal Information:</strong> Name, email address, phone number, date of birth, address</li>
                <li><strong>Financial Information:</strong> Account numbers, transaction history, payment information</li>
                <li><strong>Identification Documents:</strong> Government-issued ID, passport, driver's license</li>
                <li><strong>Usage Data:</strong> IP address, browser type, device information, access times</li>
                <li><strong>Communication Data:</strong> Support tickets, emails, chat messages</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-3">3. How We Use Your Information</h2>
              <p className="text-foreground/80 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2 mb-4">
                <li>Provide, maintain, and improve our banking services</li>
                <li>Process transactions and send related information</li>
                <li>Verify your identity and prevent fraud</li>
                <li>Comply with legal and regulatory requirements</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Analyze usage patterns and optimize user experience</li>
                <li>Detect and prevent security incidents</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-3">4. Information Sharing and Disclosure</h2>
              <p className="text-foreground/80 mb-4">
                We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2 mb-4">
                <li><strong>With Your Consent:</strong> When you explicitly authorize us to share information</li>
                <li><strong>Service Providers:</strong> Third-party vendors who perform services on our behalf</li>
                <li><strong>Legal Requirements:</strong> When required by law, subpoena, or court order</li>
                <li><strong>Fraud Prevention:</strong> To protect against fraud and security threats</li>
                <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
              </ul>
              <p className="text-foreground/80 mb-4">
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-3">5. Data Security</h2>
              <p className="text-foreground/80 mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2 mb-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure socket layer (SSL) technology</li>
                <li>Regular security audits and penetration testing</li>
                <li>Access controls and authentication requirements</li>
                <li>Employee training on data protection</li>
                <li>Incident response procedures</li>
              </ul>
              <p className="text-foreground/80 mb-4">
                However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-3">6. Data Retention</h2>
              <p className="text-foreground/80 mb-4">
                We retain your information for as long as necessary to:
              </p>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2 mb-4">
                <li>Provide our services to you</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Maintain business records as required by law</li>
              </ul>
              <p className="text-foreground/80 mb-4">
                Financial records are typically retained for 7 years in accordance with banking regulations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-3">7. Your Privacy Rights</h2>
              <p className="text-foreground/80 mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2 mb-4">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your information (subject to legal requirements)</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Opt-out:</strong> Opt-out of marketing communications</li>
                <li><strong>Object:</strong> Object to processing of your information</li>
              </ul>
              <p className="text-foreground/80 mb-4">
                To exercise these rights, contact us at privacy@capitalbank.com.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-3">8. Cookies and Tracking Technologies</h2>
              <p className="text-foreground/80 mb-4">
                We use cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2 mb-4">
                <li>Remember your preferences and settings</li>
                <li>Understand how you use our services</li>
                <li>Improve our services and user experience</li>
                <li>Provide security features</li>
              </ul>
              <p className="text-foreground/80 mb-4">
                You can control cookies through your browser settings, but disabling cookies may affect functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-3">9. Third-Party Links</h2>
              <p className="text-foreground/80 mb-4">
                Our services may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-3">10. Children's Privacy</h2>
              <p className="text-foreground/80 mb-4">
                Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child, we will take steps to delete it.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-3">11. International Data Transfers</h2>
              <p className="text-foreground/80 mb-4">
                Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-3">12. Changes to This Privacy Policy</h2>
              <p className="text-foreground/80 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Significant changes will be communicated via email or prominent notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-3">13. Contact Us</h2>
              <p className="text-foreground/80 mb-4">
                If you have questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <ul className="list-none text-foreground/80 space-y-2">
                <li>Email: privacy@capitalbank.com</li>
                <li>Phone: +1 (800) CAPITAL</li>
                <li>Mail: Privacy Officer, Capital City Bank, 123 Financial District, New York, NY 10001</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-3">14. California Privacy Rights</h2>
              <p className="text-foreground/80 mb-4">
                California residents have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information is collected, sold, or disclosed, and the right to opt-out of the sale of personal information.
              </p>
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
