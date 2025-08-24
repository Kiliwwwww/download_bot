web: uvicorn app.fast.fast_app:server_app --reload --port 12345
worker: celery --app=app.celery.celery_worker:celery_app worker -n worker1@%h --loglevel=info  --pool=solo
flower: celery --app=app.celery.celery_worker:celery_app flower --port=15555
