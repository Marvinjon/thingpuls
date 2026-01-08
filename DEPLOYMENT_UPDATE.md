# Production Update Guide

When you make changes to the codebase and want to deploy them to production:

## Quick Update (Frontend changes only)

If you only changed frontend code (React components, styles, etc.):

```bash
# On the production server
cd ~/thingpuls/politico_web
git pull

# Rebuild and restart frontend
sudo docker compose -f docker-compose.prod.yml build frontend
sudo docker compose -f docker-compose.prod.yml up -d frontend nginx
```

## Full Update (Backend changes or both)

If you changed backend code, models, or both frontend and backend:

```bash
# On the production server
cd ~/thingpuls/politico_web
git pull

# Rebuild all services
sudo docker compose -f docker-compose.prod.yml build

# Restart all services
sudo docker compose -f docker-compose.prod.yml up -d

# If you added new migrations, they will run automatically on backend startup
```

## Update with Database Migrations

If you added new database migrations:

```bash
# On the production server
cd ~/thingpuls/politico_web
git pull

# Rebuild backend
sudo docker compose -f docker-compose.prod.yml build backend

# Run migrations manually (optional, they run on startup too)
sudo docker compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Restart backend
sudo docker compose -f docker-compose.prod.yml restart backend
```

## Important Notes

- **`restart`** only restarts containers with existing images - it doesn't rebuild
- **`build`** rebuilds the Docker images with new code
- **`up -d`** starts/restarts containers and uses the latest built images
- Frontend changes require rebuilding the frontend container to compile React
- Backend changes require rebuilding the backend container
- Database migrations run automatically on backend startup, but you can run them manually too

## Troubleshooting

If changes don't appear:
1. Make sure you did `git pull` to get the latest code
2. Make sure you ran `build` (not just `restart`)
3. Check container logs: `sudo docker compose -f docker-compose.prod.yml logs frontend`
4. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
5. Check if nginx is serving the new build: `sudo docker compose -f docker-compose.prod.yml logs nginx`

