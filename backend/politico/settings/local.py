"""
Local development settings
"""

import os
from dotenv import load_dotenv
from .base import *  # Import all base settings

# Load environment variables from .env file
load_dotenv(os.path.join(os.path.dirname(BASE_DIR), '.env'))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-default-dev-key-change-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# Allow all hosts in development
ALLOWED_HOSTS = ['*']

# Local database settings
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'politico_db'),
        'USER': os.getenv('DB_USER', 'politico_user'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'password'),
        'HOST': os.getenv('DB_HOST', 'db'),  # Use Docker service name in container
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# CORS settings for local development
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:8000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8000',
]

# Email settings - use console backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Add debug toolbar for development
INSTALLED_APPS += [
    # Removing debug_toolbar
]

MIDDLEWARE += [
    # Removing debug toolbar middleware
]

INTERNAL_IPS = [
    '127.0.0.1',
]

# Local Redis setup (if needed)
CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL', 'redis://redis:6379/0')
CELERY_RESULT_BACKEND = os.getenv('CELERY_RESULT_BACKEND', 'redis://redis:6379/0')

# REST Framework additional settings for development
REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'] = (
    'rest_framework.renderers.JSONRenderer',
    'rest_framework.renderers.BrowsableAPIRenderer',
)

# Removing debug toolbar config
# DEBUG_TOOLBAR_CONFIG = {
#     'SHOW_TOOLBAR_CALLBACK': lambda request: True,
# }

# Make sure debug_toolbar is properly included in urls.py 