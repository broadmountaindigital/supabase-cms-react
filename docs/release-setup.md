# Plan: Configure Automatic Release Management

This project is already configured with `semantic-release`. This plan outlines the final steps to enable fully automated release management using GitHub Actions.

## Checklist

- [ ] **Create GitHub Actions Workflow:**

  - [ ] Create a new workflow file at `.github/workflows/release.yml`.
  - [ ] Add a job that runs on every push to the `main` branch.
  - [ ] The job will check out the code, set up Node.js, install dependencies, and run the `npm run release` command.

- [ ] **Configure GitHub Repository Secrets:**

  - [ ] Explain the need for `NPM_TOKEN` and `GH_TOKEN` secrets in the GitHub repository settings.
  - [ ] Provide instructions on how to generate these tokens.

- [ ] **Merge and Release:**
  - [ ] Once the workflow file is merged into `main`, the next commit that follows the [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/) (e.g., `feat: ...`, `fix: ...`) will trigger the first automatic release.

## GitHub Actions Workflow (`.github/workflows/release.yml`)

```yaml
name: Release

on:
  push:
    branches:
      - main

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 'lts/*'
      - name: Install dependencies
        run: npm ci
      - name: Release
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: npm run release
```

## Required Secrets

For `semantic-release` to publish to npm and create GitHub releases, you must configure the following secrets in your GitHub repository under **Settings > Secrets and variables > Actions**:

1.  **`NPM_TOKEN`**: An access token for your npm account. [Generate a new token](https://docs.npmjs.com/creating-and-viewing-access-tokens) with "Automation" permissions.
2.  **`GITHUB_TOKEN`**: A GitHub personal access token. The default `secrets.GITHUB_TOKEN` provided by GitHub Actions has read-only permissions. For `semantic-release` to create releases and push changes back to the repository, you need to provide a token with `repo` and `workflow` scopes. [Generate a new personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).
