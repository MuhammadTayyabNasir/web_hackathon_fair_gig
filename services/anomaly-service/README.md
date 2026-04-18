# anomaly-service

FastAPI **required** service on **8001**. Implement `/api/v1/anomaly/detect` per spec (all 5 anomaly types).

Optional AI summaries are enabled with `GROQ_API_KEY` and `GROQ_MODEL` in `.env`.

```bash
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```
