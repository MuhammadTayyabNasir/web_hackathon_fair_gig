# Firebase Data Connect (PostgreSQL)

This folder is prepared for `firebase init dataconnect` and production deploys.

## Prerequisites

- Firebase CLI logged in
- Active project: `softec-webhackathon`
- Billing enabled for Cloud SQL-backed Data Connect

## Initialize and generate SDK

```bash
npx -y firebase-tools@latest init dataconnect
npx -y firebase-tools@latest init dataconnect:sdk
```

## Local development

```bash
npx -y firebase-tools@latest emulators:start --only dataconnect
```

## Deploy

```bash
npx -y firebase-tools@latest deploy --only dataconnect
```

Keep generated schema and operations in this directory committed for judge review.
