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
- Automatically keep palette colors, name, and tags on this device while editing, including across refreshes and sign-in navigation.

**Saved palettes are public.** Only the owner can delete them. The public library currently returns the latest 200 palettes; your personal collection returns all your saved palettes. Home-page examples appear with an explicit offline notice when the API is unavailable. Authentication and saves always require the API and MongoDB.

## Portfolio walkthrough

COLORceil demonstrates a complete palette workflow: discover a combination, customize five colors, create an account, and save a collection that remains available after signing in again.

For a short demo:

1. Open a palette in the library and choose **Customize**.
2. Edit a HEX value or RGB channel, add a name and tags, then refresh to demonstrate draft recovery.
3. Sign up or sign in, save the palette, and find it in **My palettes**.
4. Search the collection, reopen the palette, and copy its color codes.
5. Delete the saved palette to demonstrate ownership and persistence.

### Architecture and implementation decisions

- **Angular standalone pages** load lazily by route. A typed HTTP service connects forms and catalog views to the Express API; signals keep the current session and UI state reactive.
- **Express and MongoDB** validate requests and enforce palette ownership on the server. Authentication uses an HttpOnly session cookie; password resets consume an expiring token once and invalidate earlier sessions.
- **Drafts stay in local storage** so editing survives navigation without requiring an account. Importing colors starts a fresh draft and consumes the import URL parameter, so refreshing keeps subsequent edits. If browser storage is disabled, editing still works but drafts cannot survive reloads.
- **Tests cover the boundaries**: color conversion, API validation and ownership, deployment preview behavior, and browser flows through Angular, Express, and an isolated MongoDB instance.

### Current scope

Search and sorting run in the browser over the loaded collection; the public library is limited to 200 palettes. Saved palettes are public, and OAuth is not implemented. Email reset requires SMTP. The read-only deployment preview demonstrates browsing but cannot create accounts or save data until the database and session secret are configured.

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

Express serves the built Angular app from `dist/colorceil/browser`, including direct navigation to Angular routes. `/api/health` reports database readiness. For deployment, use HTTPS, set `NODE_ENV=production`, and set `APP_ORIGIN` to the exact public HTTPS origin so cookies are secure. Supply the database, token secret, and optional mail settings through the deployment environment. Vercel hosting is configured below.

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

API integration tests and browser tests start isolated, temporary MongoDB servers. They never read `.env` or use your configured database. The first run downloads a MongoDB binary; browser tests use ports 3000 and 4300, which must be available. Playwright checks the real Angular → Express → MongoDB flow, draft preservation through reload and sign-up, session restoration, deletion, search (including no matches in a saved collection), RGB editing, validation, and mobile navigation. Screenshots are written to `test-results/`.

Production dependencies currently pass `npm audit --omit=dev`. The full development dependency tree still reports 16 moderate advisories in Angular CLI's transitive `glob`/`minimatch` tooling after nonbreaking updates. `npm audit fix --force` proposes downgrading Angular CLI to an incompatible major, so it is not applied.

## Project structure

```text
src/
  app/
    core/
      guards/              Route authentication
      models/              User and palette TypeScript types
      services/            HTTP/session state and route SEO
    features/
      auth/                Sign-in, registration, password reset
      home/                Discovery homepage
      palettes/
        catalog/           Public and personal collections
        generator/         Palette editing and saving
      not-found/           Missing-page view
    shared/
      components/          Reusable palette card and dialog
      utils/               Pure color conversion helpers
    app.ts / app.html      Application shell
    app.routes.ts          Lazy feature routes
  server/
    models/                MongoDB schemas
    app.js                 Express application
    deployment.js          Serverless handler and preview mode
    index.js               Local server startup
    seed.js                Idempotent example seeding
  data/                    Example palettes shared by browser and server
public/                    Static images, robots.txt, sitemap
api/                       Hosting function entry point
tests/
  unit/                    Pure function tests
  integration/             API, ownership, persistence, deployment tests
  e2e/                     Browser user journeys
  support/                 Isolated test server setup
```

React, Vite, Tailwind, and committed Vite cache files are removed from the active application. The original source remains in Git history. Repository name `colorceil-react` is unchanged; the application package is `colorceil-mean`.

Framework reference: [Angular version compatibility](https://angular.dev/reference/versions).

### Where new code belongs

Keep each routed feature's controller and HTML template together. Put reusable visual components in `app/shared/components`, pure helpers in `app/shared/utils`, and application-wide services, guards, and types in `app/core`. Feature folders may use core and shared code; core and shared code should not import feature pages. Browser and server example data live in `src/data`, separate from UI components.

Server-only dependencies stay in `src/server`; browser code must not import them. Add pure function tests to `tests/unit`, database/API tests to `tests/integration`, and browser journeys to `tests/e2e`. Framework and hosting configuration remain at the repository root where their tools expect them.

## Vercel deployment

`vercel.json` builds Angular into `dist/colorceil/browser`, preserves SPA deep links, and routes `/api/*` to the shared Node function in `api/index.js`. Before MongoDB is configured, this function serves the example library in read-only preview mode and clearly rejects account and save actions. It never pretends to persist a palette.

To enable real accounts and saved palettes, set `MONGODB_URI` and a randomly generated `TOKEN_SECRET` in the Vercel project's environment settings, then redeploy. Keep Production and Preview databases/secrets separate. `APP_ORIGIN` can be set to the exact HTTPS public origin; otherwise the function uses Vercel's production or preview hostname. SMTP settings remain optional for password reset email. The function caches its database connection within a warm instance.
