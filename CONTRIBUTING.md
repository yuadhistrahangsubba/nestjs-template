# Contributing

Thank you for your interest in improving this NestJS backend. Contributions are welcome —
bug fixes, new modules, integrations, performance work, or better tests.

## Getting set up

See the [Getting Started](./README.md#getting-started) section of the README for prerequisites,
environment variables, database migrations, and how to run the service locally.

## Workflow

1. **Fork** the repository and create a feature branch off `main`:
   ```bash
   git checkout -b feat/your-feature
   ```
2. **Make your changes.** Follow the existing NestJS conventions — one feature module per domain
   under `src/modules/*`, DTOs with `class-validator`, guards/decorators for auth, and CQRS
   commands/queries where the codebase already uses them. You can scaffold new resources with
   `pnpm generate` (`pnpm g`).
3. **Schema changes require a migration.** If you change an entity, generate and commit a
   migration — do not rely on auto-sync:
   ```bash
   pnpm migration:generate -- --name=YourMigrationName
   pnpm migration:run
   ```
4. **Verify before you push** — all must pass:
   ```bash
   pnpm lint      # ESLint (and Biome via lint:changes)
   pnpm test      # Jest unit tests
   pnpm build:prod
   ```
   Husky pre-commit hooks run `lint-staged` automatically, but please run the full suite yourself
   before opening a PR. Add or update tests for any behavioural change.
5. **Commit** using clear, descriptive messages. This project follows a
   [Gitmoji](https://gitmoji.dev)-style convention, e.g.:
   ```
   :sparkles: add subscription webhook handler
   :bug: fix RS256 token validation on expired keys
   :white_check_mark: add tests for search indexing
   ```
6. **Open a Pull Request** against `main`, describing **what** changed and **why**. Note any new
   environment variables and update `.env.example` accordingly.

## Guidelines

- **Never commit secrets.** `.env` is git-ignored; add new keys to `.env.example` with empty or
  placeholder values only. The repo also runs `eslint-plugin-no-secrets` — do not bypass it.
- **Keep modules cohesive.** Business logic belongs in services/providers, not controllers.
  Cross-cutting concerns go through interceptors, guards, and filters.
- **Document public endpoints** with Swagger decorators so the generated OpenAPI docs stay useful.
- **Respect i18n.** User-facing messages should go through `nestjs-i18n`, not hard-coded strings.
- **Discuss large or breaking changes** in an issue before starting.

## Reporting bugs & requesting features

- **Bugs:** open an issue with steps to reproduce, expected vs. actual behaviour, relevant logs,
  and your environment (Node/Bun version, database).
- **Features:** open an issue describing the problem you're solving, not just the proposed solution.

For security issues, **do not open a public issue** — see [SECURITY.md](./SECURITY.md).
