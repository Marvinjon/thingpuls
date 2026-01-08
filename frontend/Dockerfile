# Multi-stage build for both development and production
FROM node:18-alpine as base

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Development stage
FROM base as development

ENV NODE_ENV=development
ENV REACT_APP_API_URL=http://localhost:8000

EXPOSE 3000

CMD ["npm", "start"]

# Production build stage
FROM base as production

ARG REACT_APP_API_URL
ENV NODE_ENV=production
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Build the application
RUN npm run build

# Create a directory to store the build files
RUN mkdir -p /build
RUN cp -r build/* /build/

# Keep the container running and ensure the build files are accessible
VOLUME ["/build"]
CMD ["sh", "-c", "cp -r /build/* /app/build/ && tail -f /dev/null"] 