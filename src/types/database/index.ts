import { type Database } from './supabase';

export type UserSiteAccess =
  Database['public']['Tables']['user_site_access']['Row'];
export type ContentField =
  Database['public']['Tables']['content_fields']['Row'];
export type SitePage = Database['public']['Tables']['site_pages']['Row'];
export type Site = Database['public']['Tables']['sites']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ContentFieldPageRelation =
  Database['public']['Tables']['content_field_page_relations']['Row'];
