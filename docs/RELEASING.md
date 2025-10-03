# Releasing

This guide explains how to prepare and publish a release.

## Branching

- Create a dedicated release prep branch, e.g., `releasev.5_prepare`.
- Aggregate and commit final changes (docs, version bumps, changelog).

## Changelogs

- Update `CHANGELOG.md` (short) and the versioned changelog (e.g., `CHANGELOG_V.4.md`).
- Categorize entries by Conventional Commit types: feat, fix, chore, docs, perf, refactor.

## PR and tagging

- Open a PR against `main` with a detailed description and links to docs.
- After merge, create a tag: `git tag -a V4.0 -m "Release V4.0" && git push --tags`.
- Update README badges if needed.

## Post-release

- Announce highlights and link to changelogs.
- Create an issue with next milestones/tasks if applicable.

