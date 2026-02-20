-- ============================================================================
-- FIX STORAGE RLS POLICIES
-- ============================================================================
-- This migration re-enables storage policies that were dropped by 999_disable_all_rls.sql
-- Storage buckets need RLS policies to function properly even in development
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own KYC documents" ON storage.objects;

-- ============================================================================
-- AVATARS BUCKET POLICIES
-- ============================================================================

-- Policy: Users can upload their own avatar
CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated' AND
  (split_part(name, '/', 1))::uuid = auth.uid()
);

-- Policy: Users can update their own avatar
CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated' AND
  (split_part(name, '/', 1))::uuid = auth.uid()
);

-- Policy: Avatars are publicly accessible for reading
CREATE POLICY "Avatars are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Policy: Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated' AND
  (split_part(name, '/', 1))::uuid = auth.uid()
);

-- ============================================================================
-- KYC DOCUMENTS BUCKET POLICIES
-- ============================================================================

-- Policy: Users can upload their own KYC documents
CREATE POLICY "Users can upload their own KYC documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'kyc-documents' AND 
  auth.role() = 'authenticated' AND
  (split_part(name, '/', 1))::uuid = auth.uid()
);

-- Policy: Users can read their own KYC documents
CREATE POLICY "Users can read their own KYC documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'kyc-documents' AND 
  auth.role() = 'authenticated' AND
  (split_part(name, '/', 1))::uuid = auth.uid()
);

-- Policy: Users can update their own KYC documents
CREATE POLICY "Users can update their own KYC documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'kyc-documents' AND 
  auth.role() = 'authenticated' AND
  (split_part(name, '/', 1))::uuid = auth.uid()
);

-- Policy: Users can delete their own KYC documents
CREATE POLICY "Users can delete their own KYC documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'kyc-documents' AND 
  auth.role() = 'authenticated' AND
  (split_part(name, '/', 1))::uuid = auth.uid()
);

-- ============================================================================
-- STORAGE PERMISSIONS
-- ============================================================================

-- Grant necessary permissions
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
