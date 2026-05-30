# Deploy Checklist — siakad-paud

## Pre-deploy

- `npm run lint`
- `npm run build`
- `npm run ci:e2e`
- Ensure `DATABASE_URL` points to production Postgres
- Run `prisma migrate deploy` on production database

## App config

- Set `NODE_ENV=production`
- Set production `DATABASE_URL`
- Confirm port/host settings for the platform
- Verify env vars for any future integrations

## Data / security

- Backup production database before rollout
- Confirm admin accounts exist
- Verify permissions and protected routes
- Check logs for failed admissions/payments after release

## Post-deploy smoke tests

- Open `/dashboard`
- Create PPDB entry
- Approve admission
- Create invoice
- Record payment
- Confirm invoice status updates to `Lunas`

## Rollback

- Restore previous release artifact
- Revert migration only if safe and planned
- Restore database backup if data corruption occurs
