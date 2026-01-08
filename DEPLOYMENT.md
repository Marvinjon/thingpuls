# Politico Web - Deployment Guide

This project is now deployment-ready with a clean, simplified Docker Compose structure.

## 🚀 Quick Start

### Development
```bash
# Simply run:
docker compose up -d

# Or use the helper script:
./start.sh dev -d
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin Panel: http://localhost:8000/admin

### Production
```bash
# Run production build:
docker compose -f docker-compose.prod.yml up -d --build

# Or use the helper script:
./start.sh prod
```

Access the application:
- Application: http://localhost
- Admin Panel: http://localhost/admin

## 📁 Project Structure

```
politico_web/
├── backend/              # Django backend
├── frontend/             # React frontend
├── nginx/                # Nginx configuration (production)
├── docker-compose.yml    # Development configuration
├── docker-compose.prod.yml # Production configuration
├── start.sh              # Helper script for common tasks
├── run_scrapers_docker.sh # Data scraping utility
├── env.example           # Environment variables template
└── DEPLOYMENT.md         # This file
```

## 🛠️ Configuration

### Environment Setup

1. Copy the environment template:
```bash
cp env.example .env
```

2. Edit `.env` with your settings:
```bash
# Database
DB_NAME=politico_db
DB_USER=politico_user
DB_PASSWORD=your_secure_password

# Django
SECRET_KEY=your_secret_key
DEBUG=False
ALLOWED_HOSTS=localhost,yourdomain.com

# Other settings...
```

## 📋 Helper Script Commands

The `start.sh` script provides convenient commands:

```bash
# Development
./start.sh dev              # Start dev environment (foreground)
./start.sh dev -d           # Start dev environment (detached)

# Production
./start.sh prod             # Start production environment

# Management
./start.sh stop             # Stop all services
./start.sh status           # Show service status
./start.sh logs [service]   # View logs
./start.sh clean            # Remove all containers and volumes

# Django Commands
./start.sh django migrate           # Run migrations
./start.sh django createsuperuser   # Create admin user
./start.sh django collectstatic     # Collect static files

# Data Scraping
./start.sh scrapers 157     # Run scrapers for session 157
```

## 🔄 Development Workflow

### Initial Setup
```bash
# 1. Clone the repository
git clone <your-repo>
cd politico_web

# 2. Set up environment
cp env.example .env
# Edit .env with your settings

# 3. Start services
docker compose up -d

# 4. Run migrations
./start.sh django migrate

# 5. Create admin user
./start.sh django createsuperuser

# 6. (Optional) Load data
./start.sh scrapers 157
```

### Daily Development
```bash
# Start services
docker compose up -d

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Stop services
docker compose down
```

## 🌐 Production Deployment

### Prerequisites
- Docker and Docker Compose installed
- Domain name configured (optional)
- SSL certificates (optional, for HTTPS)

### Deployment Steps

1. **Prepare the server:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin
```

2. **Clone and configure:**
```bash
git clone <your-repo>
cd politico_web
cp env.example .env
# Edit .env with production settings
```

3. **Deploy:**
```bash
# Build and start
docker compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Create superuser
docker compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser

# Collect static files (if not done automatically)
docker compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

4. **Verify:**
```bash
# Check service status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

### Production Architecture

The production setup includes:
- **Nginx**: Reverse proxy and static file server (port 80/443)
- **Django + Gunicorn**: Backend API (internal)
- **React (built)**: Frontend served by Nginx
- **PostgreSQL**: Database
- **Redis**: Cache and Celery broker
- **Celery Workers**: Background tasks
- **Celery Beat**: Scheduled tasks

### SSL/HTTPS Configuration

To enable HTTPS:

1. Obtain SSL certificates (e.g., using Let's Encrypt):
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

2. Update `nginx/default.conf` to redirect HTTP to HTTPS

3. Update `.env`:
```bash
ALLOWED_HOSTS=yourdomain.com
REACT_APP_API_URL=https://yourdomain.com/api
```

## 🔧 Maintenance

### Database Backup
```bash
# Create backup
docker compose exec db pg_dump -U politico_user politico_db > backup_$(date +%Y%m%d).sql

# Restore backup
docker compose exec -T db psql -U politico_user politico_db < backup_20240101.sql
```

### Update Application
```bash
# Pull latest changes
git pull

# Rebuild and restart (development)
docker compose up -d --build

# Rebuild and restart (production)
docker compose -f docker-compose.prod.yml up -d --build
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f celery_worker
```

### Scale Workers
```bash
# Scale Celery workers
docker compose -f docker-compose.prod.yml up -d --scale celery_worker=4
```

## 🐛 Troubleshooting

### Services won't start
```bash
# Check Docker status
docker info

# Check service logs
docker compose logs

# Rebuild from scratch
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

### Database connection errors
```bash
# Wait for database to be ready
docker compose exec backend python manage.py migrate

# Check database status
docker compose exec db pg_isready -U politico_user
```

### Port conflicts
```bash
# Change ports in docker-compose.yml or docker-compose.prod.yml
# Development: 3000 (frontend), 8000 (backend)
# Production: 80/443 (nginx)
```

## 📊 Monitoring

### Health Checks
```bash
# Check all services
docker compose ps

# Check specific service
docker compose exec backend python manage.py check
```

### Performance Monitoring
- Backend logs: `/backend/logs/django-error.log`
- Celery logs: `docker compose logs celery_worker`
- Database logs: `docker compose logs db`

## 🔐 Security Checklist

- [ ] Change default passwords in `.env`
- [ ] Set strong `SECRET_KEY` in `.env`
- [ ] Set `DEBUG=False` in production
- [ ] Configure `ALLOWED_HOSTS` properly
- [ ] Enable HTTPS with SSL certificates
- [ ] Regular database backups
- [ ] Keep Docker images updated
- [ ] Monitor logs for suspicious activity

## 📚 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [React Documentation](https://react.dev/)

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review logs: `./start.sh logs`
3. Check service status: `./start.sh status`

---

**Note**: This deployment setup is production-ready but can be further customized based on your specific requirements (e.g., cloud providers, orchestration tools like Kubernetes, etc.).

