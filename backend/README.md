# Politico Web Backend

This is the backend for the Politico Web application, a platform for exploring Icelandic parliamentary data.

## Settings Configuration

This project uses a split settings configuration to support different environments:

### Settings Structure

- `politico/settings/base.py` - Common settings shared across all environments
- `politico/settings/local.py` - Local development settings
- `politico/settings/production.py` - Production deployment settings
- `politico/settings/__init__.py` - Entry point that selects the appropriate settings file

### Environment Variables

The application uses environment variables to determine which settings to use:

- Set `DJANGO_ENV=production` to use production settings
- The default is local settings if no environment variable is set

### Environment Files

- `.env` - Local development environment variables
- `.env.production` - Production environment variables (should be created from `.env.production.example`)

## Running the Application

### Local Development

1. Make sure you have a PostgreSQL database set up according to your `.env` file
2. Activate your virtual environment
3. Run migrations: `python manage.py migrate`
4. Start the development server: `python manage.py runserver`

### Production Deployment

1. Set the environment variable: `export DJANGO_ENV=production`
2. Create a `.env.production` file with your production settings
3. Run the application with a production WSGI server like Gunicorn
4. Or use Docker Compose (if available)

## Database Configuration

The database connection settings differ between environments:

- **Local**: Connects to PostgreSQL on localhost
- **Production**: Connects to PostgreSQL using the service name defined in Docker Compose (typically "db")

## Additional Information

- Debug mode is enabled in local development but disabled in production
- Production includes additional security settings (HTTPS, cookies, etc.)
- Different logging configurations are used based on the environment 