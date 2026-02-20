-- COMPLETE SIGNUP FIX - Run this in Supabase SQL Editor
-- This creates automatic account creation when users sign up - NO STRESS!

-- Step 1: Add required columns to accounts table
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS routing_number TEXT;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS swift_code TEXT;

-- Step 2: Create ALL helper functions needed for automatic account creation

-- Generate account number (ACC + 10 random digits)
CREATE OR REPLACE FUNCTION generate_account_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ACC' || LPAD(FLOOR(RANDOM() * 10000000000)::TEXT, 10, '0');
END;
$$ LANGUAGE plpgsql;

-- Generate card number (16 digits in 4 groups)
CREATE OR REPLACE FUNCTION generate_card_number()
RETURNS TEXT AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') || ' ' ||
         LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') || ' ' ||
         LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') || ' ' ||
         LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Generate routing number (9 digits for domestic transfers)
CREATE OR REPLACE FUNCTION generate_routing_number()
RETURNS TEXT AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000000)::TEXT, 9, '0');
END;
$$ LANGUAGE plpgsql;

-- Generate SWIFT code (CCBKUS33 + 3 random digits for international transfers)
CREATE OR REPLACE FUNCTION generate_swift_code()
RETURNS TEXT AS $$
BEGIN
  RETURN 'CCBKUS33' || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Step 3: Remove old trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_default_account();

-- Step 4: Create the automatic account creation function
-- This runs automatically when a user signs up - creates profile, account, and card
CREATE OR REPLACE FUNCTION create_default_account()
RETURNS TRIGGER AS $$
DECLARE
  new_account_id UUID;
  checking_account_type_id UUID;
BEGIN
  -- Get the checking account type ID
  SELECT id INTO checking_account_type_id 
  FROM public.account_types 
  WHERE name = 'checking' AND is_active = true;
  
  -- If no checking account type exists, raise a clear error
  IF checking_account_type_id IS NULL THEN
    RAISE EXCEPTION 'Checking account type not found. Please ensure account_types table has a checking type.';
  END IF;
  
  -- 1. Create user profile automatically
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, 'User');

  -- 2. Create default checking account with $0 balance
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
    generate_account_number(), 
    checking_account_type_id, 
    0.00, 
    generate_routing_number(), 
    generate_swift_code()
  )
  RETURNING id INTO new_account_id;

  -- 3. Create default debit card linked to the account
  INSERT INTO public.cards (
    account_id, 
    card_number, 
    card_type, 
    expiry_date, 
    cvv
  )
  VALUES (
    new_account_id,
    generate_card_number(),
    'debit',
    TO_CHAR(NOW() + INTERVAL '5 years', 'MM/YY'),
    LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0')
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If anything fails, show a clear error message
    RAISE EXCEPTION 'Signup failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create the trigger that runs automatically on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.create_default_account();

-- Step 6: Fix any existing accounts that don't have routing/SWIFT codes
UPDATE public.accounts 
SET 
  routing_number = generate_routing_number(),
  swift_code = generate_swift_code()
WHERE routing_number IS NULL OR swift_code IS NULL;

-- Done! Now when users sign up, they automatically get:
-- ✅ A user profile
-- ✅ A checking account with $0 balance
-- ✅ A routing number (for domestic transfers)
-- ✅ A SWIFT code (for international transfers)
-- ✅ A debit card
-- All automatic - NO STRESS!
