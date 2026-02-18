import { sendEmail, verifyEmailConnection } from './email'
import { 
  transactionEmailTemplate, 
  kycStatusEmailTemplate, 
  passwordResetEmailTemplate,
  welcomeEmailTemplate 
} from './email-templates'
import { createClient } from './supabase/client'

export class EmailNotificationService {
  private static instance: EmailNotificationService
  private isInitialized = false

  static getInstance(): EmailNotificationService {
    if (!EmailNotificationService.instance) {
      EmailNotificationService.instance = new EmailNotificationService()
    }
    return EmailNotificationService.instance
  }

  async initialize() {
    if (this.isInitialized) return
    
    const isConnected = await verifyEmailConnection()
    if (!isConnected) {
      console.warn('Email service could not be initialized. Check your SMTP configuration.')
    } else {
      console.log('Email service initialized successfully')
      this.isInitialized = true
    }
  }

  private async getUserEmail(userId: string): Promise<string> {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.admin.getUserById(userId)
    
    if (error || !user?.email) {
      throw new Error(`Could not get email for user ${userId}`)
    }
    
    return user.email
  }

  async sendTransactionNotification({
    userId,
    transactionType,
    amount,
    recipientName,
    accountNumber,
    transactionDate,
    referenceNumber
  }: {
    userId: string
    transactionType: 'payment' | 'deposit' | 'transfer'
    amount: string
    recipientName?: string
    accountNumber: string
    transactionDate: string
    referenceNumber: string
  }) {
    try {
      const userEmail = await this.getUserEmail(userId)
      const supabase = createClient()
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single()

      const template = transactionEmailTemplate({
        userName: profile?.full_name || 'Valued Customer',
        transactionType,
        amount,
        recipientName,
        accountNumber,
        transactionDate,
        referenceNumber
      })

      await sendEmail({
        to: userEmail,
        subject: template.subject,
        html: template.html,
        text: template.text
      })

      console.log(`Transaction notification sent to ${userEmail}`)
    } catch (error) {
      console.error('Failed to send transaction notification:', error)
    }
  }

  async sendKYCStatusNotification({
    userId,
    verificationType,
    status,
    rejectionReason,
    nextSteps
  }: {
    userId: string
    verificationType: string
    status: 'approved' | 'rejected' | 'under_review'
    rejectionReason?: string
    nextSteps?: string
  }) {
    try {
      const userEmail = await this.getUserEmail(userId)
      const supabase = createClient()
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single()

      const template = kycStatusEmailTemplate({
        userName: profile?.full_name || 'Valued Customer',
        verificationType,
        status,
        rejectionReason,
        nextSteps
      })

      await sendEmail({
        to: userEmail,
        subject: template.subject,
        html: template.html,
        text: template.text
      })

      console.log(`KYC status notification sent to ${userEmail}`)
    } catch (error) {
      console.error('Failed to send KYC status notification:', error)
    }
  }

  async sendPasswordResetEmail({
    userId,
    resetLink,
    expiryTime = '1 hour'
  }: {
    userId: string
    resetLink: string
    expiryTime?: string
  }) {
    try {
      const userEmail = await this.getUserEmail(userId)
      const supabase = createClient()
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single()

      const template = passwordResetEmailTemplate({
        userName: profile?.full_name || 'Valued Customer',
        resetLink,
        expiryTime
      })

      await sendEmail({
        to: userEmail,
        subject: template.subject,
        html: template.html,
        text: template.text
      })

      console.log(`Password reset email sent to ${userEmail}`)
    } catch (error) {
      console.error('Failed to send password reset email:', error)
    }
  }

  async sendWelcomeEmail({
    userId,
    accountNumber
  }: {
    userId: string
    accountNumber: string
  }) {
    try {
      const userEmail = await this.getUserEmail(userId)
      const supabase = createClient()
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single()

      const template = welcomeEmailTemplate({
        userName: profile?.full_name || 'Valued Customer',
        accountNumber
      })

      await sendEmail({
        to: userEmail,
        subject: template.subject,
        html: template.html,
        text: template.text
      })

      console.log(`Welcome email sent to ${userEmail}`)
    } catch (error) {
      console.error('Failed to send welcome email:', error)
    }
  }

  async sendLowBalanceAlert({
    userId,
    accountNumber,
    currentBalance,
    threshold
  }: {
    userId: string
    accountNumber: string
    currentBalance: string
    threshold: string
  }) {
    try {
      const userEmail = await this.getUserEmail(userId)
      const supabase = createClient()
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single()

      const template = {
        subject: 'Low Balance Alert - Capital City Bank',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Low Balance Alert</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
              .alert-box { background: #fef2f2; border: 1px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
              .balance { font-size: 32px; font-weight: bold; color: #dc2626; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Capital City Bank</h1>
                <p>Low Balance Alert</p>
              </div>
              <div class="content">
                <h2>Hello ${profile?.full_name || 'Valued Customer'},</h2>
                
                <div class="alert-box">
                  <div style="font-size: 48px; margin-bottom: 10px;">⚠️</div>
                  <h3>Low Balance Warning</h3>
                  <p>Your account balance has fallen below the alert threshold.</p>
                </div>
                
                <div class="balance">
                  Current Balance: $${currentBalance}
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Account:</strong> ****${accountNumber.slice(-4)}</p>
                  <p><strong>Alert Threshold:</strong> $${threshold}</p>
                  <p><strong>Current Balance:</strong> $${currentBalance}</p>
                </div>
                
                <p>To avoid overdraft fees, please consider adding funds to your account soon.</p>
                
                <div class="footer">
                  <p>This is an automated message from Capital City Bank.</p>
                  <p>Please do not reply to this email.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Capital City Bank - Low Balance Alert
          
          Hello ${profile?.full_name || 'Valued Customer'},
          
          ⚠️ Low Balance Warning
          Your account balance has fallen below the alert threshold.
          
          Account: ****${accountNumber.slice(-4)}
          Alert Threshold: $${threshold}
          Current Balance: $${currentBalance}
          
          To avoid overdraft fees, please consider adding funds to your account soon.
          
          This is an automated message from Capital City Bank. Please do not reply to this email.
        `
      }

      await sendEmail({
        to: userEmail,
        subject: template.subject,
        html: template.html,
        text: template.text
      })

      console.log(`Low balance alert sent to ${userEmail}`)
    } catch (error) {
      console.error('Failed to send low balance alert:', error)
    }
  }
}

export const emailService = EmailNotificationService.getInstance()
