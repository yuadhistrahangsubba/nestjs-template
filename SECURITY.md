# Security Policy

Security is a first-class concern for this backend — it handles authentication, payments, file
storage, and third-party integrations.

## Supported Versions

Only the latest version on the `main` branch (and the current production deployment) receives
security updates.

| Version            | Supported          |
| ------------------ | ------------------ |
| `main` / latest    | :white_check_mark: |
| older commits/tags | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, report them privately using GitHub's
[private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)
for this repository, or via a private message to the repository owner (**@yuadhistrahangsubba**).
Please include:

- A description of the vulnerability and its potential impact
- Steps to reproduce (or a proof-of-concept)
- Affected endpoints, modules, or configuration

**What to expect:**

- An acknowledgement within a few business days.
- An assessment and, if accepted, a remediation timeline.
- Please allow reasonable time for a fix before any public disclosure. We're happy to credit you
  once the issue is resolved, if you'd like.

## Good Practices for Operators

If you deploy this backend:

- **Keep all secrets out of version control.** `.env` is git-ignored; provide values via your
  platform's secret manager. This includes `JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY` (RS256),
  `DB_*`, `REDIS_URL`, `AWS_*`, `MEILI_MASTER_KEY`, `STRIPE_*`, `REVENUECAT_*`, `FIREBASE_*`,
  and all AI provider keys (`GOOGLE_API_KEY`, `FAL_API_KEY`, etc.).
- **Verify webhook signatures.** Stripe and RevenueCat webhooks must be validated against their
  respective signing secrets (`STRIPE_WEBHOOK_SECRET`, `REVENUECAT_WEBHOOK_SECRET`) before
  processing — never trust unsigned payloads.
- **Rotate keys** immediately if exposed, and rotate the RS256 JWT key pair on a schedule.
- **Keep the built-in hardening enabled** — Helmet, rate limiting (`@nestjs/throttler`), CORS
  allow-lists (`CORS_ORIGINS`), and compression are configured; do not disable them in production.
- **Restrict Swagger** — set `ENABLE_DOCUMENTATION=false` (or protect it) in production.
- **Never log tokens, private keys, or full request bodies** containing secrets.
- Keep dependencies patched and review advisory / Dependabot alerts promptly.
