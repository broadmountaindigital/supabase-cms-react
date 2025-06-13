# NPM Package Development Plan

## Overview

Convert the current Supabase CMS application into a reusable NPM package that can be installed into other React applications, allowing developers to add content management capabilities to their websites.

## Architecture Goals

- [ ] Create a library build system that exports components and providers
- [ ] Implement a site-specific provider that wraps Redux store with site_id context
- [ ] Ensure components work seamlessly in consuming applications
- [ ] Maintain type safety and provide comprehensive TypeScript definitions
- [ ] Create a clean API for developers to integrate the CMS

## Phase 1: Package Structure & Build Setup ✅

### 1.1 Package Configuration ✅

- [x] Update `package.json` for library publishing
  - [x] Change `"private": true` to `false`
  - [x] Add `"main"`, `"module"`, `"types"`, and `"exports"` fields
  - [x] Add `"files"` field to specify what gets published
  - [x] Update package name to something like `@your-org/supabase-cms`
  - [x] Add `"peerDependencies"` for React, Redux, etc.
  - [x] Move development dependencies to `devDependencies`

### 1.2 Build System ✅

- [x] Configure Vite for library builds
  - [x] Create `vite.lib.config.ts` for library-specific build
  - [x] Set up proper entry points for different module formats
  - [x] Configure external dependencies
  - [x] Set up CSS extraction and bundling ✅
- [x] Add build scripts to `package.json`
  - [x] `"build:lib"` for library build
  - [x] `"build:types"` for TypeScript declarations
  - [x] `"prepublishOnly"` for pre-publish checks

### 1.3 Entry Points ✅

- [x] Create main entry point (`src/index.ts`)
  - [x] Export all public components
  - [x] Export providers and hooks
  - [x] Export types and interfaces
- [x] Create separate entry points for different use cases
  - [x] Components-only bundle
  - [x] Full CMS bundle with providers

## Phase 2: Provider Architecture ✅

### 2.1 Site-Aware Provider ✅

- [x] Create `SupabaseCMSProvider` component
  - [x] Accept `siteId` prop (UUID)
  - [x] Accept `supabaseUrl` and `supabaseAnonKey` props
  - [x] Wrap Redux Provider with site context
  - [x] Initialize Supabase client with provided credentials
  - [x] Set up site-specific Redux store

### 2.2 Context & Hooks ✅

- [x] Create `SiteContext` for site_id propagation
  - [x] Provide site_id to all child components
  - [x] Create `useSiteId()` hook for components
- [x] Create `useSupabaseCMS()` hook
  - [x] Access to site-specific services
  - [x] Access to Redux store
  - [x] Access to authentication state

### 2.3 Service Layer Refactoring ✅

- [x] Refactor services to be site-aware
  - [x] Modify all services to accept site_id parameter
  - [x] Update database queries to filter by site_id
  - [x] Create service factory pattern for site-specific instances
- [x] Create service hooks
  - [x] `useSitesService()`
  - [x] `useContentFieldsService()`
  - [x] `useSitePagesService()`
  - [x] `useProfilesService()`

## Phase 3: Component Export & Integration

### 3.1 Component Refactoring

- [x] Refactor `MultilineEditor` for library use ✅
  - [x] Remove direct Redux dependencies
  - [x] Use context/hooks for state access
  - [x] Ensure it works in consuming applications
- [x] Refactor other components for library use ✅
  - [x] `Login`, `Signup`, `Profile` components
  - [x] `Settings` component for edit mode toggle
  - [ ] Any other components to be exported

### 3.2 Styling Strategy

- [x] Decide on CSS/styling approach ✅
  - [ ] Option A: Include Tailwind CSS classes (requires Tailwind in consuming app)
  - [x] Option B: Bundle CSS with components (Selected)
  - [ ] Option C: CSS-in-JS solution
  - [ ] Option D: CSS modules with bundled styles
- [x] Create styling documentation for consumers ✅

### 3.3 Type Definitions ✅

- [x] Export comprehensive TypeScript types
  - [x] Component prop interfaces
  - [x] Service interfaces
  - [x] ~~Redux state types~~ (Obsolete)
  - [x] Database types (from Supabase)
- [x] Create type declaration files
- [x] Ensure all exports are properly typed

## Phase 4: Documentation & Examples

### 4.1 API Documentation ✅

- [x] Create comprehensive README
  - [x] Installation instructions
  - [x] Basic usage examples
  - [x] Provider setup guide
  - [x] Component API documentation
- [x] Create TypeDoc documentation
- [x] Add JSDoc comments to all exported functions/components ✅

### 4.2 Example Applications

- [x] Create example React application
  - [x] Show basic integration
  - [x] Demonstrate MultilineEditor usage
  - [x] Show edit mode functionality

### 4.3 Integration Guide ✅

- [x] Step-by-step integration guide
  - [x] Provider setup
  - [x] Component usage
  - [x] Styling integration
  - [x] Authentication flow
- [ ] Troubleshooting guide
- [ ] Migration guide for existing applications

## Phase 5: Testing & Quality Assurance

### 5.1 Testing Strategy

- [ ] Set up testing framework
  - [ ] Jest/Vitest configuration
  - [ ] React Testing Library setup
  - [ ] Mock Supabase client
- [ ] Write unit tests for components
- [ ] Write integration tests for providers
- [ ] Write tests for services

### 5.2 Build & Publish Process

- [ ] Set up CI/CD pipeline
  - [ ] Automated testing
  - [ ] Automated builds
  - [ ] Automated publishing
- [ ] Create release workflow
  - [ ] Version bumping
  - [ ] Changelog generation
  - [ ] NPM publishing

## Phase 6: Advanced Features

### 6.1 Configuration Options

- [ ] Add configuration options to provider
  - [ ] Custom styling options
  - [ ] Feature flags
  - [ ] Custom authentication flow
  - [ ] Custom content validation
- [ ] Create configuration interface

### 6.2 Plugin System (Future)

- [ ] Design plugin architecture
  - [ ] Custom field types
  - [ ] Custom validation rules
  - [ ] Custom UI components
- [ ] Create plugin development guide

## Implementation Priority

### High Priority (MVP)

1. ✅ Package configuration and build setup
2. Site-aware provider implementation
3. ✅ MultilineEditor component export
4. Basic documentation and examples

### Medium Priority

1. ✅ Additional component exports
2. Comprehensive testing
3. Advanced configuration options
4. Plugin system design

### Low Priority (Future)

1. Advanced features
2. Performance optimizations
3. Additional integrations

## Success Criteria

- [x] Package can be installed via npm/yarn
- [x] Components work in consuming React applications
- [ ] Site-specific content management works correctly
- [x] TypeScript support is comprehensive
- [ ] Documentation is clear and complete
- [ ] Examples demonstrate real-world usage
