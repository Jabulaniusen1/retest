-- Make the old account_type column nullable since we're using account_type_id now
-- This allows us to use the new schema with account_types table

-- Make account_type column nullable
ALTER TABLE public.accounts ALTER COLUMN account_type DROP NOT NULL;

-- Update any existing accounts that have account_type_id but no account_type
UPDATE public.accounts 
SET account_type = (SELECT name FROM public.account_types WHERE id = account_type_id)
WHERE account_type IS NULL AND account_type_id IS NOT NULL;

-- Add a comment to document the change
COMMENT ON COLUMN public.accounts.account_type IS 'Legacy text field for account type. Use account_type_id instead.';
