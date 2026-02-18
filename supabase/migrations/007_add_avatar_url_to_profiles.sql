-- Add avatar_url field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN avatar_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to the user''s profile image/avatar';
