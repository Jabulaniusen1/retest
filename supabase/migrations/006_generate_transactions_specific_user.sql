-- Generate sample transaction history for specific user: 4acf5a43-77da-499d-a8d2-ace67d22a6ba
-- This script creates realistic transaction data from 2016 to present

DO $$
DECLARE
  v_user_id UUID := '4acf5a43-77da-499d-a8d2-ace67d22a6ba';
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
    'Pharmacy', 'Doctor Office', 'Dentist', 'Veterinarian', 'Hair Salon',
    'Nike Store', 'Adidas', 'Zara', 'H&M', 'Gap', 'Old Navy',
    'Panera Bread', 'Five Guys', 'Shake Shack', 'In-N-Out Burger',
    'Trader Joe''s', 'Safeway', 'Kroger', 'Publix', 'Aldi'
  ];
  
  v_categories TEXT[] := ARRAY[
    'groceries', 'dining', 'transportation', 'entertainment', 'utilities',
    'shopping', 'healthcare', 'travel', 'subscriptions', 'bills', 'other'
  ];
  
  v_deposit_descriptions TEXT[] := ARRAY[
    'Salary Deposit', 'Paycheck', 'Direct Deposit - Employer', 'Bonus Payment',
    'Tax Refund', 'Freelance Payment', 'Investment Return', 'Gift Deposit',
    'Reimbursement', 'Commission Payment', 'Dividend Payment', 'Interest Payment',
    'Cashback Reward', 'Refund from Merchant', 'Side Hustle Income'
  ];
  
BEGIN
  -- Verify user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_user_id) THEN
    RAISE EXCEPTION 'User with ID % does not exist', v_user_id;
  END IF;
  
  -- Get user's accounts
  SELECT ARRAY_AGG(id) INTO v_account_ids 
  FROM public.accounts 
  WHERE user_id = v_user_id;
  
  IF v_account_ids IS NULL OR array_length(v_account_ids, 1) = 0 THEN
    RAISE EXCEPTION 'No accounts found for user %. Please ensure the user has at least one account.', v_user_id;
  END IF;
  
  RAISE NOTICE 'Found % account(s) for user', array_length(v_account_ids, 1);
  RAISE NOTICE 'Generating % transactions from 2016 to present...', v_max_transactions;
  
  -- Delete existing transactions for this user (optional - comment out if you want to keep existing)
  DELETE FROM public.transactions 
  WHERE from_account_id = ANY(v_account_ids) OR to_account_id = ANY(v_account_ids);
  RAISE NOTICE 'Cleared existing transactions';
  
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
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Successfully generated % transactions!', v_max_transactions;
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  
  -- Show summary
  RAISE NOTICE '=== Transaction Summary ===';
  RAISE NOTICE 'User ID: %', v_user_id;
  RAISE NOTICE 'Total transactions: %', (SELECT COUNT(*) FROM public.transactions WHERE from_account_id = ANY(v_account_ids));
  RAISE NOTICE 'Deposits: %', (SELECT COUNT(*) FROM public.transactions WHERE from_account_id = ANY(v_account_ids) AND transaction_type = 'deposit');
  RAISE NOTICE 'Payments: %', (SELECT COUNT(*) FROM public.transactions WHERE from_account_id = ANY(v_account_ids) AND transaction_type = 'payment');
  RAISE NOTICE 'Transfers: %', (SELECT COUNT(*) FROM public.transactions WHERE from_account_id = ANY(v_account_ids) AND transaction_type = 'transfer');
  RAISE NOTICE 'Date range: % to %', 
    (SELECT MIN(created_at)::DATE FROM public.transactions WHERE from_account_id = ANY(v_account_ids)),
    (SELECT MAX(created_at)::DATE FROM public.transactions WHERE from_account_id = ANY(v_account_ids));
  RAISE NOTICE '';
  RAISE NOTICE 'Transactions are now ready to view in the app!';
  
END $$;
