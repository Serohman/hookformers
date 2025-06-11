# Template: NPM Package

This is a [template repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template) which you can use to quickly bootstrap your own NPM package.

## Features

- **Static Typing**: Uses [TypeScript](https://www.typescriptlang.org/) for improved type safety and a better developer experience
- **Testing**: Pre-configured [Jest](https://jestjs.io/) setup for writing and running unit tests efficiently
- **Linting**: Leverages [ESLint](https://eslint.org/) to catch potential bugs and enforce coding standards
- **Auto-Formatting**: Ensures consistent code style with automated formatting using [Prettier](https://prettier.io/)
- **Continuous Integration (CI)**: Pre-configured [GitHub Actions](https://docs.github.com/en/actions) for linting, testing, building, and formatting in CI environments
- **Git Hooks**: [Husky](https://typicode.github.io/husky/)-managed Git hooks to run scripts before commits, pushes, and other Git actions, ensuring code quality
- **Automated Publishing**: Uses [Semantic Release](https://semantic-release.gitbook.io/semantic-release) to automate package versioning and publishing.

## Table of Contents

- [Quick Start](#quick-start)
  - [Clone the template](#1-clone-the-template)
  - [Set Up NPM Authentication](#2-set-up-npm-authentication)
  - [Install dependencies](#3-install-dependencies)
  - [Set package metadata](#4-set-package-metadata)
  - [Publish your package](#5-publish-your-package)
- [Available NPM Scripts](#available-npm-scripts)

## Quick Start

#### 1. Clone the template

The fastest way is to use GitHub CLI:

```bash
# Create a new repository using a template and clone it
gh repo create new-repo-name --template serohman/npm-typescript-module
gh repo clone new-repo-name
```

Or refer to the [official guide](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/creating-a-repository-from-a-template) for creating repositories from a template.

#### 2. Set up NPM authentication

You need to generate an [NPM access token](https://docs.npmjs.com/about-access-tokens) and save it as a [GitHub Action Secret](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions), under the key name `NPM_TOKEN`

Use GitHub CLI

```bash
# A prompt for entering the npm token will appear
gh secret set NPM_TOKEN
```

Or set the secret via the web UI by navigating to your repository's GitHub page, and then: `Settings > Secrets and variables > Actions > New repository secret`.

#### 3. Install dependencies

```bash
npm install
```

#### 4. Set package metadata

Open `package.json` and fill out all the relevant fields:

- `name`
- `author`
- `description`
- `tags`
- `license`
- `publishConfig.access` (Set to `private` to make your package private)

#### 5. Publish your package

To publish your package, switch to the `release` branch, then create and push a [semantic commit](https://github.com/semantic-release/semantic-release?tab=readme-ov-file#commit-message-format) with the changes you've made to `package.json`. Once the changes are pushed, GitHub Actions will automatically publish your package.

```bash
git checkout -b "release"
git stage .
git commit -m "feat: Setup package"
git push --set-upstream origin release
```

And voilà!🎉 The moment new changes hit the release branch, GitHub Actions will pick them up and publish a new release on NPM.

## Available NPM Scripts

#### General

These commands are used during the development process to build, test, lint, and format the code.

- `start`: Runs the `build` script.
- `build`: Compiles the TypeScript code and watches for changes.
- `test`: Runs Jest in watch mode.
- `lint`: Runs ESLint on the `./src` directory.
- `format`: Formats the code in the `./src` directory using Prettier.

#### Precommit Hooks

These commands are executed before a commit is made to ensure code quality and consistency. They check for issues in the staged files, attempt to fix them automatically (using the --fix flag), and display an error if the issues cannot be fixed. If any problems remain unresolved, the commit is prevented.

- `precommit`: Runs lint-staged to check staged files.
- `precommit:format`: Formats staged files using Prettier.
- `precommit:lint`: Fixes linting issues in staged files using ESLint.
- `precommit:test`: Runs Jest on related tests for staged files.
- `precommit:typecheck`: Type checks the code without emitting output.

#### Continuous Integration

These commands are executed by GitHub Actions on the `release` branch. Each time a change is pushed to the `release` branch, these actions are triggered. If any action fails, the release process is halted until the issues are resolved.

- `ci:lint`: Runs ESLint with a CI-specific configuration.
- `ci:test`: Runs Jest with a CI-specific configuration.
- `ci:build`: Builds the TypeScript project.
- `ci:format`: Checks code formatting using Prettier.

---
