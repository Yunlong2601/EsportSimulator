# Security Policy

## Reporting a Vulnerability

Please **do not report security vulnerabilities publicly** in issues, pull requests, or discussions.

Preferred process:

1. Use GitHub **Private vulnerability reporting** for this repository, if available.
2. If private reporting is not available, contact the repository owner directly through GitHub profile/repository contact channels.
3. Include clear reproduction steps, impact, and any proof-of-concept details needed to validate the issue.

## Disclosure Expectations

- Give maintainers reasonable time to investigate and remediate before public disclosure.
- Coordinate disclosure details to reduce risk to users.

## Secret-Handling Guidance

- Never commit real API keys, tokens, passwords, private keys, certificates, or production `.env` values.
- Use `.env.example` as a placeholder template only.
- If a secret is accidentally committed, rotate/revoke it immediately and submit a fix.

## Scope

This policy applies to vulnerabilities in this repository's code and supporting configuration/documentation.
