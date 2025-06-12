# Supabase CMS - React Library

A React library that provides content management capabilities for websites using Supabase as the backend. This library allows developers to add CMS functionality to their React applications with site-specific content management.

## Development Workflow

### Current State

This project is being converted from a standalone React application into a reusable NPM package. The development workflow is structured around this transformation.

### Development Phases

#### Phase 1: Package Structure & Build Setup

- [ ] Configure package.json for library publishing
- [ ] Set up Vite library build configuration
- [ ] Create entry points and exports
- [ ] Configure TypeScript for library builds

#### Phase 2: Provider Architecture

- [ ] Implement site-aware provider with Redux integration
- [ ] Create context and hooks for site-specific functionality
- [ ] Refactor services to be site-aware

#### Phase 3: Component Export & Integration

- [ ] Refactor components for library use
- [ ] Implement styling strategy
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
```

### Key Components

- **MultilineEditor**: A content editor component that integrates with the CMS
- **SupabaseCMSProvider**: Main provider that wraps Redux store with site context
- **Services**: Site-aware services for content management
- **Hooks**: Custom hooks for accessing CMS functionality

### Architecture

The library uses a provider pattern where:

1. `SupabaseCMSProvider` wraps the consuming application
2. Site-specific context is provided to all child components
3. Components access Redux store and services through hooks
4. All content is filtered by the provided `siteId`

### Integration Example

```tsx
import { SupabaseCMSProvider, MultilineEditor } from '@your-org/supabase-cms';

function App() {
  return (
    <SupabaseCMSProvider
      siteId="your-site-uuid"
      supabaseUrl="your-supabase-url"
      supabaseAnonKey="your-supabase-anon-key"
    >
      <div>
        <h1>Your Website</h1>
        <MultilineEditor
          defaultValue="Your content here"
          onChange={(value) => console.log(value)}
        />
      </div>
    </SupabaseCMSProvider>
  );
}
```

---

## Original Vite Template Information

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```
