-- Fix Signup Trigger - Run this in Supabase SQL Editor
-- This script fixes the "Database error saving new user" issue

-- Step 1: Add routing_number and swift_code columns if they don't exist
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS routing_number TEXT;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS swift_code TEXT;

-- Step 2: Create helper functions for generating routing numbers and SWIFT codes
CREATE OR REPLACE FUNCTION generate_routing_number()
RETURNS TEXT AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000000)::TEXT, 9, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_swift_code()
RETURNS TEXT AS $$
BEGIN
  -- Format: CCBK (Capital City Bank) + US (Country) + 33 (Location) + XXX (Branch)
  RETURN 'CCBKUS33' || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Step 3: Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_default_account();

-- Step 4: Recreate the signup trigger function
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
  
  -- If no checking account type exists, raise an error
  IF checking_account_type_id IS NULL THEN
    RAISE EXCEPTION 'Checking account type not found';
  END IF;
  
  -- Create profile with minimal information
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, 'User');

  -- Create default checking account
  INSERT INTO public.accounts (user_id, account_number, account_type_id, balance, routing_number, swift_code)
  VALUES (
    NEW.id, 
    generate_account_number(), 
    checking_account_type_id, 
    0.00, 
    generate_routing_number(), 
    generate_swift_code()
  )
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
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating default account: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.create_default_account();

-- Step 6: Update existing accounts with routing numbers and SWIFT codes if they don't have them
UPDATE public.accounts 
SET 
  routing_number = generate_routing_number(),
  swift_code = generate_swift_code()
WHERE routing_number IS NULL OR swift_code IS NULL;
