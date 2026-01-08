# Deployment Fix Guide

## Issue Summary

There are two main issues:

1. **Volume Conflict (CRITICAL)**: Django's `static_volume` was mounted to `/usr/share/nginx/html/static`, which overwrote React's build `static` folder containing CSS/JS files. This caused 404 errors for all static assets.

2. **Frontend API URL**: The `.env` file has `REACT_APP_API_URL=http://localhost:8000`, which causes the frontend to try connecting to the user's local machine instead of the server.

## Root Causes

### Issue 1: Volume Conflict (Static Files 404)

The `docker-compose.prod.yml` was mounting Django's `static_volume` to `/usr/share/nginx/html/static`, which **overwrote** React's build `static` folder. This is why you saw:
- `GET /static/css/main.xxx.css net::ERR_ABORTED 404`
- `GET /static/js/main.xxx.js net::ERR_ABORTED 404`

**Fix Applied**: Changed the mount point to `/usr/share/nginx/html/django_static` and updated nginx config to serve Django static files from that location.

### Issue 2: Frontend API URL

In your `.env` file, `REACT_APP_API_URL=http://localhost:8000` is set. This causes the frontend (running in the user's browser) to try to connect to `http://localhost:8000/api/v1`, which points to the user's local machine, not your server.

**Fix**: Use relative URLs (empty `REACT_APP_API_URL`) since nginx proxies `/api/` to the backend.

## Solution

### Step 1: Fix the Volume Conflict (ALREADY FIXED IN CODE)

The code has been updated to:
- Mount Django static files to `/usr/share/nginx/html/django_static` instead of `/static`
- Update nginx config to serve Django admin files from `/django_static/`
- Keep React static files in the original `/static/` location

### Step 2: Update your `.env` file

### Step 1: Update your `.env` file

On your server, edit the `.env` file:

```bash
cd ~/thingpuls/politico_web
nano .env
```

Change this line:
```bash
REACT_APP_API_URL=http://localhost:8000
```

To this (empty string):
```bash
REACT_APP_API_URL=
```

Or simply remove the line entirely (it will default to empty string).

### Step 3: Clean Rebuild (IMPORTANT!)

Because of the volume conflict, you **must** remove the old volumes and rebuild:

```bash
# Stop everything and remove volumes (they'll be recreated)
sudo docker compose -f docker-compose.prod.yml down -v

# Rebuild and start everything
sudo docker compose -f docker-compose.prod.yml up -d --build
```

**Why `-v` is needed**: The old `static_volume` may have cached the wrong directory structure. Removing it ensures a clean start.

### Step 4: Verify the fix

1. Check that containers are running:
   ```bash
   sudo docker compose -f docker-compose.prod.yml ps
   ```

2. Test locally on the server:
   ```bash
   curl http://localhost
   ```

3. Check the frontend build logs:
   ```bash
   sudo docker compose -f docker-compose.prod.yml logs frontend
   ```

4. Verify static files are accessible:
   ```bash
   # Check React static files exist
   sudo docker compose -f docker-compose.prod.yml exec nginx ls -la /usr/share/nginx/html/static/
   
   # Check Django static files exist
   sudo docker compose -f docker-compose.prod.yml exec nginx ls -la /usr/share/nginx/html/django_static/
   
   # Test React CSS file
   curl http://localhost/static/css/main.*.css
   ```

5. Access your site through Cloudflare Tunnel: `https://thingpuls.mhmehf.is`

## Additional Fixes Applied

I've also made the following improvements to the codebase:

1. **Production settings now load from `.env`**: The production settings will now load from `.env` if `.env.production` doesn't exist, making it easier to use a single `.env` file.

2. **ALLOWED_HOSTS is configurable**: You can now set `ALLOWED_HOSTS` in your `.env` file if needed:
   ```bash
   ALLOWED_HOSTS=localhost,thingpuls.mhmehf.is
   ```

3. **Volume conflict fixed**: Django static files now mount to `/django_static/` to avoid overwriting React's static files.

4. **Created manifest.json**: Added the missing manifest.json file to fix the browser console error.

## How It Works

- **Development**: Frontend runs on port 3000, backend on port 8000. Frontend uses `http://localhost:8000` to connect to backend.
- **Production**: 
  - Nginx serves the built frontend on port 80
  - Nginx proxies `/api/` requests to the backend container
  - Frontend uses relative URLs (empty `REACT_APP_API_URL`) so requests go to `/api/v1`, which nginx proxies to the backend

## Troubleshooting

If you still see issues:

1. **Check nginx logs**:
   ```bash
   sudo docker compose -f docker-compose.prod.yml logs nginx
   ```

2. **Check backend logs**:
   ```bash
   sudo docker compose -f docker-compose.prod.yml logs backend
   ```

3. **Check frontend build**:
   ```bash
   sudo docker compose -f docker-compose.prod.yml logs frontend
   ```

4. **Verify nginx configuration**:
   ```bash
   sudo docker compose -f docker-compose.prod.yml exec nginx nginx -t
   ```

5. **Test API directly**:
   ```bash
   curl http://localhost/api/v1/parliament/mps/
   ```

## About the "UNSUPPORTED_OS" Error

This error message is typically a browser console warning from WebAssembly or system-level APIs that the browser tries to access. It's usually harmless and doesn't affect functionality. If you see it in the browser console but the site works, you can ignore it.

If the site doesn't work, the issue is likely the API URL configuration described above, not the "UNSUPPORTED_OS" error.

