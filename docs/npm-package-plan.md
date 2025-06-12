# NPM Package Development Plan

## Overview

Convert the current Supabase CMS application into a reusable NPM package that can be installed into other React applications, allowing developers to add content management capabilities to their websites.

## Architecture Goals

- [ ] Create a library build system that exports components and providers
- [ ] Implement a site-specific provider that wraps Redux store with site_id context
- [ ] Ensure components work seamlessly in consuming applications
- [ ] Maintain type safety and provide comprehensive TypeScript definitions
- [ ] Create a clean API for developers to integrate the CMS

## Phase 1: Package Structure & Build Setup

### 1.1 Package Configuration

- [ ] Update `package.json` for library publishing
  - [ ] Change `"private": true` to `false`
  - [ ] Add `"main"`, `"module"`, `"types"`, and `"exports"` fields
  - [ ] Add `"files"` field to specify what gets published
  - [ ] Update package name to something like `@your-org/supabase-cms`
  - [ ] Add `"peerDependencies"` for React, Redux, etc.
  - [ ] Move development dependencies to `devDependencies`

### 1.2 Build System

- [ ] Configure Vite for library builds
  - [ ] Create `vite.lib.config.ts` for library-specific build
  - [ ] Set up proper entry points for different module formats
  - [ ] Configure external dependencies
  - [ ] Set up CSS extraction and bundling
- [ ] Add build scripts to `package.json`
  - [ ] `"build:lib"` for library build
  - [ ] `"build:types"` for TypeScript declarations
  - [ ] `"prepublishOnly"` for pre-publish checks

### 1.3 Entry Points

- [ ] Create main entry point (`src/index.ts`)
  - [ ] Export all public components
  - [ ] Export providers and hooks
  - [ ] Export types and interfaces
- [ ] Create separate entry points for different use cases
  - [ ] Components-only bundle
  - [ ] Full CMS bundle with providers

## Phase 2: Provider Architecture

### 2.1 Site-Aware Provider

- [ ] Create `SupabaseCMSProvider` component
  - [ ] Accept `siteId` prop (UUID)
  - [ ] Accept `supabaseUrl` and `supabaseAnonKey` props
  - [ ] Wrap Redux Provider with site context
  - [ ] Initialize Supabase client with provided credentials
  - [ ] Set up site-specific Redux store

### 2.2 Context & Hooks

- [ ] Create `SiteContext` for site_id propagation
  - [ ] Provide site_id to all child components
  - [ ] Create `useSiteId()` hook for components
- [ ] Create `useSupabaseCMS()` hook
  - [ ] Access to site-specific services
  - [ ] Access to Redux store
  - [ ] Access to authentication state

### 2.3 Service Layer Refactoring

- [ ] Refactor services to be site-aware
  - [ ] Modify all services to accept site_id parameter
  - [ ] Update database queries to filter by site_id
  - [ ] Create service factory pattern for site-specific instances
- [ ] Create service hooks
  - [ ] `useSitesService()`
  - [ ] `useContentFieldsService()`
  - [ ] `useSitePagesService()`
  - [ ] `useProfilesService()`

## Phase 3: Component Export & Integration

### 3.1 Component Refactoring

- [ ] Refactor `MultilineEditor` for library use
  - [ ] Remove direct Redux dependencies
  - [ ] Use context/hooks for state access
  - [ ] Ensure it works in consuming applications
- [ ] Refactor other components for library use
  - [ ] `Login`, `Signup`, `Profile` components
  - [ ] `Settings` component for edit mode toggle
  - [ ] Any other components to be exported

### 3.2 Styling Strategy

- [ ] Decide on CSS/styling approach
  - [ ] Option A: Include Tailwind CSS classes (requires Tailwind in consuming app)
  - [ ] Option B: Bundle CSS with components
  - [ ] Option C: CSS-in-JS solution
  - [ ] Option D: CSS modules with bundled styles
- [ ] Create styling documentation for consumers

### 3.3 Type Definitions

- [ ] Export comprehensive TypeScript types
  - [ ] Component prop interfaces
  - [ ] Service interfaces
  - [ ] Redux state types
  - [ ] Database types (from Supabase)
- [ ] Create type declaration files
- [ ] Ensure all exports are properly typed

## Phase 4: Documentation & Examples

### 4.1 API Documentation

- [ ] Create comprehensive README
  - [ ] Installation instructions
  - [ ] Basic usage examples
  - [ ] Provider setup guide
  - [ ] Component API documentation
- [ ] Create TypeDoc documentation
- [ ] Add JSDoc comments to all exported functions/components

### 4.2 Example Applications

- [ ] Create example React application
  - [ ] Show basic integration
  - [ ] Demonstrate MultilineEditor usage
  - [ ] Show edit mode functionality
- [ ] Create CodeSandbox examples
- [ ] Create Storybook stories for components

### 4.3 Integration Guide

- [ ] Step-by-step integration guide
  - [ ] Provider setup
  - [ ] Component usage
  - [ ] Styling integration
  - [ ] Authentication flow
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

1. Package configuration and build setup
2. Site-aware provider implementation
3. MultilineEditor component export
4. Basic documentation and examples

### Medium Priority

1. Additional component exports
2. Comprehensive testing
3. Advanced configuration options
4. Plugin system design

### Low Priority (Future)

1. Advanced features
2. Performance optimizations
3. Additional integrations

## Success Criteria

- [ ] Package can be installed via npm/yarn
- [ ] Components work in consuming React applications
- [ ] Site-specific content management works correctly
- [ ] TypeScript support is comprehensive
- [ ] Documentation is clear and complete
- [ ] Examples demonstrate real-world usage
