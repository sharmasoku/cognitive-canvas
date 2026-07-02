-- Add shipping tracking columns to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS carrier text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number text;

-- Create storage bucket for admin uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'admin-assets',
  'admin-assets',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for admin-assets bucket
-- Note: storage.objects RLS policies target bucket_id

-- 1. Public Read Access
DROP POLICY IF EXISTS "Public Access for admin-assets" ON storage.objects;
CREATE POLICY "Public Access for admin-assets" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'admin-assets');

-- 2. Admin Insert/Upload Access
DROP POLICY IF EXISTS "Admin Upload to admin-assets" ON storage.objects;
CREATE POLICY "Admin Upload to admin-assets" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'admin-assets'
    AND public.has_role(auth.uid(), 'admin')
  );

-- 3. Admin Delete Access
DROP POLICY IF EXISTS "Admin Delete from admin-assets" ON storage.objects;
CREATE POLICY "Admin Delete from admin-assets" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'admin-assets'
    AND public.has_role(auth.uid(), 'admin')
  );
