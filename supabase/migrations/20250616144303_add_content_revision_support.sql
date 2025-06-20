-- Content Revision Support Migration
-- This migration adds comprehensive revision tracking to the content_fields system

-- Create the content_field_revisions table
CREATE TABLE content_field_revisions (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_field_id UUID NOT NULL REFERENCES content_fields(id) ON DELETE CASCADE,

  -- Revision metadata
  revision_number INTEGER NOT NULL,
  parent_revision_id UUID REFERENCES content_field_revisions(id),
  is_published BOOLEAN DEFAULT false,
  is_current BOOLEAN DEFAULT false,

  -- Content data
  field_value TEXT,
  field_value_hash TEXT, -- For deduplication and integrity

  -- Workflow and collaboration
  created_by UUID REFERENCES profiles(id),
  published_by UUID REFERENCES profiles(id),
  published_at TIMESTAMPTZ,

  -- Rich metadata for extensibility
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(content_field_id, revision_number),
  CHECK(revision_number > 0)
);

-- Create indexes for performance
CREATE INDEX idx_content_field_revisions_field_id ON content_field_revisions(content_field_id);
CREATE INDEX idx_content_field_revisions_current ON content_field_revisions(content_field_id, is_current) WHERE is_current = true;
CREATE INDEX idx_content_field_revisions_published ON content_field_revisions(content_field_id, is_published) WHERE is_published = true;
CREATE INDEX idx_content_field_revisions_created_at ON content_field_revisions(created_at);
CREATE INDEX idx_content_field_revisions_hash ON content_field_revisions(field_value_hash);

-- Enable Row Level Security
ALTER TABLE content_field_revisions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for site-based access control
CREATE POLICY "Users can access revisions for their sites" ON content_field_revisions
  FOR ALL USING (
    content_field_id IN (
      SELECT cf.id FROM content_fields cf
      INNER JOIN sites s ON cf.site_id = s.id
      INNER JOIN user_site_access usa ON s.id = usa.site_id
      WHERE usa.user_id = auth.uid()
    )
  );

-- Add revision tracking columns to existing content_fields table
ALTER TABLE content_fields
  ADD COLUMN current_revision_id UUID REFERENCES content_field_revisions(id),
  ADD COLUMN total_revisions INTEGER DEFAULT 1,
  ADD COLUMN last_published_at TIMESTAMPTZ,
  ADD COLUMN last_published_by UUID REFERENCES profiles(id);

-- Create index for revision lookups on content_fields
CREATE INDEX idx_content_fields_current_revision ON content_fields(current_revision_id);

-- Database function to create a revision for a content field
CREATE OR REPLACE FUNCTION create_content_field_revision(
  p_content_field_id UUID,
  p_field_value TEXT,
  p_created_by UUID DEFAULT auth.uid()
) RETURNS UUID AS $$
DECLARE
  v_revision_number INTEGER;
  v_field_value_hash TEXT;
  v_revision_id UUID;
BEGIN
  -- Calculate hash for deduplication
  v_field_value_hash := encode(sha256(p_field_value::bytea), 'hex');

  -- Check if we already have a revision with this exact content
  SELECT id INTO v_revision_id
  FROM content_field_revisions
  WHERE content_field_id = p_content_field_id
    AND field_value_hash = v_field_value_hash
  LIMIT 1;

  -- If we found an existing revision with same content, return its ID
  IF v_revision_id IS NOT NULL THEN
    RETURN v_revision_id;
  END IF;

  -- Get the next revision number
  SELECT COALESCE(MAX(revision_number), 0) + 1
  INTO v_revision_number
  FROM content_field_revisions
  WHERE content_field_id = p_content_field_id;

  -- Mark previous current revision as no longer current
  UPDATE content_field_revisions
  SET is_current = false, updated_at = NOW()
  WHERE content_field_id = p_content_field_id AND is_current = true;

  -- Create new revision
  INSERT INTO content_field_revisions (
    content_field_id,
    revision_number,
    field_value,
    field_value_hash,
    created_by,
    is_current
  ) VALUES (
    p_content_field_id,
    v_revision_number,
    p_field_value,
    v_field_value_hash,
    p_created_by,
    true
  ) RETURNING id INTO v_revision_id;

  -- Update content_fields with new revision info
  UPDATE content_fields
  SET
    current_revision_id = v_revision_id,
    total_revisions = v_revision_number,
    updated_at = NOW()
  WHERE id = p_content_field_id;

  RETURN v_revision_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Database function to publish a revision
CREATE OR REPLACE FUNCTION publish_content_field_revision(
  p_revision_id UUID,
  p_published_by UUID DEFAULT auth.uid()
) RETURNS BOOLEAN AS $$
DECLARE
  v_content_field_id UUID;
BEGIN
  -- Get the content field ID and update the revision
  UPDATE content_field_revisions
  SET
    is_published = true,
    published_by = p_published_by,
    published_at = NOW(),
    updated_at = NOW()
  WHERE id = p_revision_id
  RETURNING content_field_id INTO v_content_field_id;

  -- Update the content_fields table with published info
  UPDATE content_fields
  SET
    last_published_at = NOW(),
    last_published_by = p_published_by,
    updated_at = NOW()
  WHERE id = v_content_field_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Database function to rollback to a specific revision
CREATE OR REPLACE FUNCTION rollback_to_revision(
  p_revision_id UUID,
  p_created_by UUID DEFAULT auth.uid()
) RETURNS UUID AS $$
DECLARE
  v_content_field_id UUID;
  v_field_value TEXT;
  v_new_revision_id UUID;
BEGIN
  -- Get the revision data
  SELECT content_field_id, field_value
  INTO v_content_field_id, v_field_value
  FROM content_field_revisions
  WHERE id = p_revision_id;

  -- Create a new revision based on the rollback target
  SELECT create_content_field_revision(
    v_content_field_id,
    v_field_value,
    p_created_by
  ) INTO v_new_revision_id;

  -- Update the content_fields current value
  UPDATE content_fields
  SET field_value = v_field_value, updated_at = NOW()
  WHERE id = v_content_field_id;

  RETURN v_new_revision_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create initial revision when content_field is created
CREATE OR REPLACE FUNCTION create_initial_revision_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create initial revision if field_value is not null
  IF NEW.field_value IS NOT NULL THEN
    PERFORM create_content_field_revision(
      NEW.id,
      NEW.field_value,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create revision when content_field is updated
CREATE OR REPLACE FUNCTION create_update_revision_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create revision if field_value actually changed
  IF OLD.field_value IS DISTINCT FROM NEW.field_value AND NEW.field_value IS NOT NULL THEN
    PERFORM create_content_field_revision(
      NEW.id,
      NEW.field_value,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER content_field_initial_revision_trigger
  AFTER INSERT ON content_fields
  FOR EACH ROW
  EXECUTE FUNCTION create_initial_revision_trigger();

CREATE TRIGGER content_field_update_revision_trigger
  AFTER UPDATE ON content_fields
  FOR EACH ROW
  EXECUTE FUNCTION create_update_revision_trigger();

-- Grant permissions for the revision functions
GRANT EXECUTE ON FUNCTION create_content_field_revision(UUID, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION publish_content_field_revision(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION rollback_to_revision(UUID, UUID) TO authenticated;
