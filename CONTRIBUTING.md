# Contributing

Thanks for your interest in improving this project.

This repository powers a personal blog built with Astro, React, TypeScript, and Tailwind CSS. Contributions are welcome when they improve the site, fix bugs, or clarify documentation.

## Development Setup

Requirements:

- Node.js 24.13.0 or newer
- pnpm 11.x

Install dependencies:

```bash
pnpm install
```

Start the local development server:

```bash
pnpm dev
```

Build the site:

```bash
pnpm build
```

Run checks:

```bash
pnpm lint
```

## Pull Requests

- Keep changes focused and small.
- Prefer Astro components unless React interactivity is required.
- Follow the existing TypeScript, Astro, and Tailwind CSS patterns.
- Run `pnpm lint` before opening a pull request.
- Include screenshots or screen recordings for visible UI changes.
- Explain the user-facing behavior change in the pull request description.

## Content Changes

Most posts are personal writing. Please open an issue before proposing substantial content edits. Fixes for typos, broken links, and formatting issues are welcome.

## Commit Messages

Use Conventional Commits:

```text
fix(scope): describe the bug fix
feat(scope): describe the feature
docs(scope): update documentation
chore(scope): update tooling or dependencies
```
