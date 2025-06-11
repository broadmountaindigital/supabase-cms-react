import type { Site, SitePage, ContentField } from './database';

export type ExportedPage = SitePage & {
  fields: ContentField[];
};

export interface ExportedSite {
  site: Site & {
    pages: ExportedPage[];
    contentFields: ContentField[];
  };
}
