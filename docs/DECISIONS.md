# Decisions

| Area | Choice | Rationale |
|------|--------|-----------|
| Database | PostgreSQL | Relational model, judges can verify aggregates & medians from seed |
| Cache | Redis | TTL-based caching for analytics per spec |
| Gateway | Node Express | Uniform middleware, JWT, proxying to services |
| Anomaly / PDF-style cert | FastAPI | Competition requirement for Python microservices |
| Auth | Firebase client + JWT | Spec: Firebase Auth with JWT access/refresh pattern |
