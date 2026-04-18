# Architecture

FairGig uses an API gateway (Node) that authenticates requests and proxies to domain microservices. **PostgreSQL** is the system of record; **Redis** caches heavy analytics aggregates. **Firebase** backs auth (client) and file storage for screenshots. **Python FastAPI** hosts **anomaly detection** and **income certificates** per competition requirements.

See `docker-compose.yml` for ports and `schema.sql` for the data model.
