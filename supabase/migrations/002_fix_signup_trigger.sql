-- Fix for signup trigger issues
-- This migration fixes the create_default_account function to handle errors properly

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_default_account();

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION public.create_default_account()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_account_id UUID;
  new_account_number TEXT;
  new_card_number TEXT;
BEGIN
  -- Generate account number
  new_account_number := 'ACC' || LPAD(FLOOR(RANDOM() * 10000000000)::TEXT, 10, '0');
  
  -- Generate card number
  new_card_number := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') || ' ' ||
                     LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') || ' ' ||
                     LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') || ' ' ||
                     LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

  -- Create profile
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'User'));

  -- Create default checking account
  -- Get checking account type ID
  DECLARE
    checking_account_type_id UUID;
  BEGIN
    SELECT id INTO checking_account_type_id 
    FROM public.account_types 
    WHERE name = 'checking' AND is_active = true
    LIMIT 1;
    
    -- If no checking account type found, use a default UUID
    IF checking_account_type_id IS NULL THEN
      checking_account_type_id := '00000000-0000-0000-0000-000000000000'::UUID;
    END IF;
    
    INSERT INTO public.accounts (user_id, account_number, account_type_id, balance)
    VALUES (NEW.id, new_account_number, checking_account_type_id, 0.00)
    RETURNING id INTO new_account_id;
  END;

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
    -- Log the error but don't fail the signup
    RAISE WARNING 'Error creating default account for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.create_default_account();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
