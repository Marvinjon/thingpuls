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
    docker compose up "$@"
}

# Function to start production environment
start_prod() {
    print_status "Starting production environment..."
    print_status "Building and starting services..."
    docker compose -f docker-compose.prod.yml up -d --build
    print_success "Production environment started!"
    print_status "Application will be available at http://localhost"
}

# Function to stop all services
stop_all() {
    print_status "Stopping all services..."
    docker compose down
    docker compose -f docker-compose.prod.yml down 2>/dev/null || true
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
    if [ $# -eq 0 ]; then
        print_error "Please specify a Django command."
        exit 1
    fi
    print_status "Running Django command: $*"
    docker compose exec backend python manage.py "$@"
}

# Function to show status
show_status() {
    print_status "Checking service status..."
    echo ""
    print_status "Development services:"
    docker compose ps
    echo ""
    print_status "Production services:"
    docker compose -f docker-compose.prod.yml ps 2>/dev/null || echo "No production services running"
}

# Function to clean up
clean() {
    print_warning "This will remove all containers, volumes, and images."
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleaning up..."
        docker compose down -v
        docker compose -f docker-compose.prod.yml down -v 2>/dev/null || true
        print_success "Cleanup complete."
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to run scrapers
run_scrapers() {
    if [ -z "$1" ]; then
        print_error "Session number is required"
        echo "Usage: $0 scrapers <session_number>"
        echo "Example: $0 scrapers 157"
        exit 1
    fi
    
    SESSION=$1
    print_status "Running scrapers for session $SESSION..."
    
    docker compose exec backend bash -c "
    echo '1. Fetching Political Parties...'
    python scrapers/fetch_parties.py $SESSION
    echo ''
    
    echo '2. Fetching MPs...'
    python scrapers/fetch_mps.py $SESSION
    echo ''
    
    echo '3. Fetching Bills...'
    python scrapers/fetch_bills.py $SESSION
    echo ''
    
    echo '4. Assigning Topics...'
    python scrapers/assign_topics.py
    echo ''
    
    echo '5. Fetching Voting Records...'
    python scrapers/fetch_voting_records.py $SESSION
    echo ''
    
    echo '6. Fetching Speeches...'
    python scrapers/fetch_speeches.py $SESSION
    echo ''
    
    echo '7. Fetching MP Interests...'
    python scrapers/fetch_interests.py
    echo ''
    
    echo 'All done!'
    "
    
    print_success "Scrapers completed!"
}

# Function to show help
show_help() {
    echo "Politico Web Application - Deployment Ready"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  dev [OPTIONS]         Start development environment (docker compose up)"
    echo "  prod                  Start production environment (with nginx)"
    echo "  stop                  Stop all services"
    echo "  logs [SERVICE]        Show logs (all services or specific service)"
    echo "  status                Show service status"
    echo "  django <CMD>          Run Django management command"
    echo "  scrapers <SESSION>    Run all scrapers for a specific session"
    echo "  clean                 Remove all containers and volumes"
    echo "  help                  Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev                       # Start development (foreground)"
    echo "  $0 dev -d                    # Start development (detached)"
    echo "  $0 prod                      # Start production environment"
    echo "  $0 logs backend              # Show backend logs"
    echo "  $0 django migrate            # Run Django migrations"
    echo "  $0 django createsuperuser    # Create Django superuser"
    echo "  $0 scrapers 157              # Run scrapers for session 157"
    echo ""
    echo "Development URLs (docker compose up -d):"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:8000"
    echo "  Admin:    http://localhost:8000/admin"
    echo ""
    echo "Production URLs (docker compose -f docker-compose.prod.yml up -d):"
    echo "  Application: http://localhost"
    echo "  Admin:       http://localhost/admin"
    echo ""
}

# Main script logic
main() {
    local command="${1:-help}"
    shift || true

    case "$command" in
        "dev")
            check_docker
            check_env
            start_dev "$@"
            ;;
        "prod")
            check_docker
            check_env
            start_prod
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
        "scrapers")
            run_scrapers "$@"
            ;;
        "clean")
            clean
            ;;
        "help"|"--help"|"-h")
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
