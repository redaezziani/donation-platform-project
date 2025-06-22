#!/bin/bash

# 🚀 Quick Start Script for Donation Platform
# This script helps you get the platform running quickly with Docker

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print functions
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo ""
}

# Check if Docker and Docker Compose are installed
check_dependencies() {
    print_header "Checking Dependencies"
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first:"
        echo "  https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first:"
        echo "  https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    print_status "Docker and Docker Compose are installed"
}

# Setup environment variables
setup_environment() {
    print_header "Setting Up Environment Variables"
    
    if [ ! -f .env ]; then
        print_info "Creating .env file from template..."
        cp .env.example .env
        print_status "Created .env file"
        print_warning "Please edit .env file with your actual configuration before proceeding"
        print_warning "Especially important: SECRET_KEY, STRIPE keys, and EMAIL settings"
        
        read -p "Do you want to continue with the default values for now? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Please edit .env file and run this script again"
            exit 0
        fi
    else
        print_status ".env file already exists"
    fi
}

# Build and start the platform
start_platform() {
    print_header "Building and Starting the Platform"
    
    print_info "Building Docker images (this may take a few minutes)..."
    docker-compose build
    
    print_info "Starting all services..."
    docker-compose up -d
    
    print_status "Platform is starting up..."
    
    # Wait for services to be ready
    print_info "Waiting for database to be ready..."
    sleep 10
    
    # Run database migrations
    print_info "Running database migrations..."
    docker-compose exec -T backend alembic upgrade head
    
    # Create admin user
    print_info "Creating admin user..."
    docker-compose exec -T backend python -m app.db.seed_admin
    
    print_status "Platform is ready!"
}

# Show access information
show_access_info() {
    print_header "Platform Access Information"
    
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:8000"
    echo "📚 API Documentation: http://localhost:8000/docs"
    echo ""
    echo "👤 Default Admin Login:"
    echo "   Email: admin@qalbwahed.org"
    echo "   Password: admin123"
    echo ""
    print_warning "Don't forget to change the admin password!"
    echo ""
    echo "📋 Useful Commands:"
    echo "   View logs: docker-compose logs -f"
    echo "   Stop platform: docker-compose down"
    echo "   Restart: docker-compose restart"
    echo ""
}

# Show development mode option
show_development_option() {
    print_header "Development Mode"
    echo "For development with hot-reload, you can use:"
    echo "   docker-compose -f docker-compose.dev.yml up -d"
    echo ""
    echo "This provides:"
    echo "   • Frontend hot-reload on port 5173"
    echo "   • Backend hot-reload"
    echo "   • Source code mounting for instant changes"
    echo ""
}

# Check if services are running
check_services() {
    print_header "Service Status"
    
    # Check if containers are running
    if docker-compose ps | grep -q "Up"; then
        print_status "Services are running"
        docker-compose ps
    else
        print_error "Services are not running. Try running: docker-compose up -d"
    fi
}

# Main function
main() {
    echo ""
    echo "🌟 Welcome to the Donation Platform Quick Start!"
    echo "This script will help you get the platform running with Docker."
    echo ""
    
    # Parse command line arguments
    case "${1:-start}" in
        "start")
            check_dependencies
            setup_environment
            start_platform
            show_access_info
            show_development_option
            ;;
        "status")
            check_services
            ;;
        "stop")
            print_header "Stopping the Platform"
            docker-compose down
            print_status "Platform stopped"
            ;;
        "restart")
            print_header "Restarting the Platform"
            docker-compose restart
            print_status "Platform restarted"
            ;;
        "logs")
            print_header "Platform Logs"
            docker-compose logs -f
            ;;
        "clean")
            print_header "Cleaning Up"
            print_warning "This will remove all containers and volumes (including database data)"
            read -p "Are you sure? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                docker-compose down -v
                docker system prune -f
                print_status "Cleanup completed"
            else
                print_info "Cleanup cancelled"
            fi
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [COMMAND]"
            echo ""
            echo "Commands:"
            echo "  start    - Start the platform (default)"
            echo "  status   - Check service status"
            echo "  stop     - Stop the platform"
            echo "  restart  - Restart the platform"
            echo "  logs     - View platform logs"
            echo "  clean    - Clean up containers and volumes"
            echo "  help     - Show this help message"
            echo ""
            ;;
        *)
            print_error "Unknown command: $1"
            echo "Use '$0 help' to see available commands"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
