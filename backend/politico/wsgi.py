"""
WSGI config for politico project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

# Use environment variable to determine which settings to use
# Defaults to 'local' if not specified
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'politico.settings')

application = get_wsgi_application() 