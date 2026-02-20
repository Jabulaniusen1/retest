export interface User {
  id: string
  email: string
  name: string
  accountNumber: string
  password?: string
  createdAt: Date
}

export interface Account {
  id: string
  user_id: string
  account_number: string
  account_type_id: string
  balance: number
  currency: string
  status: 'active' | 'frozen' | 'closed'
  nickname?: string
  routing_number: string
  swift_code: string
  created_at: string
  updated_at: string
  account_type?: AccountType
}

export interface Transaction {
  id: string
  from_account_id: string
  to_account_id?: string
  transaction_type: 'transfer' | 'deposit' | 'withdrawal' | 'payment'
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  description?: string
  recipient_name?: string
  category?: string
  reference_number?: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  full_name: string
  phone?: string
  date_of_birth?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface AccountType {
  id: string
  name: string
  display_name: string
  description?: string
  min_balance: number
  max_balance?: number
  interest_rate: number
  requires_kyc: boolean
  is_active: boolean
  created_at: string
}

export interface KYCVerification {
  id: string
  user_id: string
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  verification_type: 'identity' | 'address' | 'income' | 'business'
  identity_document_url?: string
  address_document_url?: string
  income_document_url?: string
  business_document_url?: string
  full_name?: string
  date_of_birth?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  phone?: string
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
  rejection_reason?: string
  notes?: string
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}

export interface CryptoBalance {
  id: string
  user_id: string
  currency: 'BTC' | 'ETH' | 'USDT' | 'BNB' | 'SOL' | 'XRP' | 'ADA' | 'DOGE'
  balance: number
  wallet_address?: string
  created_at: string
  updated_at: string
}

export interface CryptoTransaction {
  id: string
  user_id: string
  currency: string
  type: 'buy' | 'sell' | 'send' | 'receive'
  amount: number
  usd_value?: number
  to_address?: string
  from_address?: string
  transaction_hash?: string
  status: 'pending' | 'completed' | 'failed'
  created_at: string
}

export interface Loan {
  id: string
  user_id: string
  loan_type: 'personal' | 'auto' | 'home' | 'student' | 'business'
  amount: number
  interest_rate: number
  term_months: number
  monthly_payment: number
  outstanding_balance: number
  status: 'pending' | 'approved' | 'active' | 'paid_off' | 'rejected' | 'defaulted'
  application_date: string
  approval_date?: string
  disbursement_date?: string
  next_payment_date?: string
  created_at: string
  updated_at: string
}

export interface LoanPayment {
  id: string
  loan_id: string
  amount: number
  principal_amount: number
  interest_amount: number
  payment_date: string
  status: 'pending' | 'completed' | 'failed'
}

export interface Grant {
  id: string
  user_id: string
  grant_type: 'education' | 'business' | 'housing' | 'emergency' | 'research'
  title: string
  description?: string
  amount: number
  status: 'pending' | 'approved' | 'disbursed' | 'rejected'
  application_date: string
  approval_date?: string
  disbursement_date?: string
  created_at: string
}

export interface TaxRefund {
  id: string
  user_id: string
  tax_year: number
  refund_amount: number
  filing_date?: string
  status: 'pending' | 'processing' | 'approved' | 'disbursed' | 'rejected'
  expected_date?: string
  disbursement_date?: string
  account_id?: string
  created_at: string
  updated_at: string
}

export interface VirtualCard {
  id: string
  user_id: string
  account_id?: string
  card_number: string
  card_holder_name: string
  expiry_month: number
  expiry_year: number
  cvv: string
  card_type: 'virtual' | 'physical'
  status: 'active' | 'frozen' | 'cancelled'
  spending_limit?: number
  merchant_category?: string
  created_at: string
  updated_at: string
}

export interface PaymentService {
  id: string
  user_id: string
  service_name: 'venmo' | 'paypal' | 'cashapp' | 'zelle' | 'wise' | 'revolut'
  account_identifier: string
  is_verified: boolean
  created_at: string
}

export interface FinancialInsight {
  id: string
  user_id: string
  insight_type: 'spending_pattern' | 'saving_opportunity' | 'budget_alert' | 'investment_tip' | 'unusual_activity'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  is_read: boolean
  created_at: string
}

export interface SpendingCategory {
  id: string
  user_id: string
  category: string
  month: string
  total_spent: number
  transaction_count: number
  created_at: string
}
