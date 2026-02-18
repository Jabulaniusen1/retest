-- Diagnostic query to check transactions and debug why they're not showing

-- 1. Check if transactions exist
SELECT 
  'Total Transactions' as check_type,
  COUNT(*) as count
FROM public.transactions;

-- 2. Check transactions by user
SELECT 
  'Transactions by User' as check_type,
  u.email,
  COUNT(t.id) as transaction_count
FROM auth.users u
LEFT JOIN public.accounts a ON a.user_id = u.id
LEFT JOIN public.transactions t ON (t.from_account_id = a.id OR t.to_account_id = a.id)
GROUP BY u.id, u.email
ORDER BY transaction_count DESC;

-- 3. Check sample transactions with details
SELECT 
  t.id,
  t.transaction_type,
  t.amount,
  t.description,
  t.recipient_name,
  t.created_at::DATE as transaction_date,
  t.status,
  fa.account_number as from_account,
  fa.user_id as from_user_id
FROM public.transactions t
LEFT JOIN public.accounts fa ON fa.id = t.from_account_id
ORDER BY t.created_at DESC
LIMIT 10;

-- 4. Check accounts
SELECT 
  'Total Accounts' as check_type,
  COUNT(*) as count
FROM public.accounts;

-- 5. Check if there are orphaned transactions (transactions without valid accounts)
SELECT 
  'Orphaned Transactions' as check_type,
  COUNT(*) as count
FROM public.transactions t
WHERE t.from_account_id NOT IN (SELECT id FROM public.accounts);
