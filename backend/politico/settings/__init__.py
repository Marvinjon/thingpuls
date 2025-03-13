"""
Settings package initialization.
This file imports appropriate settings based on environment.
"""

import os

# Load environment variable
ENV = os.environ.get('DJANGO_ENV', 'local')

# Import appropriate settings file
if ENV == 'production':
    from .production import *
else:
    from .local import * 