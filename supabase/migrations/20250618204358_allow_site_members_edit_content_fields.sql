-- Migration: Allow all site members to edit content fields

-- Drop the old policy if it exists
DROP POLICY IF EXISTS "Allow modify access to site creator" ON public.content_fields;

-- Create new policy to allow all site members to edit
CREATE POLICY "Allow modify access to site members" ON public.content_fields
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_site_access usa
      WHERE usa.site_id = site_id
        AND usa.user_id = auth.uid()
    )
  );
