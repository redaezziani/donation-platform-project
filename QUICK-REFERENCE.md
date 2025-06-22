# 🎯 Quick Reference Guide

Quick commands and snippets for common tasks in the Donation Platform.

## 🚀 Development Commands

### Backend (FastAPI)

```bash
# Start development server
cd donation-platfrom-backend
source .venv/bin/activate
uvicorn app.main:app --reload

# Alternative: specific host/port
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

# Run with debug logging
PYTHONPATH=$PWD uvicorn app.main:app --reload --log-level debug
```

### Frontend (React + Vite)

```bash
# Start development server
cd donation-platform-frontend
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run on different port
npm run dev -- --port 3001
```

## 🗄 Database Commands

### Alembic Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Add new feature"

# Apply migrations
alembic upgrade head

# Downgrade one migration
alembic downgrade -1

# Show current migration
alembic current

# Show migration history
alembic history
```

### Database Seeding

```bash
# Create admin user
python -m app.db.seed_admin

# Create sample campaigns
python -m app.db.seed_campaigns

# Initialize database
python -m app.db.init_db
```

### Manual Database Operations

```sql
-- Create database
CREATE DATABASE donation_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER 'donation_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON donation_db.* TO 'donation_user'@'localhost';
FLUSH PRIVILEGES;

-- Check tables
USE donation_db;
SHOW TABLES;
DESCRIBE campaigns;

-- Basic queries
SELECT COUNT(*) FROM campaigns;
SELECT COUNT(*) FROM donations WHERE payment_status = 'completed';
SELECT SUM(amount) FROM donations WHERE payment_status = 'completed';
```

## 🔧 API Testing

### Using curl

```bash
# Health check
curl http://localhost:8000/health

# Register user
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123",
    "full_name": "Test User"
  }'

# Login
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get campaigns (with auth)
curl -X GET "http://localhost:8000/api/v1/campaigns/paginated" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using httpie (if installed)

```bash
# Install httpie
pip install httpie

# Register user
http POST localhost:8000/api/v1/auth/register \
  email=test@example.com \
  username=testuser \
  password=password123 \
  full_name="Test User"

# Login
http POST localhost:8000/api/v1/auth/login \
  email=test@example.com \
  password=password123

# Get campaigns
http GET localhost:8000/api/v1/campaigns/paginated \
  Authorization:"Bearer YOUR_TOKEN"
```

## 🐳 Docker Commands

### Development with Docker

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
docker-compose logs backend
docker-compose logs frontend

# Execute commands in containers
docker-compose exec backend bash
docker-compose exec backend alembic upgrade head
docker-compose exec backend python -m app.db.seed_admin

# Stop services
docker-compose down

# Remove volumes (careful!)
docker-compose down -v
```

### Individual Docker Commands

```bash
# Build backend
docker build -t donation-backend ./donation-platfrom-backend

# Run backend container
docker run -p 8000:8000 \
  -e DATABASE_URL=mysql+pymysql://user:pass@host:3306/db \
  donation-backend

# Build frontend
docker build -t donation-frontend ./donation-platform-frontend

# Run frontend container
docker run -p 3000:3000 \
  -e VITE_API_BASE_URL=http://localhost:8000 \
  donation-frontend
```

## 🔍 Debugging & Logs

### Backend Debugging

```bash
# View systemd logs (production)
sudo journalctl -u donation-api -f

# Check Python errors
python -c "import app.main"

# Test database connection
python -c "
from app.db.database import engine
try:
    engine.connect()
    print('Database connection successful')
except Exception as e:
    print(f'Database connection failed: {e}')
"

# Check imports
python -c "from app.db.models import User, Campaign, Donation; print('Models imported successfully')"
```

### Frontend Debugging

```bash
# Check for JavaScript errors in browser console
# Open browser dev tools (F12) -> Console

# Build with source maps for debugging
npm run build -- --sourcemap

# Analyze bundle size
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/static/js/*.js
```

## 📊 Monitoring Commands

### System Monitoring

```bash
# Check system resources
htop
free -h
df -h

# Check processes
ps aux | grep uvicorn
ps aux | grep node

# Check ports
sudo netstat -tlnp | grep :8000
sudo netstat -tlnp | grep :3000
```

### Database Monitoring

```sql
-- Check active connections
SHOW PROCESSLIST;

-- Check database size
SELECT 
    table_schema as 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) as 'Size (MB)'
FROM information_schema.tables
GROUP BY table_schema;

-- Check table sizes
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) as 'Size (MB)',
    table_rows
FROM information_schema.tables 
WHERE table_schema = 'donation_db'
ORDER BY (data_length + index_length) DESC;
```

### Application Health

```bash
# Check if services are responding
curl -f http://localhost:8000/health || echo "Backend down"
curl -f http://localhost:3000 || echo "Frontend down"

# Check database health through API
curl http://localhost:8000/api/v1/campaigns/paginated?page_size=1

# Memory usage
ps -o pid,vsz,rss,comm -p $(pgrep uvicorn)
ps -o pid,vsz,rss,comm -p $(pgrep node)
```

## 🛠 Maintenance Commands

### Update Dependencies

```bash
# Backend
cd donation-platfrom-backend
pip list --outdated
pip install -r requirements.txt --upgrade

# Frontend
cd donation-platform-frontend
npm outdated
npm update
npm audit fix
```

### Clean Up

```bash
# Clean Python cache
find . -type d -name __pycache__ -delete
find . -name "*.pyc" -delete

# Clean Node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clean Docker
docker system prune -a
docker volume prune
```

### Backup Commands

```bash
# Database backup
mysqldump -u donation_user -p donation_db > backup_$(date +%Y%m%d).sql

# Compress backup
gzip backup_$(date +%Y%m%d).sql

# Restore database
mysql -u donation_user -p donation_db < backup_20240101.sql

# Backup uploads
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/
```

## 🚨 Emergency Commands

### Service Recovery

```bash
# Restart backend service (systemd)
sudo systemctl restart donation-api
sudo systemctl status donation-api

# Restart nginx
sudo systemctl restart nginx
sudo nginx -t

# Restart MySQL
sudo systemctl restart mysql
sudo systemctl status mysql

# Kill stuck processes
pkill -f uvicorn
pkill -f node
```

### Database Recovery

```sql
-- Check for corrupted tables
CHECK TABLE campaigns;
CHECK TABLE donations;
CHECK TABLE users;

-- Repair tables if needed
REPAIR TABLE campaigns;

-- Reset auto-increment
ALTER TABLE campaigns AUTO_INCREMENT = 1;
```

### Log Analysis

```bash
# Find errors in logs
sudo grep -i error /var/log/nginx/error.log
sudo journalctl -u donation-api | grep -i error

# Check disk space
df -h
du -sh /var/log/*

# Clear logs if needed (careful!)
sudo truncate -s 0 /var/log/nginx/access.log
sudo truncate -s 0 /var/log/nginx/error.log
```

## 🔑 Environment Variables Quick Reference

### Backend (.env)

```env
# Required
DATABASE_URL=mysql+pymysql://user:pass@host:3306/db
SECRET_KEY=your-secret-key
STRIPE_SECRET_KEY=sk_test_or_live_...

# Email
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Optional
ACCESS_TOKEN_EXPIRE_MINUTES=60
API_V1_STR=/api/v1
ENVIRONMENT=development
```

### Frontend (.env.local)

```env
# Required
VITE_API_BASE_URL=http://localhost:8000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_or_live_...

# Optional
VITE_ENVIRONMENT=development
```

## 📱 Mobile Testing

```bash
# Test on mobile device (same network)
# Find your IP address
ip addr show | grep inet

# Access via IP
# Frontend: http://YOUR_IP:3000
# Backend: http://YOUR_IP:8000

# Or use ngrok for external access
npx ngrok http 3000
npx ngrok http 8000
```

## 🎨 UI Development

```bash
# Component development with Storybook (if added)
npm run storybook

# Tailwind CSS IntelliSense
# Install Tailwind CSS IntelliSense extension in VS Code

# Check Tailwind classes
npm run build-css

# Analyze CSS bundle
npm install -g purgecss
purgecss --css dist/assets/*.css --content dist/*.html
```

---

💡 **Tip**: Bookmark this guide and keep it handy during development!

For more detailed information, refer to the main README.md file.
