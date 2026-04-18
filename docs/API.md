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

## Anomaly AI summary

The anomaly service now returns these additional fields on `/api/v1/anomaly/detect` when Groq is configured:

- `ai_summary`: AI-generated plain-language explanation of the detection result
- `ai_enabled`: `true` when Groq was used, `false` when the service fell back to deterministic text
- `ai_model`: the Groq model name used for the summary when enabled

## Standard response envelope

All JSON APIs use:

- Success: `{ "success": true, "data": {}, "message": "...", "timestamp": "ISO-8601" }`
- Error: `{ "success": false, "error": "ERROR_CODE", "message": "...", "timestamp": "ISO-8601" }`
- Paginated: includes `pagination`: `{ page, limit, total, totalPages }`
