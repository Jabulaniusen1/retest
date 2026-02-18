-- Add account types and KYC verification features

-- Create account_types table
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

-- Insert default account types
INSERT INTO public.account_types (name, display_name, description, min_balance, interest_rate, requires_kyc) VALUES
('checking', 'Checking Account', 'Standard checking account for daily transactions', 0, 0.0001, false),
('savings', 'Savings Account', 'High-yield savings account with better interest rates', 100, 0.0200, false),
('credit', 'Credit Account', 'Credit line with flexible spending', 0, 0.1899, true),
('investment', 'Investment Account', 'Investment portfolio management account', 1000, 0.0500, true),
('business', 'Business Account', 'Business checking account with enhanced features', 0, 0.0005, true);

-- Update accounts table to reference account_types
ALTER TABLE public.accounts ADD COLUMN account_type_id UUID REFERENCES public.account_types(id);

-- Update existing accounts to use new account_type_id (only if old column exists)
DO $$
BEGIN
    -- Check if the old account_type column exists before trying to update
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='accounts' 
        AND column_name='account_type'
        AND table_schema='public'
    ) THEN
        UPDATE public.accounts SET account_type_id = (SELECT id FROM public.account_types WHERE name = 'checking' LIMIT 1) WHERE account_type = 'checking';
        UPDATE public.accounts SET account_type_id = (SELECT id FROM public.account_types WHERE name = 'savings' LIMIT 1) WHERE account_type = 'savings';
        UPDATE public.accounts SET account_type_id = (SELECT id FROM public.account_types WHERE name = 'credit' LIMIT 1) WHERE account_type = 'credit';
    END IF;
END $$;

-- Make account_type_id required and drop old account_type (only if it exists)
DO $$
BEGIN
    -- Only make NOT NULL if we have data or if this is a fresh setup
    IF EXISTS (SELECT 1 FROM public.accounts LIMIT 1) THEN
        ALTER TABLE public.accounts ALTER COLUMN account_type_id SET NOT NULL;
    END IF;
    
    -- Drop old column if it exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='accounts' 
        AND column_name='account_type'
        AND table_schema='public'
    ) THEN
        ALTER TABLE public.accounts DROP COLUMN account_type;
    END IF;
END $$;

-- Create KYC verifications table
CREATE TABLE public.kyc_verifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  verification_type TEXT NOT NULL CHECK (verification_type IN ('identity', 'address', 'income', 'business')),
  
  -- Document URLs (stored in Supabase Storage)
  identity_document_url TEXT,
  address_document_url TEXT,
  income_document_url TEXT,
  business_document_url TEXT,
  
  -- Additional information
  full_name TEXT,
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'US',
  phone TEXT,
  
  -- Verification metadata
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  notes TEXT,
  
  -- Unique constraint per user per verification type
  UNIQUE(user_id, verification_type)
);

-- Create kyc_documents storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc-documents',
  'kyc-documents',
  false, -- Private bucket
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
);

-- Enable RLS for new tables
ALTER TABLE public.account_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for account_types (public read access for active types)
CREATE POLICY "Anyone can view active account types" ON public.account_types
  FOR SELECT USING (is_active = true);

-- RLS Policies for kyc_verifications
CREATE POLICY "Users can view own KYC verifications" ON public.kyc_verifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own KYC verifications" ON public.kyc_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own KYC verifications" ON public.kyc_verifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Admin policies for KYC review (you can add admin role checking later)
CREATE POLICY "Admins can review KYC verifications" ON public.kyc_verifications
  FOR UPDATE USING (
    auth.uid() = reviewed_by OR 
    -- Add admin role check here when you implement admin roles
    false
  );

CREATE POLICY "Admins can view all KYC verifications" ON public.kyc_verifications
  FOR SELECT USING (
    -- Add admin role check here when you implement admin roles
    false
  );

-- RLS Policies for kyc-documents storage
CREATE POLICY "Users can upload their own KYC documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'kyc-documents' AND 
  auth.role() = 'authenticated' AND
  (split_part(name, '/', 1)) = auth.uid()
);

CREATE POLICY "Users can read their own KYC documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'kyc-documents' AND 
  auth.role() = 'authenticated' AND
  (split_part(name, '/', 1)) = auth.uid()
);

CREATE POLICY "Users can update their own KYC documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'kyc-documents' AND 
  auth.role() = 'authenticated' AND
  (split_part(name, '/', 1)) = auth.uid()
);

CREATE POLICY "Users can delete their own KYC documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'kyc-documents' AND 
  auth.role() = 'authenticated' AND
  (split_part(name, '/', 1)) = auth.uid()
);

-- Grant necessary permissions
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO authenticated;

-- Create indexes
CREATE INDEX idx_accounts_account_type_id ON public.accounts(account_type_id);
CREATE INDEX idx_kyc_verifications_user_id ON public.kyc_verifications(user_id);
CREATE INDEX idx_kyc_verifications_status ON public.kyc_verifications(status);

-- Update create_default_account function to support account types
CREATE OR REPLACE FUNCTION create_default_account()
RETURNS TRIGGER AS $$
DECLARE
  new_account_id UUID;
  checking_account_type_id UUID;
BEGIN
  -- Get checking account type ID
  SELECT id INTO checking_account_type_id 
  FROM public.account_types 
  WHERE name = 'checking' AND is_active = true;
  
  -- If no checking account type found, use a default UUID
  IF checking_account_type_id IS NULL THEN
    checking_account_type_id := '00000000-0000-0000-0000-000000000000'::UUID;
  END IF;
  
  -- Create profile
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'User'));

  -- Create default checking account
  INSERT INTO public.accounts (user_id, account_number, account_type_id, balance)
  VALUES (NEW.id, generate_account_number(), checking_account_type_id, 10000.00)
  RETURNING id INTO new_account_id;

  -- Create default debit card
  INSERT INTO public.cards (account_id, card_number, card_type, expiry_date, cvv)
  VALUES (
    new_account_id,
    generate_card_number(),
    'debit',
    TO_CHAR(NOW() + INTERVAL '5 years', 'MM/YY'),
    LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0')
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has required KYC for account type
CREATE OR REPLACE FUNCTION check_kyc_requirements(user_id_param UUID, account_type_name_param TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  requires_kyc BOOLEAN;
  has_kyc BOOLEAN;
BEGIN
  -- Check if account type requires KYC
  SELECT requires_kyc INTO requires_kyc
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
