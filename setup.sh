#!/bin/bash

# Donation Platform Setup Script
# This script helps you set up the donation platform quickly

echo "🌟 Welcome to Donation Platform Setup!"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if required tools are installed
echo "🔍 Checking prerequisites..."

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    print_status "Python 3 is installed (version $PYTHON_VERSION)"
else
    print_error "Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status "Node.js is installed (version $NODE_VERSION)"
else
    print_error "Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Check MySQL
if command -v mysql &> /dev/null; then
    print_status "MySQL is available"
else
    print_warning "MySQL command not found. Make sure MySQL server is installed and running."
fi

echo ""
echo "📁 Setting up project structure..."

# Setup backend
echo "🔧 Setting up backend..."
cd donation-platfrom-backend

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    print_status "Created .env file from template"
    print_warning "Please edit .env file with your database and API keys"
else
    print_warning ".env file already exists"
fi

# Create virtual environment
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
    print_status "Created Python virtual environment"
else
    print_status "Virtual environment already exists"
fi

# Activate virtual environment and install dependencies
source .venv/bin/activate
pip install -r requirements.txt
print_status "Installed Python dependencies"

cd ..

# Setup frontend
echo "🎨 Setting up frontend..."
cd donation-platform-frontend

# Copy environment file if it doesn't exist
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    print_status "Created .env.local file from template"
    print_warning "Please edit .env.local file with your API URL and Stripe keys"
else
    print_warning ".env.local file already exists"
fi

# Install npm dependencies
npm install
print_status "Installed Node.js dependencies"

cd ..

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "📋 Next Steps:"
echo "1. Configure your database connection in donation-platfrom-backend/.env"
echo "2. Set up your Stripe API keys in both backend and frontend .env files"
echo "3. Configure SMTP settings for email notifications"
echo "4. Create your MySQL database"
echo "5. Run database migrations"
echo ""
echo "🚀 To start the servers:"
echo ""
echo "Backend (Terminal 1):"
echo "  cd donation-platfrom-backend"
echo "  source .venv/bin/activate"
echo "  alembic upgrade head  # Run migrations"
echo "  python -m app.db.seed_admin  # Create admin user"
echo "  uvicorn app.main:app --reload"
echo ""
echo "Frontend (Terminal 2):"
echo "  cd donation-platform-frontend"
echo "  npm run dev"
echo ""
echo "📖 Visit http://localhost:5173 to see your donation platform!"
echo "📚 API docs will be available at http://localhost:8000/docs"
echo ""
echo "Default admin login:"
echo "  Email: admin@qalbwahed.org"
echo "  Password: admin123"
echo "  (Change this in production!)"
