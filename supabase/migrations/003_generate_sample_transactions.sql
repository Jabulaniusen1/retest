-- Generate sample transaction history from 2016 to present
-- This script creates realistic transaction data for testing

DO $$
DECLARE
  v_user_id UUID;
  v_account_ids UUID[];
  v_account_id UUID;
  v_other_account_id UUID;
  v_date DATE;
  v_amount DECIMAL(10,2);
  v_transaction_type TEXT;
  v_description TEXT;
  v_recipient_name TEXT;
  v_category TEXT;
  v_counter INTEGER := 0;
  v_max_transactions INTEGER := 1000; -- Generate 1000 transactions
  
  -- Arrays for random data
  v_merchants TEXT[] := ARRAY[
    'Amazon', 'Walmart', 'Target', 'Starbucks', 'McDonald''s', 'Whole Foods',
    'Shell Gas Station', 'Netflix', 'Spotify', 'Apple', 'Google Play',
    'Home Depot', 'Best Buy', 'CVS Pharmacy', 'Walgreens', 'Costco',
    'Uber', 'Lyft', 'DoorDash', 'Grubhub', 'Chipotle', 'Subway',
    'AT&T', 'Verizon', 'Comcast', 'Electric Company', 'Water Utility',
    'Rent Payment', 'Mortgage Payment', 'Insurance Premium', 'Gym Membership',
    'Restaurant - Italian Bistro', 'Restaurant - Sushi Place', 'Coffee Shop',
    'Bookstore', 'Movie Theater', 'Gas Station', 'Parking Meter',
    'Hotel Reservation', 'Airline Tickets', 'Car Rental', 'Pet Store',
    'Pharmacy', 'Doctor Office', 'Dentist', 'Veterinarian', 'Hair Salon'
  ];
  
  v_categories TEXT[] := ARRAY[
    'groceries', 'dining', 'transportation', 'entertainment', 'utilities',
    'shopping', 'healthcare', 'travel', 'subscriptions', 'bills', 'other'
  ];
  
  v_deposit_descriptions TEXT[] := ARRAY[
    'Salary Deposit', 'Paycheck', 'Direct Deposit - Employer', 'Bonus Payment',
    'Tax Refund', 'Freelance Payment', 'Investment Return', 'Gift Deposit',
    'Reimbursement', 'Commission Payment', 'Dividend Payment'
  ];
  
BEGIN
  -- Get the first user (you can modify this to target specific users)
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'No users found. Please create a user first.';
    RETURN;
  END IF;
  
  -- Get user's accounts
  SELECT ARRAY_AGG(id) INTO v_account_ids 
  FROM public.accounts 
  WHERE user_id = v_user_id;
  
  IF v_account_ids IS NULL OR array_length(v_account_ids, 1) = 0 THEN
    RAISE NOTICE 'No accounts found for user. Creating default account...';
    
    -- Get checking account type ID
    DECLARE
      v_checking_account_type_id UUID;
    BEGIN
      SELECT id INTO v_checking_account_type_id 
      FROM public.account_types 
      WHERE name = 'checking' AND is_active = true
      LIMIT 1;
      
      -- If no checking account type found, skip account creation
      IF v_checking_account_type_id IS NULL THEN
        RAISE NOTICE 'No checking account type found. Skipping account creation.';
        RETURN;
      END IF;
      
      INSERT INTO public.accounts (user_id, account_number, account_type_id, balance)
      VALUES (v_user_id, 'ACC' || LPAD(FLOOR(RANDOM() * 10000000000)::TEXT, 10, '0'), v_checking_account_type_id, 10000.00)
      RETURNING id INTO v_account_id;
      
      v_account_ids := ARRAY[v_account_id];
    END;
  END IF;
  
  RAISE NOTICE 'Generating % transactions for user %', v_max_transactions, v_user_id;
  
  -- Generate transactions
  FOR v_counter IN 1..v_max_transactions LOOP
    -- Random date between 2016-01-01 and now
    v_date := DATE '2016-01-01' + (RANDOM() * (CURRENT_DATE - DATE '2016-01-01'))::INTEGER;
    
    -- Pick random account
    v_account_id := v_account_ids[1 + FLOOR(RANDOM() * array_length(v_account_ids, 1))::INTEGER];
    
    -- Determine transaction type (70% payments, 20% deposits, 10% transfers)
    CASE 
      WHEN RANDOM() < 0.70 THEN
        -- Payment/Withdrawal
        v_transaction_type := 'payment';
        v_amount := ROUND((RANDOM() * 500 + 5)::NUMERIC, 2); -- $5 to $505
        v_recipient_name := v_merchants[1 + FLOOR(RANDOM() * array_length(v_merchants, 1))::INTEGER];
        v_description := 'Payment to ' || v_recipient_name;
        v_category := v_categories[1 + FLOOR(RANDOM() * array_length(v_categories, 1))::INTEGER];
        v_other_account_id := NULL;
        
      WHEN RANDOM() < 0.90 THEN
        -- Deposit
        v_transaction_type := 'deposit';
        v_amount := ROUND((RANDOM() * 3000 + 500)::NUMERIC, 2); -- $500 to $3500
        v_description := v_deposit_descriptions[1 + FLOOR(RANDOM() * array_length(v_deposit_descriptions, 1))::INTEGER];
        v_recipient_name := NULL;
        v_category := 'income';
        v_other_account_id := NULL;
        
      ELSE
        -- Transfer between own accounts (if multiple accounts exist)
        IF array_length(v_account_ids, 1) > 1 THEN
          v_transaction_type := 'transfer';
          v_amount := ROUND((RANDOM() * 1000 + 100)::NUMERIC, 2); -- $100 to $1100
          v_description := 'Transfer between accounts';
          v_recipient_name := 'Own Account';
          v_category := 'transfer';
          
          -- Pick different account
          LOOP
            v_other_account_id := v_account_ids[1 + FLOOR(RANDOM() * array_length(v_account_ids, 1))::INTEGER];
            EXIT WHEN v_other_account_id != v_account_id;
          END LOOP;
        ELSE
          -- Fallback to payment if only one account
          v_transaction_type := 'payment';
          v_amount := ROUND((RANDOM() * 200 + 10)::NUMERIC, 2);
          v_recipient_name := v_merchants[1 + FLOOR(RANDOM() * array_length(v_merchants, 1))::INTEGER];
          v_description := 'Payment to ' || v_recipient_name;
          v_category := v_categories[1 + FLOOR(RANDOM() * array_length(v_categories, 1))::INTEGER];
          v_other_account_id := NULL;
        END IF;
    END CASE;
    
    -- Insert transaction with historical date
    INSERT INTO public.transactions (
      from_account_id,
      to_account_id,
      transaction_type,
      amount,
      description,
      recipient_name,
      category,
      status,
      reference_number,
      created_at,
      updated_at
    ) VALUES (
      v_account_id,
      v_other_account_id,
      v_transaction_type,
      v_amount,
      v_description,
      v_recipient_name,
      v_category,
      'completed',
      'TXN' || TO_CHAR(v_date, 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0'),
      v_date + (RANDOM() * INTERVAL '23 hours'),
      v_date + (RANDOM() * INTERVAL '23 hours')
    );
    
    -- Log progress every 100 transactions
    IF v_counter % 100 = 0 THEN
      RAISE NOTICE 'Generated % transactions...', v_counter;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Successfully generated % transactions from 2016 to present!', v_max_transactions;
  
  -- Show summary
  RAISE NOTICE '=== Transaction Summary ===';
  RAISE NOTICE 'Total transactions: %', (SELECT COUNT(*) FROM public.transactions WHERE from_account_id = ANY(v_account_ids));
  RAISE NOTICE 'Deposits: %', (SELECT COUNT(*) FROM public.transactions WHERE from_account_id = ANY(v_account_ids) AND transaction_type = 'deposit');
  RAISE NOTICE 'Payments: %', (SELECT COUNT(*) FROM public.transactions WHERE from_account_id = ANY(v_account_ids) AND transaction_type = 'payment');
  RAISE NOTICE 'Transfers: %', (SELECT COUNT(*) FROM public.transactions WHERE from_account_id = ANY(v_account_ids) AND transaction_type = 'transfer');
  RAISE NOTICE 'Date range: % to %', 
    (SELECT MIN(created_at)::DATE FROM public.transactions WHERE from_account_id = ANY(v_account_ids)),
    (SELECT MAX(created_at)::DATE FROM public.transactions WHERE from_account_id = ANY(v_account_ids));
  
END $$;
