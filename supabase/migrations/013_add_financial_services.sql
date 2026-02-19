-- Add crypto balances table
CREATE TABLE IF NOT EXISTS crypto_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  currency VARCHAR(10) NOT NULL,
  balance DECIMAL(20, 8) NOT NULL DEFAULT 0,
  wallet_address VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, currency)
);

-- Add crypto transactions table
CREATE TABLE IF NOT EXISTS crypto_transactions (
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

-- Add loans table
CREATE TABLE IF NOT EXISTS loans (
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

-- Add loan payments table
CREATE TABLE IF NOT EXISTS loan_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  principal_amount DECIMAL(15, 2) NOT NULL,
  interest_amount DECIMAL(15, 2) NOT NULL,
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed'))
);

-- Add grants table
CREATE TABLE IF NOT EXISTS grants (
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

-- Add tax refunds table
CREATE TABLE IF NOT EXISTS tax_refunds (
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

-- Add virtual cards table
CREATE TABLE IF NOT EXISTS virtual_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id),
  card_number VARCHAR(16) NOT NULL,
  card_holder_name VARCHAR(255) NOT NULL,
  expiry_month INTEGER NOT NULL,
  expiry_year INTEGER NOT NULL,
  cvv VARCHAR(3) NOT NULL,
  card_type VARCHAR(20) DEFAULT 'virtual' CHECK (card_type IN ('virtual', 'physical')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'cancelled')),
  spending_limit DECIMAL(15, 2),
  merchant_category VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add payment services table (Venmo, PayPal, etc.)
CREATE TABLE IF NOT EXISTS payment_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_name VARCHAR(50) NOT NULL CHECK (service_name IN ('venmo', 'paypal', 'cashapp', 'zelle', 'wise', 'revolut')),
  account_identifier VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, service_name)
);

-- Add financial insights table
CREATE TABLE IF NOT EXISTS financial_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type VARCHAR(50) NOT NULL CHECK (insight_type IN ('spending_pattern', 'saving_opportunity', 'budget_alert', 'investment_tip', 'unusual_activity')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add spending categories table for insights
CREATE TABLE IF NOT EXISTS spending_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  month DATE NOT NULL,
  total_spent DECIMAL(15, 2) NOT NULL DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category, month)
);

-- Create indexes for better performance
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

-- Enable RLS
ALTER TABLE crypto_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE spending_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own crypto balances" ON crypto_balances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own crypto balances" ON crypto_balances FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own crypto balances" ON crypto_balances FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own crypto transactions" ON crypto_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own crypto transactions" ON crypto_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own loans" ON loans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own loans" ON loans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own loans" ON loans FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own loan payments" ON loan_payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM loans WHERE loans.id = loan_payments.loan_id AND loans.user_id = auth.uid())
);

CREATE POLICY "Users can view own grants" ON grants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own grants" ON grants FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own tax refunds" ON tax_refunds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tax refunds" ON tax_refunds FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own virtual cards" ON virtual_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own virtual cards" ON virtual_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own virtual cards" ON virtual_cards FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own payment services" ON payment_services FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payment services" ON payment_services FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own payment services" ON payment_services FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own financial insights" ON financial_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own financial insights" ON financial_insights FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own spending categories" ON spending_categories FOR SELECT USING (auth.uid() = user_id);
