-- ============================================================================
-- DISABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================
-- WARNING: This removes all security policies and disables RLS
-- Only use this for development/testing purposes
-- DO NOT use in production environments
-- ============================================================================

-- Disable RLS on core tables
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiaries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_verifications DISABLE ROW LEVEL SECURITY;

-- Disable RLS on financial services tables
ALTER TABLE public.crypto_balances DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.grants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_refunds DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_insights DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.spending_categories DISABLE ROW LEVEL SECURITY;

-- Drop all RLS policies (optional - uncomment if needed)
-- This will remove all policies but keep RLS disabled

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Account types policies
DROP POLICY IF EXISTS "Anyone can view active account types" ON public.account_types;

-- Accounts policies
DROP POLICY IF EXISTS "Users can view own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can insert own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can update own accounts" ON public.accounts;

-- Cards policies
DROP POLICY IF EXISTS "Users can view own cards" ON public.cards;
DROP POLICY IF EXISTS "Users can insert own cards" ON public.cards;
DROP POLICY IF EXISTS "Users can update own cards" ON public.cards;

-- Transactions policies
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;

-- Beneficiaries policies
DROP POLICY IF EXISTS "Users can view own beneficiaries" ON public.beneficiaries;
DROP POLICY IF EXISTS "Users can insert own beneficiaries" ON public.beneficiaries;
DROP POLICY IF EXISTS "Users can update own beneficiaries" ON public.beneficiaries;
DROP POLICY IF EXISTS "Users can delete own beneficiaries" ON public.beneficiaries;

-- Notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

-- KYC verifications policies
DROP POLICY IF EXISTS "Users can view own KYC verifications" ON public.kyc_verifications;
DROP POLICY IF EXISTS "Users can insert own KYC verifications" ON public.kyc_verifications;
DROP POLICY IF EXISTS "Users can update own KYC verifications" ON public.kyc_verifications;

-- Crypto balances policies
DROP POLICY IF EXISTS "Users can view own crypto balances" ON public.crypto_balances;
DROP POLICY IF EXISTS "Users can insert own crypto balances" ON public.crypto_balances;
DROP POLICY IF EXISTS "Users can update own crypto balances" ON public.crypto_balances;

-- Crypto transactions policies
DROP POLICY IF EXISTS "Users can view own crypto transactions" ON public.crypto_transactions;
DROP POLICY IF EXISTS "Users can insert own crypto transactions" ON public.crypto_transactions;

-- Loans policies
DROP POLICY IF EXISTS "Users can view own loans" ON public.loans;
DROP POLICY IF EXISTS "Users can insert own loans" ON public.loans;
DROP POLICY IF EXISTS "Users can update own loans" ON public.loans;

-- Loan payments policies
DROP POLICY IF EXISTS "Users can view own loan payments" ON public.loan_payments;

-- Grants policies
DROP POLICY IF EXISTS "Users can view own grants" ON public.grants;
DROP POLICY IF EXISTS "Users can insert own grants" ON public.grants;

-- Tax refunds policies
DROP POLICY IF EXISTS "Users can view own tax refunds" ON public.tax_refunds;
DROP POLICY IF EXISTS "Users can insert own tax refunds" ON public.tax_refunds;

-- Virtual cards policies
DROP POLICY IF EXISTS "Users can view own virtual cards" ON public.virtual_cards;
DROP POLICY IF EXISTS "Users can insert own virtual cards" ON public.virtual_cards;
DROP POLICY IF EXISTS "Users can update own virtual cards" ON public.virtual_cards;

-- Payment services policies
DROP POLICY IF EXISTS "Users can view own payment services" ON public.payment_services;
DROP POLICY IF EXISTS "Users can insert own payment services" ON public.payment_services;
DROP POLICY IF EXISTS "Users can update own payment services" ON public.payment_services;

-- Financial insights policies
DROP POLICY IF EXISTS "Users can view own financial insights" ON public.financial_insights;
DROP POLICY IF EXISTS "Users can update own financial insights" ON public.financial_insights;

-- Spending categories policies
DROP POLICY IF EXISTS "Users can view own spending categories" ON public.spending_categories;

-- Storage policies
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own KYC documents" ON storage.objects;

-- ============================================================================
-- RLS DISABLED - All tables are now accessible without row-level restrictions
-- ============================================================================
