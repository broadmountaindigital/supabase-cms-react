# Content Revision Tracking Strategy

## Overview

This document outlines the strategy for implementing comprehensive content revision tracking in the Supabase CMS system. The approach focuses on creating a scalable, performant, and user-friendly revision system that integrates seamlessly with the existing `MultilineEditor` and content management infrastructure.

## Current Schema Analysis

### Existing `content_fields` Table

```sql
CREATE TABLE content_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_value TEXT,
  field_namespace TEXT DEFAULT 'default',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Strengths:**

- Site-aware architecture with proper foreign key constraints
- Namespace support for content organization
- Automatic timestamp tracking
- UUID-based primary keys for scalability

**Limitations for Revision Tracking:**

- No historical data preservation
- Limited metadata for content lifecycle management
- No branching or draft/published state support
- No user-specific tracking for collaborative workflows

## Proposed Revision Architecture

### Core Strategy

The revision tracking system will be implemented using a dedicated `content_field_revisions` table that maintains a complete history of all content changes while preserving the existing `content_fields` table as the "current state" reference.

### Database Schema Design

#### New `content_field_revisions` Table

```sql
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

-- Indexes for performance
CREATE INDEX idx_content_field_revisions_field_id ON content_field_revisions(content_field_id);
CREATE INDEX idx_content_field_revisions_current ON content_field_revisions(content_field_id, is_current) WHERE is_current = true;
CREATE INDEX idx_content_field_revisions_published ON content_field_revisions(content_field_id, is_published) WHERE is_published = true;
CREATE INDEX idx_content_field_revisions_created_at ON content_field_revisions(created_at);
CREATE INDEX idx_content_field_revisions_hash ON content_field_revisions(field_value_hash);

-- RLS Policies (Row Level Security)
ALTER TABLE content_field_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access revisions for their sites" ON content_field_revisions
  FOR ALL USING (
    content_field_id IN (
      SELECT cf.id FROM content_fields cf
      INNER JOIN sites s ON cf.site_id = s.id
      INNER JOIN user_site_access usa ON s.id = usa.site_id
      WHERE usa.user_id = auth.uid()
    )
  );
```

#### Enhanced `content_fields` Table

```sql
-- Add revision tracking columns to existing table
ALTER TABLE content_fields
  ADD COLUMN current_revision_id UUID REFERENCES content_field_revisions(id),
  ADD COLUMN total_revisions INTEGER DEFAULT 1,
  ADD COLUMN last_published_at TIMESTAMPTZ,
  ADD COLUMN last_published_by UUID REFERENCES profiles(id);

-- Index for revision lookups
CREATE INDEX idx_content_fields_current_revision ON content_fields(current_revision_id);
```

## Implementation Phases

### Phase 1: Core Revision Infrastructure (Foundation)

#### 1.1 Database Setup

- [x] Create a new migration with `npx supabase migration new add_content_revision_support`
- [x] Execute database migration scripts in the created file
- [x] Set up RLS policies for security
- [x] Create database functions for revision management
- [x] Add triggers for automatic revision creation
- [x] Apply migration: `npx supabase db push` (completed by user)

#### 1.2 Service Layer Implementation

- [x] Create `ContentFieldRevisionsService` class
- [x] Implement CRUD operations with revision awareness
- [x] Add revision-specific methods (create, publish, rollback)
- [x] Integrate with existing `ContentFieldsService`
- [x] Run migration and update Supabase types: `npx supabase db push` then `npx supabase gen types typescript --local > src/types/database/supabase.ts`
- [x] Fix all TypeScript linter errors and type compatibility issues

#### 1.3 Type Definitions

- [x] Create revision-related TypeScript interfaces in `src/types/`
- [x] Export all revision types from main types index
- [x] Add revision props to existing component interfaces

**Phase 1 Status: ✅ COMPLETED**

### Phase 2: Basic Revision Functionality

#### 2.1 Automatic Revision Creation

- [x] Modify save operations to create revisions automatically
- [x] Implement content deduplication using hash comparison (via database functions)
- [x] Add revision numbering logic (via database functions)
- [x] Ensure backward compatibility with existing components

#### 2.2 MultilineEditor Integration

- [x] Add optional `enableRevisions` prop to `MultilineEditor`
- [x] Integrate revision creation with existing save logic
- [x] Maintain existing conflict detection compatibility
- [x] Add revision metadata to save operations

#### 2.3 Basic Revision Retrieval

- [x] Implement revision history fetching
- [x] Add methods to get specific revision content
- [x] Create utilities for revision comparison (basic implementation)
- [x] Add revision count tracking (via database schema)

**Phase 2 Status: ✅ COMPLETED**

### Phase 3: User Interface Components

#### 3.1 Revision History Component

- [ ] Create `RevisionHistory` component
- [ ] Display chronological list of revisions
- [ ] Show revision metadata (author, date, published status)
- [ ] Implement revision selection and preview
- [ ] Add responsive design for mobile compatibility

#### 3.2 Revision Comparison Component

- [ ] Create `RevisionCompare` component
- [ ] Implement side-by-side text comparison
- [ ] Add inline diff highlighting
- [ ] Support different comparison modes (words, lines, characters)
- [ ] Add export functionality for revision reports

#### 3.3 Revision Actions

- [ ] Add rollback functionality with confirmation dialogs
- [ ] Implement revision deletion (with proper permissions)
- [ ] Add revision publishing/unpublishing controls
- [ ] Create batch revision operations

### Phase 4: Advanced Features

#### 4.1 Draft/Published Workflow

- [ ] Implement draft state management
- [ ] Add published content serving logic
- [ ] Create approval workflow hooks
- [ ] Add scheduling functionality for future publishing

#### 4.2 Branching and Merging

- [ ] Implement revision branching using `parent_revision_id`
- [ ] Add merge conflict detection and resolution
- [ ] Create branch visualization components
- [ ] Add collaborative editing support

#### 4.3 Performance Optimizations

- [ ] Implement revision archiving for old content
- [ ] Add intelligent caching strategies
- [ ] Optimize database queries with proper indexing
- [ ] Add pagination for large revision histories

## Integration with Existing Features

### Conflict Detection Enhancement

The existing conflict detection system will be enhanced to work with revisions:

```typescript
// Enhanced conflict detection with revision awareness
interface ConflictDetectionConfig {
  enabled: boolean;
  checkInterval?: number;
  strategy: 'timestamp' | 'revision' | 'both';
  revisionBased?: {
    compareWith: 'current' | 'published' | 'specific';
    specificRevisionId?: string;
  };
}
```

### Validation System Integration

Validation will be applied at the revision level:

```typescript
// Validation with revision context
interface ValidationContext {
  revisionId?: string;
  revisionNumber?: number;
  isPublished?: boolean;
  publishingUser?: string;
  previousRevision?: ContentFieldRevision;
}
```

### Offline Support Enhancement

The offline support system will be extended to handle revisions:

```typescript
// Offline revision handling
interface OfflineRevisionData {
  fieldId: string;
  content: string;
  revisionMetadata: {
    parentRevisionId?: string;
    isDraft: boolean;
    localTimestamp: number;
  };
  syncStatus: 'pending' | 'failed' | 'synced';
}
```

## Performance Considerations

### Database Optimization

- **Indexing Strategy**: Comprehensive indexes on frequently queried columns
- **Partitioning**: Consider table partitioning for sites with high revision volumes
- **Archival**: Automated archival of old revisions to maintain performance
- **Query Optimization**: Use materialized views for complex revision analytics

### Memory Management

- **Lazy Loading**: Load revision history only when requested
- **Pagination**: Implement cursor-based pagination for large revision sets
- **Caching**: Redis-based caching for frequently accessed revisions
- **Garbage Collection**: Regular cleanup of temporary revision data

### Bundle Size Impact

- **Code Splitting**: Lazy load revision components only when needed
- **Tree Shaking**: Ensure revision features can be excluded if unused
- **Progressive Enhancement**: Core functionality works without revision features
- **Optional Dependencies**: Revision-specific dependencies marked as optional

## Security and Privacy

### Access Control

- **Site-based Security**: Revisions inherit site-level access controls
- **Role-based Permissions**: Different revision actions require different roles
- **Audit Logging**: All revision operations logged for security auditing
- **Data Encryption**: Sensitive revision content encrypted at rest

### Privacy Compliance

- **Data Retention**: Configurable retention policies for revision history
- **Right to be Forgotten**: Ability to permanently delete user's revision history
- **Export Functionality**: Users can export their revision data
- **Anonymization**: Option to anonymize old revisions while preserving content

## Testing Strategy

### Unit Testing

- [ ] Service layer methods with mock database
- [ ] Component rendering with different revision states
- [ ] Utility functions for revision comparison and processing
- [ ] Error handling for edge cases and failures

### Integration Testing

- [ ] End-to-end revision creation and retrieval
- [ ] Multi-user collaboration scenarios
- [ ] Conflict resolution workflows
- [ ] Performance testing with large revision sets

### User Acceptance Testing

- [ ] Content editor workflows with revision tracking
- [ ] Publishing and approval processes
- [ ] Revision history navigation and comparison
- [ ] Mobile and accessibility compliance

## Migration Strategy

### Backward Compatibility

- **Opt-in Approach**: Revision tracking enabled via configuration
- **Graceful Degradation**: Existing functionality works without revisions
- **Progressive Rollout**: Can be enabled per site or globally
- **Data Migration**: Safe migration of existing content to revision system

### Rollback Plan

- **Feature Flags**: Ability to disable revision features quickly
- **Data Preservation**: Original data structure remains intact
- **Performance Monitoring**: Continuous monitoring during rollout
- **Rollback Procedures**: Clear procedures for reverting changes

## Success Metrics

### Performance Metrics

- **Load Time**: < 200ms for revision history loading
- **Save Time**: < 100ms overhead for revision creation
- **Memory Usage**: < 10% increase in memory footprint
- **Database Size**: Efficient storage with < 30% size increase

### User Experience Metrics

- **Adoption Rate**: Percentage of users actively using revision features
- **Time to Recovery**: Average time to rollback to previous revision
- **Error Rate**: Revision-related errors < 0.1% of operations
- **User Satisfaction**: Survey scores for revision functionality

### Business Metrics

- **Content Quality**: Reduction in content errors and rollbacks
- **Collaboration Efficiency**: Faster content approval workflows
- **System Reliability**: Reduced data loss incidents
- **Compliance**: Audit trail completeness for regulatory requirements

## Implementation Timeline

### Phase 1: Foundation (Weeks 1-2)

- Database schema implementation
- Basic service layer setup
- Type definitions and interfaces

### Phase 2: Core Features (Weeks 3-4)

- Automatic revision creation
- MultilineEditor integration
- Basic revision retrieval

### Phase 3: UI Components (Weeks 5-6)

- Revision history interface
- Comparison and diff tools
- Rollback functionality

### Phase 4: Advanced Features (Weeks 7-8)

- Draft/published workflows
- Performance optimizations
- Comprehensive testing

### Phase 5: Polish and Launch (Weeks 9-10)

- Documentation completion
- User acceptance testing
- Production deployment

## Compliance and Standards

### Technical Standards

- **TypeScript Strict Mode**: All code must pass strict type checking
- **ESLint Configuration**: Follow established linting rules
- **Testing Coverage**: Minimum 80% code coverage for revision features
- **Documentation**: Comprehensive JSDoc comments for all public APIs

### Workspace Rules Compliance

- **Declarative Code**: All implementations use declarative programming patterns
- **No Nested Ifs**: Avoid nested conditional statements in favor of early returns
- **Type Organization**: All types created in `src/types/` directory structure
- **CSS Management**: All styling in `src/index.css`, no inline styles in components
- **Component Props**: All components provide `classNames` props for styling injection

### Code Quality Standards

- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Performance**: All operations optimized for production use
- **Accessibility**: WCAG 2.1 AA compliance for all UI components
- **Security**: Secure coding practices and input validation
- **Maintainability**: Clear code structure and separation of concerns

## Conclusion

This revision tracking strategy provides a comprehensive foundation for implementing robust content versioning in the Supabase CMS system. The phased approach ensures minimal disruption to existing functionality while adding powerful new capabilities for content management and collaboration.

The implementation follows all established workspace rules and maintains backward compatibility while providing a clear path for future enhancements. The architecture is designed to scale with growing content volumes and user bases while maintaining excellent performance and user experience.
