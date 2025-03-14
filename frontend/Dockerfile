FROM node:18-alpine as build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create a directory to store the build files
RUN mkdir -p /build
RUN cp -r build/* /build/

# Keep the container running and ensure the build files are accessible
VOLUME ["/build"]
CMD ["sh", "-c", "cp -r /build/* /app/build/ && tail -f /dev/null"] 