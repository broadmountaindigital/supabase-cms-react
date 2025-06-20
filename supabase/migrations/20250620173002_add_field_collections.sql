-- Create field_collections table
CREATE TABLE field_collections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id uuid REFERENCES public.sites(id) ON DELETE CASCADE,
    name text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add collection_id foreign key to content_fields table
ALTER TABLE content_fields
ADD COLUMN collection_id uuid REFERENCES field_collections(id) ON DELETE SET NULL;

-- Enable RLS on field_collections table
ALTER TABLE field_collections ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read field_collections data
CREATE POLICY "Allow read access to all" ON field_collections
  FOR SELECT
  USING (true);

-- Policy: Allow all site members to modify field_collections data
CREATE POLICY "Allow modify access to site members" ON field_collections
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_site_access usa
      WHERE usa.site_id = site_id
        AND usa.user_id = auth.uid()
    )
  );

-- Create index for better performance on site_id lookups
CREATE INDEX idx_field_collections_site_id ON field_collections(site_id);

-- Create index for better performance on collection_id lookups in content_fields
CREATE INDEX idx_content_fields_collection_id ON content_fields(collection_id);
