# COLORceil — MEAN Stack Color Palette Studio

COLORceil is a color palette app built with **MongoDB, Express, Angular, and Node.js**. This branch migrates the original React/Vite frontend to a standalone Angular application while keeping COLORceil's bright colors, bold borders, and palette workflow.

## Features

- Browse palettes and search by name, tag, or HEX code; sort by date or name.
- Open palette details, copy HEX codes, and customize an existing palette.
- Edit five colors with synchronized HEX, RGB number inputs, and sliders; shuffle colors.
- Register, sign in, and sign out using an HttpOnly session cookie.
- Save palettes to MongoDB, reopen them after signing in, and delete your own palettes.
- Reset a password through an expiring, single-use email link when SMTP is configured.
- Responsive navigation, native keyboard-accessible palette dialogs, and empty/error/loading states.

**Saved palettes are public.** Only the owner can delete them. The public library currently returns the latest 200 palettes; your personal collection returns all your saved palettes. Home-page examples appear with an explicit offline notice when the API is unavailable. Authentication and saves always require the API and MongoDB.

## Run locally

Use **Node.js 24 LTS** and a running MongoDB instance (local MongoDB or MongoDB Atlas).

```sh
nvm use
npm ci
cp .env.example .env
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Paste the generated value into `TOKEN_SECRET` in `.env`. Set `MONGODB_URI` to your database connection string. Keep `.env` private; never commit it.

In one terminal:

```sh
npm run server:dev
```

In another terminal:

```sh
npm run dev
```

Open [http://localhost:4200](http://localhost:4200). Angular proxies `/api` to Express on port 3000. Use `localhost` consistently: `APP_ORIGIN` must match the browser origin for write requests. The API inserts nine example palettes once without duplicating them on restart.

To use password reset, also set `SMTP_HOST` and `SMTP_FROM`, plus `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASSWORD` as required by your mail server. Without SMTP, the reset form reports that email is not configured. Reset links expire after 30 minutes and invalidate existing sessions when used. Google/GitHub OAuth buttons in the original app were placeholders and have been removed; OAuth is not implemented.

## Build and serve

```sh
npm run build
APP_ORIGIN=http://localhost:3000 npm start
```

Express serves the built Angular app from `dist/colorceil/browser`, including direct navigation to Angular routes. `/api/health` reports database readiness. For deployment, use HTTPS, set `NODE_ENV=production`, and set `APP_ORIGIN` to the exact public HTTPS origin so cookies are secure. Supply the database, token secret, and optional mail settings through the deployment environment. No hosting service is configured by this migration.

If using an existing database, keep its connection string and take your normal backup before deploying. Existing bcrypt password hashes remain compatible. New accounts require at least eight characters and at most 72 UTF-8 bytes; existing shorter passwords can still sign in. Palette and session metadata are added without deleting existing users.

## Verify

```sh
npm run check
npm run build
npm test
npx playwright install chromium
npm run test:e2e
npm audit --omit=dev
```

API integration tests and browser tests start isolated, temporary MongoDB servers. They never read `.env` or use your configured database. The first run downloads a MongoDB binary; browser tests use ports 3000 and 4300, which must be available. Playwright checks the real Angular → Express → MongoDB flow, draft preservation through sign-up, session restoration, deletion, search, RGB editing, validation, and mobile navigation. Screenshots are written to `test-results/`.

Production dependencies currently pass `npm audit --omit=dev`. The full development dependency tree still reports 16 moderate advisories in Angular CLI's transitive `glob`/`minimatch` tooling after nonbreaking updates. `npm audit fix --force` proposes downgrading Angular CLI to an incompatible major, so it is not applied.

## Project structure

```text
src/app/core/       Typed HTTP service, session state, color utilities
src/app/pages/      Angular routes: home, catalog, generator, auth, 404
src/app/shared/     Palette cards and native dialogs
src/server/        Express API, Mongoose models, startup and example seeding
src/shared/        Shared example palette data
public/assets/     Original palette artwork
```

React, Vite, Tailwind, and committed Vite cache files are removed from the active application. The original source remains in Git history. Repository name `colorceil-react` is unchanged; the application package is `colorceil-mean`.

Framework reference: [Angular version compatibility](https://angular.dev/reference/versions).
