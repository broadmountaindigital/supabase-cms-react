import type { SiteRow, SitePageRow, ContentFieldRow } from './database';

export type ExportedPage = SitePageRow & {
  fields: ContentFieldRow[];
};

export interface ExportedSite {
  site: SiteRow & {
    pages: ExportedPage[];
    contentFields: ContentFieldRow[];
  };
}
