# Contributing to EsportSimulator

Thanks for your interest in improving EsportSimulator.

## Before You Start

- Read the [Code of Conduct](./CODE_OF_CONDUCT.md).
- Review open issues to avoid duplicate work.
- If your change is large, open an issue first to discuss scope.

## Local Setup

Use commands that already exist in this repository:

```bash
bun install
bun run dev
bun run lint
bun run build
```

(You can also use `npm install` / `npm run <script>` if preferred.)

## Issue Workflow

- Use issue templates for bugs and feature requests.
- Provide clear reproduction steps for bugs.
- Include environment details and expected vs actual behavior.

## Pull Request Workflow

1. Create a focused branch from `main`.
2. Keep changes scoped to a single concern.
3. Run relevant checks (`bun run lint`, and build when applicable).
4. Open a pull request using the PR template.
5. Respond to review feedback and keep discussion constructive.

## Quality Expectations

- Keep code and docs changes clear and minimal.
- Avoid unrelated refactors in the same PR.
- Update docs when behavior or workflows change.

## Security, Secrets, and Asset Licensing

- Never commit secrets (API keys, tokens, passwords, private certificates, `.env` files with real credentials).
- Use only assets and dependencies with clear redistribution rights.
- Add attribution/license details in PR descriptions for third-party material.

## Conduct and Enforcement

Participation is governed by [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md). By contributing, you agree to follow it.
