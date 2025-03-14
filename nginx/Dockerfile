FROM nginx:alpine

# Create directories and set permissions
RUN mkdir -p /usr/share/nginx/html \
    && mkdir -p /usr/share/nginx/html/static \
    && mkdir -p /usr/share/nginx/html/media \
    && chown -R nginx:nginx /usr/share/nginx/html \
    && chmod -R 755 /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 