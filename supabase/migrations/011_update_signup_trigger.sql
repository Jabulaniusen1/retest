-- Update the create_default_account function to handle simplified signup

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_default_account();

-- Recreate the function to handle signup without name requirement
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
  
  -- Create profile with minimal information (name will be added later in settings)
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, 'User'); -- Default name, user will update in settings

  -- Create default checking account
  INSERT INTO public.accounts (user_id, account_number, account_type_id, balance, routing_number, swift_code)
  VALUES (NEW.id, generate_account_number(), checking_account_type_id, 0.00, generate_routing_number(), generate_swift_code())
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

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.create_default_account();
