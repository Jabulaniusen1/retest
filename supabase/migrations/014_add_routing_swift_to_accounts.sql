-- Add routing number and SWIFT code to accounts table
-- This migration adds banking identifiers for domestic and international transfers

-- Add routing_number column (for domestic transfers)
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS routing_number TEXT;

-- Add swift_code column (for international transfers)
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS swift_code TEXT;

-- Create function to generate routing number (9 digits)
CREATE OR REPLACE FUNCTION generate_routing_number()
RETURNS TEXT AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000000)::TEXT, 9, '0');
END;
$$ LANGUAGE plpgsql;

-- Create function to generate SWIFT code (format: CCBKUS33XXX)
CREATE OR REPLACE FUNCTION generate_swift_code()
RETURNS TEXT AS $$
BEGIN
  -- Format: CCBK (Capital City Bank) + US (Country) + 33 (Location) + XXX (Branch)
  RETURN 'CCBKUS33' || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Update existing accounts with routing numbers and SWIFT codes
UPDATE public.accounts 
SET 
  routing_number = generate_routing_number(),
  swift_code = generate_swift_code()
WHERE routing_number IS NULL OR swift_code IS NULL;

-- Make routing_number and swift_code NOT NULL after populating existing records
ALTER TABLE public.accounts ALTER COLUMN routing_number SET NOT NULL;
ALTER TABLE public.accounts ALTER COLUMN swift_code SET NOT NULL;

-- Add unique constraints
ALTER TABLE public.accounts ADD CONSTRAINT accounts_routing_number_unique UNIQUE (routing_number);
ALTER TABLE public.accounts ADD CONSTRAINT accounts_swift_code_unique UNIQUE (swift_code);
