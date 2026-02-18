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
