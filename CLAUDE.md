# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

iGraphical is a Persian (RTL, `lang="fa"`) online course platform. It is an npm-workspaces + Turborepo monorepo with three Next.js 15 (App Router, React 19) apps sharing one MySQL database through Prisma:

| App | Port | Domain | Who uses it |
|---|---|---|---|
| `apps/app` | 3000 | igraphical.ir | Students: course catalog, blog, cart/checkout, classroom (video lessons), panel |
| `apps/admin` | 3001 | admin.igraphical.ir | Admins/authors: content, users, payments, analytics (GA4) |
| `apps/tutor` | 3002 | tutor.igraphical.ir | Tutors: their courses, students, settlements, ask-tutor |

Shared packages (imported as `@igraph/*`, consumed as raw TS source — no build step):

- `@igraph/database` — Prisma schema (`packages/database/prisma/schema.prisma`, MySQL) and the singleton client `database`. The generated client lives in `packages/database/generated/`; import models/enums from `@igraph/database`, not `@prisma/client`.
- `@igraph/auth` — NextAuth v5 (JWT sessions, Prisma adapter). Exports `auth`, `signIn`, `signOut`, `handlers`, plus login-ticket helpers.
- `@igraph/ui` — shadcn/ui components, Tailwind config and `globals.css`. Import as `@igraph/ui/components/<name>`; add components with `npm run add -w @igraph/ui -- <component>`.
- `@igraph/utils` — SMS (Kavenegar), email (Resend/nodemailer), Cloudinary uploads, reCAPTCHA, rate limiter, certificate PDFs (pdfkit), Jalali date formatting, menus.
- `@igraph/editor` — Lexical rich-text editor (`@igraph/editor/Editor`, `@igraph/editor/ReadOnlyEditor`).

## Commands

Install with `npm install --legacy-peer-deps` (required due to peer-dep conflicts). Run from the repo root:

```bash
npm run dev                      # all three apps (turbo)
npx turbo run dev --filter=app   # single app (app | admin | tutor)
npm run build                    # build everything
npm run lint                     # next lint --max-warnings 0 per app
npm run check-types -w app       # tsc --noEmit for one app (no root script)
npm run format                   # prettier

npm run generate                 # prisma generate (needed after schema changes)
npm run db:migrate:dev           # create/apply a migration
npm run db:push / db:studio / db:seed
```

There is no test suite. Verify changes with `check-types` and `lint` for the affected app.

## Architecture

### Auth: one package, three configs selected by env

`packages/auth/auth.config.ts` picks `app.config.ts`, `admin.config.ts` or `tutor.config.ts` based on `process.env.AUTH_APP` (`"app" | "admin" | "tutor"`). Each app must run with the matching `AUTH_APP` (set in each Dockerfile and app env file); otherwise `@igraph/auth` exports an undefined config. Users, admins and tutors are separate Prisma models (`User`, `Admin`, `Tutor`), and the JWT carries only the id.

Login flow (OTP or password+OTP): a verification server action (e.g. `apps/*/actions/login/verify-otp.ts`) checks the code and mints a signed, short-lived **login ticket** (`packages/auth/login-ticket.ts`, HMAC with `AUTH_SECRET`). `authenticator()` then calls `signIn(..., { identifier, loginToken })`, and the Credentials `authorize()` refuses without a valid ticket. Never reintroduce a path where an identifier alone yields a session.

`middleware.ts` in each app only checks for the presence of the session cookie for redirects. It is not authorization; real checks happen server-side via `auth()` / `getSessionUser()` (`apps/*/data/user.ts`) and `authenticateSession()` (`apps/*/lib/auth.ts`).

### Server actions are public endpoints

Mutations live in `apps/*/actions/*.ts` and reads in `apps/*/data/*.ts`, mostly as `"use server"` modules. Every exported function in a `"use server"` file is callable over HTTP with attacker-controlled arguments. When writing or editing them:

- Derive the acting user from the session (`getSessionUser()` / `auth()`), never from a `userId` argument.
- Enforce reCAPTCHA and rate limits (`@igraph/utils` `rate-limit.ts`, in-process only) server-side; don't make them optional.
- Keep plaintext-secret helpers server-only. `packages/utils/src/otp.ts` is intentionally not re-exported from `@igraph/utils` and must not be.

`SECURITY-AUDIT.md` (2026-06) documents the vulnerabilities found along these lines; check it before touching auth, payments, enrollment or classroom access.

### Payments

Checkout (`apps/app/app/(CART)`) supports several Iranian gateways: ZarinPal (`actions/zarinPal.ts`), Sadad (`actions/sadad.ts` + callback `app/api/sadad`), Digipay (`actions/payments/digipay.ts` + `app/api/digipay`), and wallet balance (`actions/wallet.ts`). Gateway callback routes under `/api/sadad` and `/api/digipay` are explicitly excluded from the auth redirect in `apps/app/middleware.ts`. Amounts are stored in Toman; Sadad expects Rial (`amount * 10`). Pending payments are cancelled by the admin cron route `apps/admin/app/api/cron/cancel-pending-payments` (guarded by the `x-cron-key` header = `CRON_SECRET_KEY`).

### Conventions

- Path alias `@/*` maps to the app root within each app.
- Route groups in uppercase, e.g. `(HOME)`, `(CART)`, `(ASSET)`, `(DASHBOARD)`.
- Forms use react-hook-form + zod; schemas live in `apps/*/lib/validationSchema.ts`.
- User-facing strings and error messages are in Persian.
- Media is stored on Cloudinary (`res.cloudinary.com` is the allowed image host).

## Deployment

`docker-compose.yml` runs the three apps (each via `apps/<name>/Dockerfile`, `output: "standalone"`, `turbo prune`) behind nginx-proxy + Let's Encrypt with a MySQL 8 container. Runtime env comes from `/root/envs/igraphical/<app>.env.local` on the server; the root `.env` only feeds compose build args (`DATABASE_URL`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `RESEND_API_KEY`). Admin expects a Google Analytics service-account file `apps/admin/ga.json`.
