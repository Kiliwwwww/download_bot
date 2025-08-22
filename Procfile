web: uvicorn app.fast.fast_app:server_app --reload --port 12345
worker: celery --app=app.celery.celery_worker:celery_app worker --loglevel=info