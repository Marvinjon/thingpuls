# Politico Web Application

A comprehensive web application for parliamentary data analysis and citizen engagement in Iceland.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose (v2+) installed
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd thingpuls
   ```

2. **Setup environment**
   ```bash
   cp env.example .env
   # Edit .env file with your settings
   nano .env
   ```

3. **Start development**
   ```bash
   docker compose up -d
   ```

That's it! 🎉

## 🛠️ Development

### Start Development Environment
```bash
# Quick start (recommended)
docker compose up -d

# With helper script
./start.sh dev -d

# View logs
docker compose logs -f
```

### Development URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin
- **Database**: localhost:5433
- **Redis**: localhost:6379

### Development Features
- ✨ Hot reload for both frontend and backend
- 🐛 Debug mode enabled
- 🔌 Direct access to services
- 💾 Volume mounts for live code changes

## 🌐 Production

### Deploy Production Environment
```bash
# Using docker compose
docker compose -f docker-compose.prod.yml up -d --build

# Using helper script (recommended)
./start.sh prod
```

### Production URLs
- **Application**: http://localhost (via nginx)
- **Admin Panel**: http://localhost/admin

### Production Features
- ⚡ Optimized builds
- 🔒 Nginx reverse proxy
- 📦 Static file serving
- ❤️ Health checks
- 🔄 Auto-restart on failure
- 👥 Multiple Gunicorn workers

## 📋 Helper Script Commands

The `start.sh` script provides convenient commands:

```bash
./start.sh help                    # Show all commands
./start.sh dev [-d]                # Start development
./start.sh prod                    # Start production
./start.sh stop                    # Stop all services
./start.sh status                  # Show service status
./start.sh logs [service]          # View logs
./start.sh django <command>        # Run Django command
./start.sh scrapers <session>      # Run data scrapers
./start.sh clean                   # Remove all containers
```

### Examples
```bash
# Start development in detached mode
./start.sh dev -d

# Run migrations
./start.sh django migrate

# Create admin user
./start.sh django createsuperuser

# Run scrapers for session 157
./start.sh scrapers 157

# View backend logs
./start.sh logs backend
```

## 🔧 Environment Variables

### Required Variables
```bash
# Django
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=localhost,yourdomain.com

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
# Frontend API URL
REACT_APP_API_URL=http://localhost:8000

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Celery
CELERY_BROKER_URL=redis://redis:6379/0
```

See `env.example` for all available options.

## 🏗️ Services

### Core Services
- **db**: PostgreSQL 17 database
- **redis**: Redis for caching and Celery
- **backend**: Django REST API server
- **frontend**: React application
- **nginx**: Reverse proxy (production only)

### Background Services
- **celery_worker**: Background task processing
- **celery_beat**: Scheduled task scheduler

## 📊 Data Collection

### Running Scrapers

The application includes scrapers for collecting data from the Icelandic Parliament (Alþingi):

```bash
# Run all scrapers for a session
./start.sh scrapers 157

# Or use the dedicated script
./run_scrapers_docker.sh 157
```

The scrapers collect:
1. Political parties
2. Members of Parliament (MPs)
3. Bills and legislation
4. Topics and categories
5. Voting records
6. Parliamentary speeches
7. MP interests and declarations

## 🔄 Common Workflows

### Initial Setup
```bash
# 1. Start services
docker compose up -d

# 2. Wait for services to be ready (check logs)
docker compose logs -f backend

# 3. Run migrations
./start.sh django migrate

# 4. Create admin user
./start.sh django createsuperuser

# 5. Load initial data (optional)
./start.sh scrapers 157
```

### Daily Development
```bash
# Start services
docker compose up -d

# Make code changes (hot reload active)

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Stop when done
docker compose down
```

### Database Management
```bash
# Create backup
docker compose exec db pg_dump -U politico_user politico_db > backup_$(date +%Y%m%d).sql

# Restore backup
docker compose exec -T db psql -U politico_user politico_db < backup_20240101.sql

# Run migrations
./start.sh django migrate

# Create migrations
./start.sh django makemigrations
```

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check what's using the ports
   lsof -i :3000
   lsof -i :8000
   lsof -i :80
   
   # Change ports in docker-compose.yml if needed
   ```

2. **Database connection issues**
   ```bash
   # Check database health
   docker compose exec db pg_isready -U politico_user
   
   # Restart database
   docker compose restart db
   ```

3. **Build issues**
   ```bash
   # Rebuild without cache
   docker compose build --no-cache
   docker compose up -d
   ```

4. **Permission issues**
   ```bash
   # Fix volume permissions
   sudo chown -R $USER:$USER backend/media backend/staticfiles
   ```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f celery_worker

# Last 100 lines
docker compose logs --tail=100 backend
```

### Reset Everything
```bash
# Stop and remove all containers and volumes
./start.sh clean

# Or manually
docker compose down -v
docker compose -f docker-compose.prod.yml down -v
```

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PRODUCTION                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Nginx (Port 80/443)                 │   │
│  │         Reverse Proxy & Static Files             │   │
│  └─────┬──────────────────────────────────┬────────┘   │
│        │                                    │            │
│  ┌─────▼─────────┐                  ┌─────▼─────────┐  │
│  │   Frontend    │                  │    Backend     │  │
│  │   (React)     │                  │   (Django)     │  │
│  │  (Built)      │                  │  (Gunicorn)    │  │
│  └───────────────┘                  └────┬───────────┘  │
│                                           │              │
└───────────────────────────────────────────┼──────────────┘
                                            │
┌───────────────────────────────────────────┼──────────────┐
│                   DEVELOPMENT             │              │
│  ┌───────────────┐                  ┌────▼───────────┐  │
│  │   Frontend    │                  │    Backend     │  │
│  │   (React)     │◄────────────────►│   (Django)     │  │
│  │  Port 3000    │                  │   Port 8000    │  │
│  └───────────────┘                  └────┬───────────┘  │
└───────────────────────────────────────────┼──────────────┘
                                            │
┌───────────────────────────────────────────┼──────────────┐
│                 SHARED SERVICES           │              │
│  ┌─────────────┐    ┌─────────────┐  ┌──▼──────────┐   │
│  │ PostgreSQL  │◄───┤    Redis    │◄─┤   Celery    │   │
│  │  (Database) │    │  (Cache &   │  │  (Workers   │   │
│  │             │    │   Broker)   │  │  & Beat)    │   │
│  └─────────────┘    └─────────────┘  └─────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 📝 Project Structure

```
thingpuls/
├── backend/                    # Django backend
│   ├── analytics/              # Analytics app
│   ├── data_collection/        # Data collection app
│   ├── engagement/             # User engagement features
│   ├── parliament/             # Parliament data models
│   ├── users/                  # User management
│   ├── scrapers/               # Data scrapers
│   └── politico/               # Main Django app
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   ├── context/            # React context
│   │   └── services/           # API services
│   └── public/                 # Static assets
├── nginx/                      # Nginx configuration
├── docker-compose.yml          # Development setup
├── docker-compose.prod.yml     # Production setup
├── start.sh                    # Helper script
├── run_scrapers_docker.sh      # Scraper runner
├── env.example                 # Environment template
├── DEPLOYMENT.md               # Deployment guide
└── README.md                   # This file
```

## 📚 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)**: Comprehensive deployment guide
- **[Backend README](backend/README.md)**: Backend-specific documentation
- **[Frontend README](frontend/README.md)**: Frontend-specific documentation
- **[Scrapers README](backend/scrapers/README.md)**: Data scraping documentation

## 🔐 Security

For production deployment:
- ✅ Change all default passwords
- ✅ Set strong `SECRET_KEY`
- ✅ Set `DEBUG=False`
- ✅ Configure `ALLOWED_HOSTS`
- ✅ Enable HTTPS with SSL certificates
- ✅ Regular database backups
- ✅ Keep Docker images updated

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed security checklist.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test with Docker (`docker compose up -d`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

[Add your license information here]

## 🙏 Acknowledgments

- Built for analyzing Icelandic Parliamentary data from [Alþingi](https://www.althingi.is/)
- Uses the Alþingi XML API for data collection

---

**Need help?** Check the [DEPLOYMENT.md](DEPLOYMENT.md) guide or run `./start.sh help`
