-- ============================================================================
-- CAPITAL CITY BANK - COMPLETE DATABASE SCHEMA
-- ============================================================================
-- This migration sets up the entire database schema for the banking application
-- Run this on a fresh Supabase project to get everything working
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Account types table
CREATE TABLE public.account_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  min_balance DECIMAL(15,2) DEFAULT 0,
  max_balance DECIMAL(15,2),
  interest_rate DECIMAL(5,4) DEFAULT 0,
  requires_kyc BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Accounts table
CREATE TABLE public.accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_number TEXT UNIQUE NOT NULL,
  account_type_id UUID REFERENCES public.account_types(id) NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0 NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'closed')),
  nickname TEXT,
  routing_number TEXT UNIQUE NOT NULL,
  swift_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Cards table
CREATE TABLE public.cards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  card_number TEXT NOT NULL,
  card_type TEXT NOT NULL CHECK (card_type IN ('debit', 'credit')),
  expiry_date TEXT NOT NULL,
  cvv TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'locked', 'cancelled')),
  daily_limit DECIMAL(15,2) DEFAULT 5000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Transactions table
CREATE TABLE public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  from_account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  to_account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('transfer', 'deposit', 'withdrawal', 'payment')),
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  description TEXT,
  recipient_name TEXT,
  category TEXT,
  reference_number TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Beneficiaries table (saved recipients)
CREATE TABLE public.beneficiaries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bank_name TEXT,
  nickname TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('transaction', 'security', 'account', 'general')),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- KYC verifications table
CREATE TABLE public.kyc_verifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  verification_type TEXT NOT NULL CHECK (verification_type IN ('identity', 'address', 'income', 'business')),
  identity_document_url TEXT,
  address_document_url TEXT,
  income_document_url TEXT,
  business_document_url TEXT,
  full_name TEXT,
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'US',
  phone TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  notes TEXT,
  UNIQUE(user_id, verification_type)
);

-- ============================================================================
-- FINANCIAL SERVICES TABLES
-- ============================================================================

-- Crypto balances table
CREATE TABLE public.crypto_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  currency VARCHAR(10) NOT NULL,
  balance DECIMAL(20, 8) NOT NULL DEFAULT 0,
  wallet_address VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, currency)
);

-- Crypto transactions table
CREATE TABLE public.crypto_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  currency VARCHAR(10) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('buy', 'sell', 'send', 'receive')),
  amount DECIMAL(20, 8) NOT NULL,
  usd_value DECIMAL(15, 2),
  to_address VARCHAR(255),
  from_address VARCHAR(255),
  transaction_hash VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Loans table
CREATE TABLE public.loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  loan_type VARCHAR(50) NOT NULL CHECK (loan_type IN ('personal', 'auto', 'home', 'student', 'business')),
  amount DECIMAL(15, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  term_months INTEGER NOT NULL,
  monthly_payment DECIMAL(15, 2) NOT NULL,
  outstanding_balance DECIMAL(15, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'paid_off', 'rejected', 'defaulted')),
  application_date TIMESTAMPTZ DEFAULT NOW(),
  approval_date TIMESTAMPTZ,
  disbursement_date TIMESTAMPTZ,
  next_payment_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Loan payments table
CREATE TABLE public.loan_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  principal_amount DECIMAL(15, 2) NOT NULL,
  interest_amount DECIMAL(15, 2) NOT NULL,
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed'))
);

-- Grants table
CREATE TABLE public.grants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  grant_type VARCHAR(50) NOT NULL CHECK (grant_type IN ('education', 'business', 'housing', 'emergency', 'research')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(15, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'disbursed', 'rejected')),
  application_date TIMESTAMPTZ DEFAULT NOW(),
  approval_date TIMESTAMPTZ,
  disbursement_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tax refunds table
CREATE TABLE public.tax_refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,
  refund_amount DECIMAL(15, 2) NOT NULL,
  filing_date TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'disbursed', 'rejected')),
  expected_date DATE,
  disbursement_date TIMESTAMPTZ,
  account_id UUID REFERENCES accounts(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Virtual cards table
CREATE TABLE public.virtual_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id),
  card_number VARCHAR(16) NOT NULL,
  card_holder_name VARCHAR(255) NOT NULL,
  expiry_month INTEGER NOT NULL,
  expiry_year INTEGER NOT NULL,
  cvv VARCHAR(3) NOT NULL,
  card_type VARCHAR(20) DEFAULT 'virtual' CHECK (card_type IN ('virtual', 'single_use')),
  spending_limit DECIMAL(15, 2),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Payment services table (PayPal, Venmo, etc.)
CREATE TABLE public.payment_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('paypal', 'venmo', 'cashapp', 'zelle')),
  account_identifier VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  balance DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, service_type)
);

-- Financial insights table
CREATE TABLE public.financial_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  total_income DECIMAL(15, 2) DEFAULT 0,
  total_expenses DECIMAL(15, 2) DEFAULT 0,
  savings_rate DECIMAL(5, 2),
  top_spending_category VARCHAR(50),
  insights_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- Spending categories table
CREATE TABLE public.spending_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  month DATE NOT NULL,
  total_spent DECIMAL(15, 2) NOT NULL DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category, month)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX idx_accounts_account_type_id ON public.accounts(account_type_id);
CREATE INDEX idx_cards_account_id ON public.cards(account_id);
CREATE INDEX idx_transactions_from_account ON public.transactions(from_account_id);
CREATE INDEX idx_transactions_to_account ON public.transactions(to_account_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX idx_beneficiaries_user_id ON public.beneficiaries(user_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_kyc_verifications_user_id ON public.kyc_verifications(user_id);
CREATE INDEX idx_kyc_verifications_status ON public.kyc_verifications(status);
CREATE INDEX idx_crypto_balances_user ON crypto_balances(user_id);
CREATE INDEX idx_crypto_transactions_user ON crypto_transactions(user_id);
CREATE INDEX idx_loans_user ON loans(user_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_grants_user ON grants(user_id);
CREATE INDEX idx_tax_refunds_user ON tax_refunds(user_id);
CREATE INDEX idx_virtual_cards_user ON virtual_cards(user_id);
CREATE INDEX idx_virtual_cards_status ON virtual_cards(status);
CREATE INDEX idx_payment_services_user ON payment_services(user_id);
CREATE INDEX idx_financial_insights_user ON financial_insights(user_id);
CREATE INDEX idx_spending_categories_user ON spending_categories(user_id);

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- KYC documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc-documents',
  'kyc-documents',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spending_categories ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Account types policies
CREATE POLICY "Anyone can view active account types" ON public.account_types
  FOR SELECT USING (is_active = true);

-- Accounts policies
CREATE POLICY "Users can view own accounts" ON public.accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts" ON public.accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts" ON public.accounts
  FOR UPDATE USING (auth.uid() = user_id);

-- Cards policies
CREATE POLICY "Users can view own cards" ON public.cards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.accounts
      WHERE accounts.id = cards.account_id
      AND accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own cards" ON public.cards
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.accounts
      WHERE accounts.id = cards.account_id
      AND accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own cards" ON public.cards
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.accounts
      WHERE accounts.id = cards.account_id
      AND accounts.user_id = auth.uid()
    )
  );

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.accounts
      WHERE (accounts.id = transactions.from_account_id OR accounts.id = transactions.to_account_id)
      AND accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.accounts
      WHERE accounts.id = transactions.from_account_id
      AND accounts.user_id = auth.uid()
    )
  );

-- Beneficiaries policies
CREATE POLICY "Users can view own beneficiaries" ON public.beneficiaries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own beneficiaries" ON public.beneficiaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own beneficiaries" ON public.beneficiaries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own beneficiaries" ON public.beneficiaries
  FOR DELETE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- KYC verifications policies
CREATE POLICY "Users can view own KYC verifications" ON public.kyc_verifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own KYC verifications" ON public.kyc_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own KYC verifications" ON public.kyc_verifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Crypto balances policies
CREATE POLICY "Users can view own crypto balances" ON crypto_balances
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own crypto balances" ON crypto_balances
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own crypto balances" ON crypto_balances
  FOR UPDATE USING (auth.uid() = user_id);

-- Crypto transactions policies
CREATE POLICY "Users can view own crypto transactions" ON crypto_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own crypto transactions" ON crypto_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Loans policies
CREATE POLICY "Users can view own loans" ON loans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own loans" ON loans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own loans" ON loans
  FOR UPDATE USING (auth.uid() = user_id);

-- Loan payments policies
CREATE POLICY "Users can view own loan payments" ON loan_payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM loans WHERE loans.id = loan_payments.loan_id AND loans.user_id = auth.uid())
  );

-- Grants policies
CREATE POLICY "Users can view own grants" ON grants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own grants" ON grants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tax refunds policies
CREATE POLICY "Users can view own tax refunds" ON tax_refunds
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tax refunds" ON tax_refunds
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Virtual cards policies
CREATE POLICY "Users can view own virtual cards" ON virtual_cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own virtual cards" ON virtual_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own virtual cards" ON virtual_cards
  FOR UPDATE USING (auth.uid() = user_id);

-- Payment services policies
CREATE POLICY "Users can view own payment services" ON payment_services
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment services" ON payment_services
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment services" ON payment_services
  FOR UPDATE USING (auth.uid() = user_id);

-- Financial insights policies
CREATE POLICY "Users can view own financial insights" ON financial_insights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own financial insights" ON financial_insights
  FOR UPDATE USING (auth.uid() = user_id);

-- Spending categories policies
CREATE POLICY "Users can view own spending categories" ON spending_categories
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- Avatars storage policies
CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated' AND
  (split_part(name, '/', 1)) = auth.uid()::text
);

CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated' AND
  (split_part(name, '/', 1)) = auth.uid()::text
);

CREATE POLICY "Avatars are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can delete their own avatar" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated' AND
  (split_part(name, '/', 1)) = auth.uid()::text
);

-- KYC documents storage policies
CREATE POLICY "Users can upload their own KYC documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'kyc-documents' AND 
  auth.role() = 'authenticated' AND
  (split_part(name, '/', 1)) = auth.uid()::text
);

CREATE POLICY "Users can read their own KYC documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'kyc-documents' AND 
  auth.role() = 'authenticated' AND
  (split_part(name, '/', 1)) = auth.uid()::text
);

CREATE POLICY "Users can update their own KYC documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'kyc-documents' AND 
  auth.role() = 'authenticated' AND
  (split_part(name, '/', 1)) = auth.uid()::text
);

CREATE POLICY "Users can delete their own KYC documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'kyc-documents' AND 
  auth.role() = 'authenticated' AND
  (split_part(name, '/', 1)) = auth.uid()::text
);

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to generate account number
CREATE OR REPLACE FUNCTION generate_account_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ACC' || LPAD(FLOOR(RANDOM() * 10000000000)::TEXT, 10, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to generate card number
CREATE OR REPLACE FUNCTION generate_card_number()
RETURNS TEXT AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') || ' ' ||
         LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') || ' ' ||
         LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') || ' ' ||
         LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to generate reference number
CREATE OR REPLACE FUNCTION generate_reference_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'TXN' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to generate routing number (9 digits)
CREATE OR REPLACE FUNCTION generate_routing_number()
RETURNS TEXT AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000000)::TEXT, 9, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to generate SWIFT code
CREATE OR REPLACE FUNCTION generate_swift_code()
RETURNS TEXT AS $$
BEGIN
  RETURN 'CCBKUS33' || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON public.cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SIGNUP TRIGGER
-- ============================================================================

-- Function to create default account on user signup
CREATE OR REPLACE FUNCTION public.create_default_account()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_account_id UUID;
  checking_account_type_id UUID;
  new_account_number TEXT;
  new_card_number TEXT;
  new_routing_number TEXT;
  new_swift_code TEXT;
BEGIN
  -- Generate unique identifiers
  new_account_number := generate_account_number();
  new_card_number := generate_card_number();
  new_routing_number := generate_routing_number();
  new_swift_code := generate_swift_code();
  
  -- Get checking account type ID
  SELECT id INTO checking_account_type_id 
  FROM public.account_types 
  WHERE name = 'checking' AND is_active = true
  LIMIT 1;
  
  -- Create profile with minimal information
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'User'));

  -- Create default checking account
  INSERT INTO public.accounts (
    user_id, 
    account_number, 
    account_type_id, 
    balance, 
    routing_number, 
    swift_code
  )
  VALUES (
    NEW.id, 
    new_account_number, 
    checking_account_type_id, 
    0.00, 
    new_routing_number, 
    new_swift_code
  )
  RETURNING id INTO new_account_id;

  -- Create default debit card
  INSERT INTO public.cards (account_id, card_number, card_type, expiry_date, cvv)
  VALUES (
    new_account_id,
    new_card_number,
    'debit',
    TO_CHAR(NOW() + INTERVAL '5 years', 'MM/YY'),
    LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0')
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating default account for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default account on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.create_default_account();

-- ============================================================================
-- BUSINESS LOGIC FUNCTIONS
-- ============================================================================

-- Function to check if user has required KYC for account type
CREATE OR REPLACE FUNCTION check_kyc_requirements(user_id_param UUID, account_type_name_param TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  requires_kyc BOOLEAN;
  has_kyc BOOLEAN;
BEGIN
  -- Check if account type requires KYC
  SELECT account_types.requires_kyc INTO requires_kyc
  FROM public.account_types
  WHERE name = account_type_name_param AND is_active = true;
  
  -- If no KYC required, return true
  IF NOT requires_kyc THEN
    RETURN true;
  END IF;
  
  -- Check if user has approved KYC
  SELECT EXISTS(
    SELECT 1 FROM public.kyc_verifications
    WHERE user_id = user_id_param AND status = 'approved'
  ) INTO has_kyc;
  
  RETURN has_kyc;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default account types
INSERT INTO public.account_types (name, display_name, description, min_balance, interest_rate, requires_kyc) VALUES
('checking', 'Checking Account', 'Standard checking account for daily transactions', 0, 0.0001, false),
('savings', 'Savings Account', 'High-yield savings account with better interest rates', 100, 0.0200, false),
('credit', 'Credit Account', 'Credit line with flexible spending', 0, 0.1899, true),
('investment', 'Investment Account', 'Investment portfolio management account', 1000, 0.0500, true),
('business', 'Business Account', 'Business checking account with enhanced features', 0, 0.0005, true);

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO authenticated;

-- ============================================================================
-- COMPLETE
-- ============================================================================
-- Migration complete! Your Capital City Bank database is ready to use.
-- ============================================================================
