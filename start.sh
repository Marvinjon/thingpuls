#!/bin/bash

# Politico Web Application Startup Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Check if .env file exists
check_env() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from template..."
        if [ -f env.example ]; then
            cp env.example .env
            print_success "Created .env file from template. Please edit it with your settings."
        else
            print_error "env.example file not found. Please create a .env file manually."
            exit 1
        fi
    fi
}

# Function to start development environment
start_dev() {
    print_status "Starting development environment..."
    docker compose -f docker-compose.yml -f docker-compose.dev.yml up "$@"
}

# Function to start production environment
start_prod() {
    print_status "Starting production environment..."
    docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d "$@"
}

# Function to stop all services
stop_all() {
    print_status "Stopping all services..."
    docker compose down
    print_success "All services stopped."
}

# Function to show logs
show_logs() {
    local service=${1:-""}
    if [ -n "$service" ]; then
        docker compose logs -f "$service"
    else
        docker compose logs -f
    fi
}

# Function to run Django commands
run_django() {
    local command="$1"
    if [ -z "$command" ]; then
        print_error "Please specify a Django command."
        exit 1
    fi
    print_status "Running Django command: $command"
    docker compose exec backend python manage.py "$command"
}

# Function to show status
show_status() {
    print_status "Checking service status..."
    docker compose ps
}

# Function to show help
show_help() {
    echo "Politico Web Application Startup Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  dev [OPTIONS]     Start development environment"
    echo "  prod [OPTIONS]    Start production environment"
    echo "  stop              Stop all services"
    echo "  logs [SERVICE]    Show logs (all services or specific service)"
    echo "  status            Show service status"
    echo "  django <CMD>      Run Django management command"
    echo "  help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev                    # Start development with all services"
    echo "  $0 dev --profile nginx    # Start development without nginx"
    echo "  $0 prod                   # Start production environment"
    echo "  $0 logs backend           # Show backend logs"
    echo "  $0 django migrate         # Run Django migrations"
    echo "  $0 django createsuperuser # Create Django superuser"
    echo ""
    echo "Development URLs:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:8000"
    echo "  Admin:    http://localhost:8000/admin"
    echo ""
    echo "Production URLs:"
    echo "  Application: http://localhost"
    echo "  API:        http://localhost/api/v1/"
    echo "  Admin:      http://localhost/admin"
}

# Main script logic
main() {
    local command="$1"
    shift

    case "$command" in
        "dev")
            check_docker
            check_env
            start_dev "$@"
            ;;
        "prod")
            check_docker
            check_env
            start_prod "$@"
            ;;
        "stop")
            stop_all
            ;;
        "logs")
            show_logs "$@"
            ;;
        "status")
            show_status
            ;;
        "django")
            run_django "$@"
            ;;
        "help"|"--help"|"-h"|"")
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@" 