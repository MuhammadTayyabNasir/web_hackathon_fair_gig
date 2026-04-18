# auth-service

FairGig authentication: register, login, JWT access token + httpOnly refresh cookie.

## Run

```bash
cp .env.example .env
npm install
npm start
```

Listens on **3001**. Seeded logins use email from `seed.sql` and password `password`.
