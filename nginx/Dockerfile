FROM nginx:alpine

# Create directories for static and media files
RUN mkdir -p /usr/share/nginx/html/static \
    && mkdir -p /usr/share/nginx/html/media \
    && chmod -R 755 /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 