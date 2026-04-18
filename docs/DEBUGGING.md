# Debugging

- **DB connection errors**: ensure `docker compose ps` shows Postgres healthy, `DATABASE_URL` matches compose credentials.
- **Seed failures**: run `schema.sql` on an empty database; re-create DB if re-seeding.
- **Port conflicts**: change host ports in `docker-compose.yml` or stop conflicting processes.
