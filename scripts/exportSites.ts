import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/database/supabase';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are not set.');
}

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

async function main() {
  const outDir = path.join(__dirname, '../public/sites');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Fetch all sites
  const { data: sites, error: sitesError } = await supabase
    .from('sites')
    .select('*');
  if (sitesError) throw sitesError;

  for (const site of sites) {
    // Fetch all pages for this site
    const { data: pages, error: pagesError } = await supabase
      .from('site_pages')
      .select('*')
      .eq('site_id', site.id);
    if (pagesError) throw pagesError;

    // For each page, fetch related fields
    const pagesWithFields = await Promise.all(
      pages.map(async (page) => {
        const { data: fields, error: fieldsError } = await supabase.rpc(
          'get_content_fields_for_page',
          { page_id: page.id }
        );
        if (fieldsError) throw fieldsError;
        return { ...page, fields };
      })
    );

    // Fetch all content fields for this site
    const { data: allFields, error: allFieldsError } = await supabase
      .from('content_fields')
      .select('*')
      .eq('site_id', site.id);
    if (allFieldsError) throw allFieldsError;

    // Fetch all field-page relations for this site
    const { data: relations, error: relError } = await supabase
      .from('content_field_page_relations')
      .select('content_field_id, site_page_id')
      .in(
        'content_field_id',
        allFields.map((f) => f.id)
      );
    if (relError) throw relError;
    const linkedFieldIds = new Set(relations.map((r) => r.content_field_id));

    // Content fields not related to any page
    const unlinkedFields = allFields.filter((f) => !linkedFieldIds.has(f.id));

    const exportData = {
      ...site,
      pages: pagesWithFields,
      contentFields: unlinkedFields,
    };

    const outPath = path.join(outDir, `${site.id}.json`);
    fs.writeFileSync(outPath, JSON.stringify(exportData, null, 2));
    console.log(`Exported site: ${site.id}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
