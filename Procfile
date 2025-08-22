web: bash -c "kill -9 $(lsof -t -i:12345) 2>/dev/null || true; uvicorn app.fast.fast_app:server_app --reload --port 12345"
worker: celery --app=app.celery.celery_worker:celery_app worker --loglevel=info
flower: bash -c "kill -9 $(lsof -t -i:5555) 2>/dev/null || true;  celery --app=app.celery.celery_worker:celery_app flower --port=5555"