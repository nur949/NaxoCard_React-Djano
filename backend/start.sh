#!/usr/bin/env sh
set -eu

python manage.py migrate --noinput
python manage.py collectstatic --noinput

if [ -n "${ADMIN_USERNAME:-}" ] && [ -n "${ADMIN_EMAIL:-}" ] && [ -n "${ADMIN_PASSWORD:-}" ]; then
python manage.py shell <<'PY'
import os
from django.contrib.auth import get_user_model

User = get_user_model()
username = os.environ["ADMIN_USERNAME"]
email = os.environ["ADMIN_EMAIL"]
password = os.environ["ADMIN_PASSWORD"]

user, created = User.objects.get_or_create(
    username=username,
    defaults={"email": email, "is_staff": True, "is_superuser": True},
)
if created:
    user.set_password(password)
    user.save()
else:
    changed = False
    if user.email != email:
        user.email = email
        changed = True
    if not user.is_staff:
        user.is_staff = True
        changed = True
    if not user.is_superuser:
        user.is_superuser = True
        changed = True
    user.set_password(password)
    user.save()
PY
fi

exec gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000}
