import type { Database } from './supabase';

// Sites
export type SiteRow = Database['public']['Tables']['sites']['Row'];
export type SiteInsert = Database['public']['Tables']['sites']['Insert'];
export type SiteUpdate = Database['public']['Tables']['sites']['Update'];

// Content Fields
export type ContentFieldRow =
  Database['public']['Tables']['content_fields']['Row'];
export type ContentFieldInsert =
  Database['public']['Tables']['content_fields']['Insert'];
export type ContentFieldUpdate =
  Database['public']['Tables']['content_fields']['Update'];

// Site Pages
export type SitePageRow = Database['public']['Tables']['site_pages']['Row'];
export type SitePageInsert =
  Database['public']['Tables']['site_pages']['Insert'];
export type SitePageUpdate =
  Database['public']['Tables']['site_pages']['Update'];

// Profiles
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type UserSiteAccess =
  Database['public']['Tables']['user_site_access']['Row'];
export type ContentFieldPageRelation =
  Database['public']['Tables']['content_field_page_relations']['Row'];
