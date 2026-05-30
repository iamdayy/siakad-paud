# Running Tests (E2E)

Prerequisites:

- Node.js (18+)
- A running Postgres database and `DATABASE_URL` configured in your environment.

Install deps:

```bash
npm ci
npx playwright install --with-deps
```

Run app locally:

```bash
npm run dev
# or build + start
npm run build
npm run start
```

Run Playwright tests:

```bash
npm run test:e2e
```

CI: GitHub Actions workflow `./.github/workflows/e2e.yml` will run tests on pushes to `main` and PRs.
