# Contributing Guide

Thanks for your interest in contributing to BandsTour (Topogram fork)!

## Development setup

- Install Meteor (see meteor.com) and Node LTS 20 for tooling (`nvm use` in `topogram/`).
- Install deps: `meteor npm install` in `topogram/`.
- Run: `meteor --port 3020`.

## Branching and commits

- Use feature branches from `main`.
- Prefer Conventional Commits for messages:
  - `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `perf:`, `test:`
  - Scope when useful, e.g., `feat(network): ...`
- Open PRs against `main` with a clear description and screenshots/GIFs for UI.

## Coding guidelines

- React 18 + MUI v5; prefer function components unless class-based is required.
- Ensure Cytoscape/Leaflet interactions do not block the main thread; batch updates.
- Keep i18n keys in `i18n/*.json` and use `react-intl`.
- Lint: `npm run lint` and fix warnings if feasible.

## Tests

- Add/update unit tests where applicable.
- For Meteor integration tests, use the existing specs harness.

## Releases

- Maintain `CHANGELOG.md` and version bumps in `package.json`.
- For V4/V5 lines, also update `CHANGELOG_V.4.md` and release notes.

## Security

- Do not commit secrets. Use environment variables for tokens/URLs.

