# Contributing to Supabase CMS - React Library

We welcome contributions to this project! Please follow these guidelines to ensure a smooth development process.

## Development Workflow

### Current State

This project is being converted from a standalone React application into a reusable NPM package. The development workflow is structured around this transformation.

### Development Phases

#### Phase 1: Package Structure & Build Setup

- [x] Configure package.json for library publishing
- [x] Set up Vite library build configuration
- [x] Create entry points and exports
- [x] Configure TypeScript for library builds

#### Phase 2: Provider Architecture

- [x] Implement site-aware provider with Redux integration
- [x] Create context and hooks for site-specific functionality
- [x] Refactor services to be site-aware

#### Phase 3: Component Export & Integration

- [x] Refactor components for library use
- [x] Implement styling strategy
- [ ] Export comprehensive TypeScript types

#### Phase 4: Documentation & Examples

- [ ] Create comprehensive documentation
- [ ] Build example applications
- [ ] Write integration guides

#### Phase 5: Testing & Quality Assurance

- [ ] Set up testing framework
- [ ] Write unit and integration tests
- [ ] Set up CI/CD pipeline

### Development Commands

```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run build:lib             # Build library package
npm run lint                  # Run ESLint
npm run types:supabase        # Generate Supabase types

# Testing (to be added)
npm run test                  # Run unit tests
npm run test:watch           # Run tests in watch mode
npm run test:coverage        # Run tests with coverage

# Publishing (to be added)
npm run prepublishOnly       # Pre-publish checks
npm run release              # Release new version
