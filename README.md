# NestJS Backend Template

An enterprise-grade **NestJS 11** backend/API template — TypeScript, PostgreSQL + TypeORM,
RS256 JWT auth, CQRS, i18n, background jobs, and a large set of production integrations wired in.
It is an opinionated, ever-evolving starting point for new Node backend services, and is currently
configured as the API for the DKC platform (`dkc-backend`).

Built on top of the excellent [Awesome NestJS Boilerplate](https://github.com/NarHakobyan/awesome-nest-boilerplate)
(MIT) and extended with additional integrations.

---

## Features

- **NestJS 11** with a modular, feature-oriented architecture (`src/modules/*`).
- **PostgreSQL + TypeORM** with migrations, entity subscribers, and transactional support.
- **Authentication** — Passport + JWT using **RS256** (public/private key pair), guards, and role decorators.
- **CQRS** — command/query separation via `@nestjs/cqrs`.
- **Background jobs & queues** — BullMQ on Redis (`ioredis`), plus scheduled tasks (`@nestjs/schedule`).
- **Microservices (optional)** — NATS transport, enabled conditionally via env.
- **Payments & subscriptions** — Stripe (`@golevelup/nestjs-stripe`) and RevenueCat, with webhook handling.
- **Search** — Meilisearch integration.
- **Media** — AWS S3 storage, image processing with `sharp`, and BlurHash placeholders.
- **AI** — pluggable providers (OpenAI-compatible, Google GenAI, fal.ai) for text/image generation.
- **Notifications** — Firebase Admin (push / messaging).
- **i18n** — `nestjs-i18n` with a configurable fallback language.
- **API docs** — Swagger / OpenAPI (`@nestjs/swagger`), toggleable via env.
- **Hardening** — Helmet, rate limiting (`@nestjs/throttler`), compression, CORS, request context (`nestjs-cls`).
- **Observability** — health checks (`@nestjs/terminus`) and request logging (`morgan`).
- **Multi-runtime** — runs on Node, Bun, or Deno.

---

## Tech Stack

| Area              | Technology |
| ----------------- | ---------- |
| Framework         | [NestJS 11](https://nestjs.com) + TypeScript |
| Database / ORM    | PostgreSQL + [TypeORM](https://typeorm.io) |
| Auth              | Passport + JWT (RS256) |
| Cache / Queues    | Redis (`ioredis`) + [BullMQ](https://docs.bullmq.io) |
| Messaging         | [NATS](https://nats.io) microservices (optional) |
| Payments          | [Stripe](https://stripe.com) + [RevenueCat](https://www.revenuecat.com) |
| Search            | [Meilisearch](https://www.meilisearch.com) |
| Storage / Media   | AWS S3, `sharp`, BlurHash |
| AI                | OpenAI-compatible, Google GenAI, fal.ai |
| Notifications     | Firebase Admin |
| API docs          | Swagger / OpenAPI |
| Tooling           | pnpm, ESLint + Biome, Jest, Husky, VitePress (docs) |

---

## Getting Started

### Prerequisites
- **Node.js** 20+ (or Bun / Deno)
- **pnpm** (this repo uses a pnpm lockfile — do not use npm or yarn)
- A **PostgreSQL** database, and **Redis** if you use queues/background jobs

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Then fill in the values. The template covers a broad set of integrations — you only need the ones
you actually use. Key groups (see `.env.example` for the full list):

- **Core:** `NODE_ENV`, `PORT`, `API_VERSION`, `API_BASE_URL`, `FRONTEND_URL`, `CORS_ORIGINS`
- **Database:** `DB_TYPE`, `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
- **Auth (RS256):** `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY`, `JWT_EXPIRATION_TIME`
- **Cache / messaging:** `REDIS_URL`, `NATS_ENABLED`, `NATS_HOST`, `NATS_PORT`
- **Storage:** `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET_NAME`
- **Search:** `MEILI_HOST`, `MEILI_MASTER_KEY`
- **Payments:** `STRIPE_*`, `REVENUECAT_API_KEY`, `REVENUECAT_WEBHOOK_SECRET`
- **AI:** `GOOGLE_API_KEY`, `FAL_API_KEY`, and related model IDs
- **Notifications:** `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- **Docs:** `ENABLE_DOCUMENTATION`

### 3. Run database migrations

```bash
pnpm migration:run
```

### 4. Start the development server

```bash
pnpm start:dev        # Vite hot-reload dev server (preferred)
# or
pnpm nest:start:dev   # NestJS CLI watch mode
```

By default the API is served on `http://localhost:$PORT`, and Swagger docs are available at
`/documentation` when `ENABLE_DOCUMENTATION` is on.

---

## Scripts

| Command                     | Description |
| --------------------------- | ----------- |
| `pnpm start:dev`            | Dev server with hot reload (Vite) |
| `pnpm nest:start:dev`       | NestJS CLI watch mode |
| `pnpm build:prod`           | Production build |
| `pnpm start:prod`           | Run the production build (`dist/main.js`) |
| `pnpm lint` / `pnpm lint:fix` | ESLint (with autofix) |
| `pnpm test` / `pnpm test:watch` | Jest unit tests |
| `pnpm test:e2e`             | End-to-end tests |
| `pnpm test:cov`             | Coverage report |
| `pnpm generate` / `pnpm g`  | Scaffold a module/resource (awesome-nestjs-schematics) |
| `pnpm migration:generate`   | Generate a migration from entity changes |
| `pnpm migration:create`     | Create an empty migration |
| `pnpm migration:run`        | Apply pending migrations |
| `pnpm migration:revert`     | Revert the last migration |
| `pnpm docs:dev`             | Run the VitePress docs site locally |

---

## Project Structure

```
src/
├─ modules/            # Feature modules (one folder per domain)
├─ common/             # Shared DTOs, abstract entities, helpers
├─ database/           # Migrations, seeds, data source config
├─ decorators/         # Custom decorators (auth, swagger, transforms)
├─ guards/             # Auth / role guards
├─ interceptors/       # Cross-cutting interceptors
├─ filters/            # Exception filters
├─ providers/          # Shared providers/services
├─ shared/             # Shared module (config, services)
├─ i18n/               # Translation resources
├─ constants/ types/   # Enums, constants, shared types
└─ main.ts             # Application entry point
```

Additional docs live in `docs/` (VitePress). Database configuration is in `ormconfig.ts`, and
container setup in `Dockerfile` / `docker-compose.yml`.

---

## Deployment

The service ships with a `Dockerfile` and `docker-compose.yml`. Build the production bundle with
`pnpm build:prod` and run `pnpm start:prod`, or use the provided container setup. Provide the same
environment variables in your deployment platform's secrets.

---

## Contributing

Contributions are welcome. Please read the **[Contributing Guide](./CONTRIBUTING.md)** for the
workflow, commit conventions, and coding guidelines before opening a pull request.

## Security

Found a vulnerability? **Do not open a public issue.** Please follow the responsible-disclosure
process in our **[Security Policy](./SECURITY.md)**.

## License

Licensed under the **[MIT License](./LICENSE)**. This project is built on the
[Awesome NestJS Boilerplate](https://github.com/NarHakobyan/awesome-nest-boilerplate) by Narek
Hakobyan; the original MIT copyright notice is retained.
