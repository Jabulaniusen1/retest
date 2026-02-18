-- Fix account_types relationship if missing
-- This migration ensures the foreign key relationship exists

-- First, check if account_types table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'account_types' AND table_schema = 'public') THEN
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
    END IF;
END $$;

-- Add account_type_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='accounts' 
        AND column_name='account_type_id'
        AND table_schema='public'
    ) THEN
        ALTER TABLE public.accounts ADD COLUMN account_type_id UUID;
    END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'accounts_account_type_id_fkey'
        AND table_name = 'accounts'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.accounts 
        ADD CONSTRAINT accounts_account_type_id_fkey 
        FOREIGN KEY (account_type_id) 
        REFERENCES public.account_types(id);
    END IF;
END $$;

-- Update existing accounts without account_type_id
UPDATE public.accounts 
SET account_type_id = (SELECT id FROM public.account_types WHERE name = 'checking' LIMIT 1)
WHERE account_type_id IS NULL;

-- Make account_type_id NOT NULL if all accounts have it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.accounts WHERE account_type_id IS NULL) THEN
        ALTER TABLE public.accounts ALTER COLUMN account_type_id SET NOT NULL;
    END IF;
END $$;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_accounts_account_type_id ON public.accounts(account_type_id);

-- Enable RLS if not already enabled
ALTER TABLE public.account_types ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "Anyone can view active account types" ON public.account_types;
CREATE POLICY "Anyone can view active account types" ON public.account_types
  FOR SELECT USING (is_active = true);

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
