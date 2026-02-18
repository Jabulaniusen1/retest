// Simple test script to verify email configuration
import { verifyEmailConnection } from './lib/email'

async function testEmailConnection() {
  console.log('Testing email connection...')
  
  try {
    const isConnected = await verifyEmailConnection()
    
    if (isConnected) {
      console.log('✅ Email service is configured correctly!')
      console.log('You can now send emails for:')
      console.log('  - Transaction notifications')
      console.log('  - KYC status updates')
      console.log('  - Welcome emails')
      console.log('  - Password resets')
    } else {
      console.log('❌ Email service configuration failed')
      console.log('Please check your .env.local file:')
      console.log('  EMAIL_USER=your-gmail@gmail.com')
      console.log('  EMAIL_APP_PASSWORD=bnki teez iwxe gdsh')
    }
  } catch (error) {
    console.error('❌ Error testing email connection:', error)
  }
}

// Run the test
testEmailConnection()
