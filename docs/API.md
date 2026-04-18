# Inter-service API contracts

Maintain this table as endpoints are implemented.

| From | To | Method | Endpoint | Purpose |
|------|-----|--------|----------|---------|
| Gateway | Auth | POST | /api/v1/auth/verify | Validate JWT |
| Gateway | Earnings | * | /api/v1/earnings/* | Shifts, CSV, screenshots |
| Gateway | Anomaly | POST | /api/v1/anomaly/detect | Run detection |
| Gateway | Certificate | GET | /api/v1/certificate/generate | Generate certificate |
| Earnings | Analytics | internal | event: shift.verified | Invalidate / refresh KPIs |
| Anomaly | Earnings | GET | /api/v1/earnings/shifts/:id | Shift detail (if needed) |

## Standard response envelope

All JSON APIs use:

- Success: `{ "success": true, "data": {}, "message": "...", "timestamp": "ISO-8601" }`
- Error: `{ "success": false, "error": "ERROR_CODE", "message": "...", "timestamp": "ISO-8601" }`
- Paginated: includes `pagination`: `{ page, limit, total, totalPages }`
