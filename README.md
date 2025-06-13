# @broadmountain/supabase-cms-react

[![NPM Version](https://img.shields.io/npm/v/@broadmountain/supabase-cms-react)](https://www.npmjs.com/package/@broadmountain/supabase-cms-react)

A React library that provides content management capabilities for websites using Supabase as the backend. This library allows developers to add CMS functionality to their React applications with site-specific content management.

## Features

- **Site-Specific CMS**: Manage content for multiple sites from a single Supabase backend.
- **Component-Based**: A set of reusable React components (`Login`, `Signup`, `MultilineEditor`, etc.).
- **Custom Hooks**: Easy-to-use hooks (`useSupabaseCMS`) to access auth, services, and state.
- **Styling Included**: Comes with a bundled CSS file for easy setup.
- **TypeScript Ready**: Fully typed for a better developer experience.

## Installation

```bash
npm install @broadmountain/supabase-cms-react @supabase/supabase-js react react-dom
```

## Getting Started

To get started, wrap your application with the `SupabaseCMSProvider` and provide it with your Supabase credentials.

For a complete, step-by-step guide on how to integrate the library into your project, including provider setup, styling, and component usage, please see the **[Integration Guide](docs/INTEGRATION.md)**.

---

For information on contributing to this project, please see [CONTRIBUTING.md](CONTRIBUTING.md).
