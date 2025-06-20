# [1.4.0](https://github.com/broadmountaindigital/supabase-cms-react/compare/v1.3.0...v1.4.0) (2025-06-20)


### Features

* add fieldName to TextInputProps ([ee792a8](https://github.com/broadmountaindigital/supabase-cms-react/commit/ee792a8a14aef5f14be7e899aea1b53810ccbac9))
* add general rules for project structure and CSS handling ([0a9716e](https://github.com/broadmountaindigital/supabase-cms-react/commit/0a9716e0365f686894e94e768ea0673a8f53a7c4))
* add getByFieldName method to retrieve content field by field name ([c189eef](https://github.com/broadmountaindigital/supabase-cms-react/commit/c189eefaec8a72f748fbb09ff0e5b8ebe2f9976f))
* add SiteRoleIndicator component and useUserSiteRole hook for user role management ([a5bb48c](https://github.com/broadmountaindigital/supabase-cms-react/commit/a5bb48c7bd5b8bbd5f0496cea2b3a0621d4fa7c0))
* bundle library component styles ([503f035](https://github.com/broadmountaindigital/supabase-cms-react/commit/503f035754e8f631ce61964399a7cba677c85399))
* enhance MultilineEditor to fetch and save content dynamically ([37b8cbd](https://github.com/broadmountaindigital/supabase-cms-react/commit/37b8cbd2f7b0bd4a33d6689ceb60321f017f6e83))
* enhance MultilineEditor with validation, conflict detection, and offline support features ([ea3e578](https://github.com/broadmountaindigital/supabase-cms-react/commit/ea3e578e40694769cdc4adb31b79cb84e61c8c23))
* enhance save button and indicator layout in MultilineEditor for improved user experience ([27a6797](https://github.com/broadmountaindigital/supabase-cms-react/commit/27a679744b92048ddf958002bd7c37f8cfd15add))
* implement content revision tracking system with database schema, service methods, and integration into content fields ([5c64f6d](https://github.com/broadmountaindigital/supabase-cms-react/commit/5c64f6db8a15fa85d06248092bdf9ee04549a84c))
* integrate useUserSiteRole hook into Settings component for user role management ([1e46ba7](https://github.com/broadmountaindigital/supabase-cms-react/commit/1e46ba7aa79bacaab0f0d513b1b5c3717bf88a32))
* introduce SkeletonLoader component and enhance MultilineEditor with debounced saving and loading indicators ([02d3896](https://github.com/broadmountaindigital/supabase-cms-react/commit/02d3896138ad5629ca908926b8766208e0082ca5))
* simplify how saving works in the app ([dd208e3](https://github.com/broadmountaindigital/supabase-cms-react/commit/dd208e38f949f280d7f6dcdccafc30260e2c5c3b))
* update pending state text in MultilineEditor from 'Saving...' to 'Editing...' ([6b4cd41](https://github.com/broadmountaindigital/supabase-cms-react/commit/6b4cd417d14bfffd1dd37a07444a374f5e640d05))

# [1.3.0](https://github.com/broadmountaindigital/supabase-cms-react/compare/v1.2.0...v1.3.0) (2025-06-13)


### Features

* fix multiline editor sizing in edit mode ([8ade5a9](https://github.com/broadmountaindigital/supabase-cms-react/commit/8ade5a94ce1353b26e5181f43eb7c5fe9a4aac3c))

# [1.2.0](https://github.com/broadmountaindigital/supabase-cms-react/compare/v1.1.3...v1.2.0) (2025-06-13)


### Features

* add CSS class props to library components ([69955f5](https://github.com/broadmountaindigital/supabase-cms-react/commit/69955f58d096d121b9f679a0b051c0c2d3a9be5a))
* implement Supabase CMS with routing and authentication features ([3ec9d37](https://github.com/broadmountaindigital/supabase-cms-react/commit/3ec9d3730a8eb20f329e3cdf3341f1e56b2ea58f))

## [1.1.3](https://github.com/broadmountaindigital/supabase-cms-react/compare/v1.1.2...v1.1.3) (2025-06-13)


### Bug Fixes

* update project title in README to match package name ([b2420e3](https://github.com/broadmountaindigital/supabase-cms-react/commit/b2420e31067eb5c7b2ae83c9de6992be84381a35))

## [1.1.2](https://github.com/broadmountaindigital/a-supabase-cms/compare/v1.1.1...v1.1.2) (2025-06-13)

### Bug Fixes

- update Node.js version to 22.x in GitHub Actions workflow ([f48b3bc](https://github.com/broadmountaindigital/a-supabase-cms/commit/f48b3bc33bebf5e105a0fd0d2f1feef75bef0569))

## [1.1.1](https://github.com/broadmountaindigital/a-supabase-cms/compare/v1.1.0...v1.1.1) (2025-06-13)

### Bug Fixes

- remove redux references from app ([42b057a](https://github.com/broadmountaindigital/a-supabase-cms/commit/42b057a28f1f0699455d240689ea7b153566d906))

# [1.1.0](https://github.com/broadmountaindigital/a-supabase-cms/compare/v1.0.0...v1.1.0) (2025-06-13)

### Features

- **release:** configure automated publishing for [@broadmountain](https://github.com/broadmountain) ([38b90a9](https://github.com/broadmountaindigital/a-supabase-cms/commit/38b90a9beadea982819e555cbce4b657dd0d984c))

# 1.0.0 (2025-06-13)

### Features

- add base supabase schema ([69c76ca](https://github.com/broadmountaindigital/a-supabase-cms/commit/69c76ca9f81e237701f013816f87d448c80e6647))
- add basic content services ([1f8d87b](https://github.com/broadmountaindigital/a-supabase-cms/commit/1f8d87b678083567ad6d8bc6b24c9f6b1a5c83be))
- add content_field_page_relations table ([d0e78e0](https://github.com/broadmountaindigital/a-supabase-cms/commit/d0e78e054d36f8ea417da8200fb0d4090bedd674))
- add CONTRIBUTING.md and update README.md with installation and usage instructions ([4625a93](https://github.com/broadmountaindigital/a-supabase-cms/commit/4625a9319af21e737b1d7b7ee3c5541d392aee15))
- add Navbar component and enhance Login component with user redirection ([c1f34ee](https://github.com/broadmountaindigital/a-supabase-cms/commit/c1f34ee82ca7a809e13f759d131103493fe62572))
- add Supabase CMS integration guide and update npm package plan with completed tasks ([f75738c](https://github.com/broadmountaindigital/a-supabase-cms/commit/f75738cd24eea92a3154425f17d8c82819935092))
- basic linter rules ([74874c5](https://github.com/broadmountaindigital/a-supabase-cms/commit/74874c5d9da1f59b17991f76b663a2371cf06adb))
- enhance documentation and improve component props ([813822e](https://github.com/broadmountaindigital/a-supabase-cms/commit/813822ebff0bc81ae086bf47935c49cadcf9c7ef))
- enhance NPM package with Tailwind CSS integration and update MultilineEditor component ([84cc7d2](https://github.com/broadmountaindigital/a-supabase-cms/commit/84cc7d28871a27a9103e74edcc363a0d46cf2638))
- export component props interfaces for Login, Signup, Profile, and MultilineEditor; update type definitions in index.ts ([3c1d51c](https://github.com/broadmountaindigital/a-supabase-cms/commit/3c1d51c020b1106b6a5b6c47da177c23e64f9534))
- implement custom hooks and services for Supabase CMS ([b1109e5](https://github.com/broadmountaindigital/a-supabase-cms/commit/b1109e5b84d1ba24afdaf407fc08b8da3f38fc5d))
- implement site export functionality with related pages and content fields ([7e72afc](https://github.com/broadmountaindigital/a-supabase-cms/commit/7e72afcb9932da464a459c87e3512f4e65b79e68))
- implement user authentication flow with signup, login, and profile components ([b09822d](https://github.com/broadmountaindigital/a-supabase-cms/commit/b09822d31319783a3b3ae70657fb51f5f7df8c8d))
- initialize example project with Supabase CMS integration ([10a9b7c](https://github.com/broadmountaindigital/a-supabase-cms/commit/10a9b7c045bcf416b1da59ba4335a8325edb8979))
- integrate Redux for editing mode management and add Settings component ([846ad29](https://github.com/broadmountaindigital/a-supabase-cms/commit/846ad2975f5277f60575055aa1125bb56e491b1b))
- refactor authentication components to use Supabase hooks and improve user handling ([f5f1f32](https://github.com/broadmountaindigital/a-supabase-cms/commit/f5f1f321eb61fe05fb9027d38ce035798ae41742))
