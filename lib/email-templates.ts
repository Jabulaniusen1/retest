export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export function transactionEmailTemplate({
  userName,
  transactionType,
  amount,
  recipientName,
  accountNumber,
  transactionDate,
  referenceNumber
}: {
  userName: string
  transactionType: 'payment' | 'deposit' | 'transfer'
  amount: string
  recipientName?: string
  accountNumber: string
  transactionDate: string
  referenceNumber: string
}): EmailTemplate {
  const isDebit = transactionType === 'payment' || transactionType === 'transfer'
  const amountColor = isDebit ? '#dc2626' : '#16a34a'
  const amountPrefix = isDebit ? '-' : '+'
  
  return {
    subject: `Transaction Alert: ${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)} of ${amount}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Transaction Alert</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .amount { font-size: 32px; font-weight: bold; color: ${amountColor}; margin: 20px 0; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-row:last-child { border-bottom: none; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .security-notice { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Capital City Bank</h1>
            <p>Transaction Alert</p>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>We're notifying you of a recent transaction on your account.</p>
            
            <div class="amount">
              ${amountPrefix}${amount}
            </div>
            
            <div class="details">
              <div class="detail-row">
                <span><strong>Transaction Type:</strong></span>
                <span>${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}</span>
              </div>
              <div class="detail-row">
                <span><strong>Account:</strong></span>
                <span>****${accountNumber.slice(-4)}</span>
              </div>
              ${recipientName ? `
              <div class="detail-row">
                <span><strong>Recipient:</strong></span>
                <span>${recipientName}</span>
              </div>
              ` : ''}
              <div class="detail-row">
                <span><strong>Date:</strong></span>
                <span>${transactionDate}</span>
              </div>
              <div class="detail-row">
                <span><strong>Reference:</strong></span>
                <span>${referenceNumber}</span>
              </div>
            </div>
            
            <div class="security-notice">
              <strong>Security Notice:</strong> If you didn't authorize this transaction, please contact our support team immediately.
            </div>
            
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
      Capital City Bank - Transaction Alert
      
      Hello ${userName},
      
      We're notifying you of a recent transaction on your account.
      
      Transaction Details:
      - Type: ${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}
      - Amount: ${amountPrefix}${amount}
      - Account: ****${accountNumber.slice(-4)}
      ${recipientName ? `- Recipient: ${recipientName}` : ''}
      - Date: ${transactionDate}
      - Reference: ${referenceNumber}
      
      Security Notice: If you didn't authorize this transaction, please contact our support team immediately.
      
      This is an automated message from Capital City Bank. Please do not reply to this email.
    `
  }
}

export function kycStatusEmailTemplate({
  userName,
  verificationType,
  status,
  rejectionReason,
  nextSteps
}: {
  userName: string
  verificationType: string
  status: 'approved' | 'rejected' | 'under_review' | 'pending'
  rejectionReason?: string
  nextSteps?: string
}): EmailTemplate {
  const statusColors = {
    approved: '#16a34a',
    rejected: '#dc2626',
    under_review: '#f59e0b',
    pending: '#6b7280'
  }
  
  const statusIcons = {
    approved: '✅',
    rejected: '❌',
    under_review: '⏳',
    pending: '📋'
  }
  
  return {
    subject: `KYC Verification Update: ${verificationType} - ${status.replace('_', ' ').toUpperCase()}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>KYC Verification Update</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .status { font-size: 24px; font-weight: bold; color: ${statusColors[status]}; margin: 20px 0; text-align: center; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .approved { background: #dcfce7; border: 1px solid #16a34a; color: #166534; }
          .rejected { background: #fef2f2; border: 1px solid #dc2626; color: #991b1b; }
          .under_review { background: #fef3c7; border: 1px solid #f59e0b; color: #92400e; }
          .pending { background: #f3f4f6; border: 1px solid #6b7280; color: #374151; }
          .status-box { padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Capital City Bank</h1>
            <p>KYC Verification Update</p>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>We have an update on your ${verificationType} verification.</p>
            
            <div class="status-box ${status}">
              <div style="font-size: 48px; margin-bottom: 10px;">${statusIcons[status]}</div>
              <div style="font-size: 20px; font-weight: bold;">
                Status: ${status.replace('_', ' ').toUpperCase()}
              </div>
            </div>
            
            ${status === 'approved' ? `
              <div class="details approved">
                <h3>🎉 Verification Approved!</h3>
                <p>Your ${verificationType} verification has been successfully approved. You now have access to enhanced banking features and higher transaction limits.</p>
              </div>
            ` : ''}
            
            ${status === 'rejected' ? `
              <div class="details rejected">
                <h3>❌ Verification Rejected</h3>
                <p>Unfortunately, your ${verificationType} verification could not be approved at this time.</p>
                ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
                ${nextSteps ? `<p><strong>Next Steps:</strong> ${nextSteps}</p>` : ''}
              </div>
            ` : ''}
            
            ${status === 'under_review' ? `
              <div class="details under_review">
                <h3>⏳ Under Review</h3>
                <p>Your ${verificationType} verification is currently under review by our verification team. This process typically takes 1-3 business days.</p>
                <p>We will notify you as soon as there's an update on your verification status.</p>
              </div>
            ` : ''}
            
            ${status === 'pending' ? `
              <div class="details pending">
                <h3>📋 Verification Pending</h3>
                <p>Your ${verificationType} verification has been submitted and is waiting to be processed by our verification team.</p>
                <p>You will receive an update once the review process begins.</p>
              </div>
            ` : ''}
            
            <div class="footer">
              <p>Thank you for choosing Capital City Bank.</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Capital City Bank - KYC Verification Update
      
      Hello ${userName},
      
      We have an update on your ${verificationType} verification.
      
      Status: ${status.replace('_', ' ').toUpperCase()}
      
      ${status === 'approved' ? `
      🎉 Verification Approved!
      Your ${verificationType} verification has been successfully approved. You now have access to enhanced banking features and higher transaction limits.
      ` : ''}
      
      ${status === 'rejected' ? `
      ❌ Verification Rejected
      Unfortunately, your ${verificationType} verification could not be approved at this time.
      ${rejectionReason ? `Reason: ${rejectionReason}` : ''}
      ${nextSteps ? `Next Steps: ${nextSteps}` : ''}
      ` : ''}
      
      ${status === 'under_review' ? `
      ⏳ Under Review
      Your ${verificationType} verification is currently under review by our verification team. This process typically takes 1-3 business days.
      We will notify you as soon as there's an update on your verification status.
      ` : ''}
      
      ${status === 'pending' ? `
      📋 Verification Pending
      Your ${verificationType} verification has been submitted and is waiting to be processed by our verification team.
      You will receive an update once the review process begins.
      ` : ''}
      
      Thank you for choosing Capital City Bank.
      If you have any questions, please contact our support team.
    `
  }
}

export function passwordResetEmailTemplate({
  userName,
  resetLink,
  expiryTime
}: {
  userName: string
  resetLink: string
  expiryTime: string
}): EmailTemplate {
  return {
    subject: 'Password Reset Request - Capital City Bank',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .reset-button { display: inline-block; background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .reset-button:hover { background: #2563eb; }
          .security-notice { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Capital City Bank</h1>
            <p>Password Reset Request</p>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>We received a request to reset your password for your Capital City Bank account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="reset-button">Reset Password</a>
            </div>
            
            <p><strong>This link will expire in ${expiryTime}.</strong></p>
            
            <div class="security-notice">
              <strong>Security Notice:</strong> If you didn't request a password reset, please ignore this email or contact our support team immediately.
            </div>
            
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
      Capital City Bank - Password Reset Request
      
      Hello ${userName},
      
      We received a request to reset your password for your Capital City Bank account.
      
      Click the link below to reset your password:
      ${resetLink}
      
      This link will expire in ${expiryTime}.
      
      Security Notice: If you didn't request a password reset, please ignore this email or contact our support team immediately.
      
      This is an automated message from Capital City Bank. Please do not reply to this email.
    `
  }
}

export function welcomeEmailTemplate({
  userName,
  accountNumber
}: {
  userName: string
  accountNumber: string
}): EmailTemplate {
  return {
    subject: 'Welcome to Capital City Bank!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Capital City Bank</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .welcome-box { background: #dcfce7; border: 1px solid #16a34a; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
          .next-steps { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .step { display: flex; align-items: center; margin: 15px 0; }
          .step-number { background: #3b82f6; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Capital City Bank</h1>
            <p>Welcome to Your New Account!</p>
          </div>
          <div class="content">
            <div class="welcome-box">
              <h2>🎉 Welcome, ${userName}!</h2>
              <p>Thank you for choosing Capital City Bank. Your account has been successfully created and is ready to use.</p>
            </div>
            
            <h3>Your Account Details:</h3>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Account Number:</strong> ****${accountNumber.slice(-4)}</p>
              <p><strong>Account Type:</strong> Checking Account</p>
              <p><strong>Status:</strong> Active</p>
            </div>
            
            <h3>Next Steps:</h3>
            <div class="next-steps">
              <div class="step">
                <div class="step-number">1</div>
                <div>Complete your profile information in Settings</div>
              </div>
              <div class="step">
                <div class="step-number">2</div>
                <div>Complete KYC verification to unlock premium features</div>
              </div>
              <div class="step">
                <div class="step-number">3</div>
                <div>Explore different account types (Savings, Investment, Business)</div>
              </div>
              <div class="step">
                <div class="step-number">4</div>
                <div>Set up your debit card and start banking</div>
              </div>
            </div>
            
            <div class="footer">
              <p>We're excited to have you as a customer!</p>
              <p>If you have any questions, our support team is here to help.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Capital City Bank - Welcome to Your New Account!
      
      🎉 Welcome, ${userName}!
      
      Thank you for choosing Capital City Bank. Your account has been successfully created and is ready to use.
      
      Your Account Details:
      - Account Number: ****${accountNumber.slice(-4)}
      - Account Type: Checking Account
      - Status: Active
      
      Next Steps:
      1. Complete your profile information in Settings
      2. Complete KYC verification to unlock premium features
      3. Explore different account types (Savings, Investment, Business)
      4. Set up your debit card and start banking
      
      We're excited to have you as a customer!
      If you have any questions, our support team is here to help.
    `
  }
}
