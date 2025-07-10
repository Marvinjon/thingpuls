# Politico Web Application

A comprehensive web application for parliamentary data analysis and citizen engagement.

## Quick Start

### Prerequisites
- Docker and Docker Compose (v2+) installed
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd politico_web
   ```

2. **Quick setup (recommended)**
   ```bash
   # Option 1: Using Makefile
   make setup
   
   # Option 2: Using startup script
   ./start.sh help
   ```

3. **Or manual setup**
   ```bash
   cp env.example .env
   # Edit .env file with your settings
   nano .env
   ```

## Development

### Start Development Environment
```bash
# Option 1: Using Makefile (recommended)
make dev

# Option 2: Using startup script
./start.sh dev

# Option 3: Direct docker compose
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# Start without nginx (access frontend directly on port 3000)
make dev-no-nginx
```

### Development URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin
- **Database**: localhost:5432
- **Redis**: localhost:6379

### Development Features
- Hot reload for both frontend and backend
- Debug mode enabled
- Direct access to services
- Volume mounts for live code changes

## Production

### Start Production Environment
```bash
# Option 1: Using Makefile (recommended)
make prod

# Option 2: Using startup script
./start.sh prod

# Option 3: Direct docker compose
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Build and start production
make prod-build
```

### Production URLs
- **Application**: http://localhost (via nginx)
- **Backend API**: http://localhost/api/v1/
- **Django Admin**: http://localhost/admin

### Production Features
- Optimized builds
- Nginx reverse proxy
- Static file serving
- Health checks
- Auto-restart on failure

## Environment Variables

### Required Variables
```bash
# Django
SECRET_KEY=your-secret-key-here
DEBUG=False
DJANGO_ENV=production

# Database
DB_NAME=politico_db
DB_USER=politico_user
DB_PASSWORD=your-secure-password

# Email (for production)
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### Optional Variables
```bash
# Build targets
BUILD_TARGET=production  # or development

# Frontend
REACT_APP_API_URL=http://localhost:8000

# Docker commands (can be overridden)
BACKEND_COMMAND=gunicorn --bind 0.0.0.0:8000 --workers 4 --timeout 120 politico.wsgi:application
FRONTEND_COMMAND=npm start
```

## Services

### Core Services
- **db**: PostgreSQL database
- **redis**: Redis for Celery
- **backend**: Django API server
- **frontend**: React development server
- **nginx**: Reverse proxy and static file server

### Background Services
- **celery_worker**: Background task processing
- **celery_beat**: Scheduled task scheduler

## Simplified Commands

This project includes simplified commands for easier management:

### Using Makefile (Recommended)
```bash
make help          # Show all available commands
make setup         # Initial setup
make dev           # Start development
make prod          # Start production
make stop          # Stop all services
make logs          # View logs
make status        # Show service status
```

### Using Startup Script
```bash
./start.sh help    # Show all available commands
./start.sh dev     # Start development
./start.sh prod    # Start production
./start.sh stop    # Stop all services
./start.sh logs    # View logs
./start.sh status  # Show service status
```

## Commands

### Development Commands
```bash
# Start development
make dev

# Start without nginx
make dev-no-nginx

# View logs
make logs backend

# Run Django commands
make migrate
make createsuperuser

# Run frontend commands
docker compose exec frontend npm install
```

### Production Commands
```bash
# Start production
make prod

# Stop production
make stop

# View logs
make logs

# Update production
make prod-build
```

### Database Commands
```bash
# Create database backup
make backup

# Restore database
make restore FILE=backup_file.sql

# Reset database
make clean
make migrate
```

## Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check what's using the ports
   lsof -i :3000
   lsof -i :8000
   lsof -i :80
   ```

2. **Database connection issues**
   ```bash
   # Check database health
   docker-compose exec db pg_isready -U politico_user
   ```

3. **Build issues**
   ```bash
   # Rebuild without cache
   docker-compose build --no-cache
   ```

4. **Permission issues**
   ```bash
   # Fix volume permissions
   sudo chown -R $USER:$USER .
   ```

### Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs nginx

# Follow logs in real-time
docker-compose logs -f
```

## Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │    │   Backend   │    │   Database  │
│  (React)    │◄──►│  (Django)   │◄──►│ (PostgreSQL)│
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │                   ▼                   │
       │            ┌─────────────┐            │
       │            │    Redis    │            │
       │            │   (Celery)  │            │
       │            └─────────────┘            │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Nginx    │    │ Celery      │    │   Volumes   │
│ (Reverse    │    │ Workers     │    │ (Static &   │
│  Proxy)     │    │ & Beat      │    │   Media)    │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker
5. Submit a pull request

## License

[Add your license information here] 