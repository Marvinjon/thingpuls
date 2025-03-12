# Deployment Guide for Politico

This guide outlines the steps to deploy the Politico project using Docker on a production server.

## Prerequisites

- A Linux server with Docker and Docker Compose installed
- Domain name pointed to your server's IP address (for production)
- Basic knowledge of Docker, Linux, and server administration
- SSH access to your server

## Deployment Steps

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd politico_web
```

### 2. Configure Environment Variables

Create a production environment file:

```bash
cp .env.production .env
```

Edit the `.env` file to set your production variables:
- Set a secure random `SECRET_KEY`
- Set `ALLOWED_HOSTS` to your domain name
- Set strong database passwords
- Configure email settings
- Add any other required environment variables

### 3. Build and Start the Docker Containers

```bash
docker-compose up -d --build
```

This command will:
- Build all the required Docker images
- Create and start the containers in detached mode
- Set up the network between containers
- Create volumes for data persistence

### 4. Verify Deployment

To check if all containers are running:

```bash
docker-compose ps
```

If all services show as "running," your application should be accessible at your domain or server IP address.

### 5. Initial Setup (First-time only)

Create a superuser for the Django admin panel:

```bash
docker-compose exec backend python backend/manage.py createsuperuser
```

### 6. SSL/TLS Configuration (Recommended for Production)

For production deployment, you should secure your site with HTTPS. One easy way is to use Certbot with Let's Encrypt:

1. Install Certbot on your host machine
2. Obtain certificates for your domain
3. Update the nginx configuration to use SSL/TLS

Example Certbot command:
```bash
certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 7. Updating the Application

To update the application when you make changes:

```bash
# Pull the latest changes from your repository
git pull

# Rebuild and restart the containers
docker-compose down
docker-compose up -d --build
```

### 8. Monitoring and Logs

To view logs for troubleshooting:

```bash
# View logs for all services
docker-compose logs

# View logs for a specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs nginx
```

### 9. Backup and Restore

#### Backup Database

```bash
docker-compose exec db pg_dump -U politico_user politico_db > backup_$(date +%Y-%m-%d_%H-%M-%S).sql
```

#### Restore Database

```bash
docker-compose exec -T db psql -U politico_user politico_db < backup_file.sql
```

### 10. Scaling (Optional)

For high-traffic applications, you might want to scale services:

```bash
# Scale the backend service to 3 instances
docker-compose up -d --scale backend=3
```

Note: Additional configuration in nginx would be required to load balance between instances.

## Troubleshooting

### Common Issues and Solutions

1. **Container fails to start**: Check logs with `docker-compose logs [service_name]`
2. **Database connection issues**: Ensure the database container is healthy and the credentials are correct
3. **Static files not loading**: Check if the volume mounts are correct and collectstatic has run
4. **500 server errors**: Check the backend logs for Python exceptions

### Security Considerations

1. Never expose the PostgreSQL port (5432) to the public internet
2. Set DEBUG=False in production
3. Use strong, unique passwords for all services
4. Regularly update Docker images and dependencies
5. Set up firewall rules to only allow necessary ports (80, 443)

## Further Resources

- [Docker Documentation](https://docs.docker.com/)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/) 