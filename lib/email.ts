import * as nodemailer from 'nodemailer'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

const emailConfig: EmailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_APP_PASSWORD || ''
  }
}

let transporter: nodemailer.Transporter | null = null

export function getEmailTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport(emailConfig)
  }
  return transporter
}

export async function sendEmail({
  to,
  subject,
  html,
  text
}: {
  to: string
  subject: string
  html: string
  text?: string
}) {
  const transporter = getEmailTransporter()
  
  try {
    const info = await transporter.sendMail({
      from: `"Capital City Bank" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text
    })
    
    console.log('Email sent successfully:', info.messageId)
    return info
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export async function verifyEmailConnection() {
  const transporter = getEmailTransporter()
  
  try {
    await transporter.verify()
    console.log('Email server connection verified successfully')
    return true
  } catch (error) {
    console.error('Email server connection failed:', error)
    return false
  }
}

export async function sendAccountBlockedEmail(userEmail: string, userName: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .alert-box { background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
          .button { display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Account Security Alert</h1>
          </div>
          <div class="content">
            <p>Dear ${userName},</p>
            
            <div class="alert-box">
              <strong>Your account has been temporarily suspended</strong>
            </div>
            
            <p>We have detected unusual activities on your account coming from multiple locations. As a security precaution, we have temporarily frozen your account to protect your funds.</p>
            
            <h3>What happened?</h3>
            <p>Our fraud detection system identified suspicious transaction patterns that may indicate unauthorized access to your account.</p>
            
            <h3>What should you do?</h3>
            <ul>
              <li>Contact our support team immediately</li>
              <li>Verify your recent transactions</li>
              <li>Update your account security settings</li>
              <li>Do not share your account credentials with anyone</li>
            </ul>
            
            <p>
              <a href="mailto:support@capitalcitybank.com" class="button">Contact Support</a>
            </p>
            
            <p><strong>Support Contact Information:</strong><br>
            Email: support@capitalcitybank.com<br>
            Phone: 1-800-CAPITAL (1-800-227-4825)<br>
            Available 24/7</p>
            
            <p>If you did not authorize these transactions, please contact us immediately.</p>
            
            <p>Best regards,<br>
            <strong>Capital City Bank Security Team</strong></p>
          </div>
          <div class="footer">
            <p>© 2026 Capital City Bank. All rights reserved.<br>
            This is an automated security notification. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
    ACCOUNT SECURITY ALERT
    
    Dear ${userName},
    
    Your account has been temporarily suspended.
    
    We have detected unusual activities on your account coming from multiple locations. As a security precaution, we have temporarily frozen your account to protect your funds.
    
    What happened?
    Our fraud detection system identified suspicious transaction patterns that may indicate unauthorized access to your account.
    
    What should you do?
    - Contact our support team immediately
    - Verify your recent transactions
    - Update your account security settings
    - Do not share your account credentials with anyone
    
    Support Contact Information:
    Email: support@capitalcitybank.com
    Phone: 1-800-CAPITAL (1-800-227-4825)
    Available 24/7
    
    If you did not authorize these transactions, please contact us immediately.
    
    Best regards,
    Capital City Bank Security Team
    
    © 2026 Capital City Bank. All rights reserved.
  `

  return sendEmail({
    to: userEmail,
    subject: '⚠️ Security Alert: Your Account Has Been Suspended',
    html,
    text
  })
}
