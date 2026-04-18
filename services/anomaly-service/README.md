# anomaly-service

FastAPI **required** service on **8001**. Implement `/api/v1/anomaly/detect` per spec (all 5 anomaly types).

```bash
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```
