# 🚀 Deployment Guide

This guide covers different deployment strategies for the Donation Platform.

## 📋 Table of Contents

- [Docker Deployment](#-docker-deployment)
- [Manual Deployment](#-manual-deployment)
- [Cloud Deployment](#-cloud-deployment)
- [Environment Configuration](#-environment-configuration)
- [SSL Setup](#-ssl-setup)
- [Monitoring](#-monitoring)

## 🐳 Docker Deployment

### Quick Start with Docker Compose

1. **Clone and setup**:
```bash
git clone <repository-url>
cd donation-platform-project
```

2. **Configure environment**:
```bash
cp .env.docker .env
# Edit .env with your actual configuration
nano .env
```

3. **Run with Docker Compose**:
```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Run database migrations
docker-compose exec backend alembic upgrade head

# Create admin user
docker-compose exec backend python -m app.db.seed_admin
```

4. **Access the application**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Individual Docker Commands

```bash
# Build backend
docker build -t donation-backend ./donation-platfrom-backend

# Build frontend
docker build -t donation-frontend ./donation-platform-frontend

# Run MySQL
docker run -d --name mysql \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=donation_db \
  -e MYSQL_USER=donation_user \
  -e MYSQL_PASSWORD=donation_pass \
  -p 3306:3306 \
  mysql:8.0

# Run backend
docker run -d --name backend \
  --link mysql:mysql \
  -p 8000:8000 \
  -e DATABASE_URL=mysql+pymysql://donation_user:donation_pass@mysql:3306/donation_db \
  donation-backend

# Run frontend
docker run -d --name frontend \
  --link backend:backend \
  -p 3000:3000 \
  -e VITE_API_BASE_URL=http://localhost:8000 \
  donation-frontend
```

## 🔧 Manual Deployment

### Backend Deployment (Ubuntu/CentOS)

1. **Install dependencies**:
```bash
# Ubuntu
sudo apt update
sudo apt install python3.11 python3.11-venv python3-pip mysql-server nginx

# CentOS
sudo yum update
sudo yum install python3.11 python3-pip mysql-server nginx
```

2. **Setup application**:
```bash
# Clone repository
git clone <repository-url>
cd donation-platform-project/donation-platfrom-backend

# Create virtual environment
python3.11 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

3. **Configure database**:
```sql
-- MySQL setup
CREATE DATABASE donation_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'donation_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON donation_db.* TO 'donation_user'@'localhost';
FLUSH PRIVILEGES;
```

4. **Setup environment**:
```bash
cp .env.example .env
# Edit .env with production values
nano .env
```

5. **Run migrations and seeds**:
```bash
alembic upgrade head
python -m app.db.seed_admin
python -m app.db.seed_campaigns
```

6. **Setup systemd service**:
```bash
sudo nano /etc/systemd/system/donation-api.service
```

```ini
[Unit]
Description=Donation Platform API
After=network.target

[Service]
User=ubuntu
Group=ubuntu
WorkingDirectory=/path/to/donation-platform-project/donation-platfrom-backend
Environment=PATH=/path/to/donation-platform-project/donation-platfrom-backend/.venv/bin
ExecStart=/path/to/donation-platform-project/donation-platfrom-backend/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable donation-api
sudo systemctl start donation-api
```

### Frontend Deployment

1. **Build the application**:
```bash
cd donation-platform-frontend
npm install
npm run build
```

2. **Setup nginx**:
```bash
sudo nano /etc/nginx/sites-available/donation-platform
```

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Frontend
    location / {
        root /path/to/donation-platform-project/donation-platform-frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files (uploads)
    location /uploads/ {
        alias /path/to/donation-platform-project/donation-platfrom-backend/uploads/;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/donation-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## ☁️ Cloud Deployment

### AWS Deployment

1. **EC2 Setup**:
   - Launch Ubuntu 22.04 LTS instance
   - Security groups: HTTP (80), HTTPS (443), SSH (22), Custom (8000)
   - Follow manual deployment steps above

2. **RDS Setup**:
   - Create MySQL 8.0 RDS instance
   - Update DATABASE_URL in .env

3. **S3 for file uploads** (optional):
   - Create S3 bucket for uploads
   - Configure AWS credentials
   - Update storage service

4. **CloudFront** (optional):
   - Create distribution for frontend
   - Configure caching rules

### DigitalOcean App Platform

1. **Create App**:
```yaml
name: donation-platform
services:
- name: backend
  source_dir: donation-platfrom-backend
  github:
    repo: your-username/donation-platform
    branch: main
  run_command: uvicorn app.main:app --host 0.0.0.0 --port 8080
  environment_slug: python
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 8080
  env:
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}
  - key: SECRET_KEY
    value: ${SECRET_KEY}

- name: frontend
  source_dir: donation-platform-frontend
  github:
    repo: your-username/donation-platform
    branch: main
  build_command: npm run build
  run_command: npx serve -s dist -l 8080
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 8080

databases:
- name: db
  engine: MYSQL
  version: "8"
```

### Heroku Deployment

1. **Backend (Heroku)**:
```bash
# In backend directory
echo "web: uvicorn app.main:app --host 0.0.0.0 --port \$PORT" > Procfile
git init
heroku create donation-platform-api
heroku addons:create cleardb:ignite
heroku config:set SECRET_KEY=your-secret-key
heroku config:set STRIPE_SECRET_KEY=your-stripe-key
git add .
git commit -m "Deploy to Heroku"
git push heroku main
heroku run python -m app.db.seed_admin
```

2. **Frontend (Netlify/Vercel)**:
```bash
npm run build
# Deploy dist/ folder to Netlify or Vercel
```

## 🔒 Environment Configuration

### Production Environment Variables

**Backend (.env)**:
```env
DATABASE_URL=mysql+pymysql://user:pass@host:3306/db
SECRET_KEY=super-secure-random-key-256-bits
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Stripe Production Keys
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Production Email
SMTP_SERVER=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com

ENVIRONMENT=production
```

**Frontend (.env.local)**:
```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_ENVIRONMENT=production
```

## 🔐 SSL Setup

### Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test renewal
sudo certbot renew --dry-run

# Auto-renewal crontab
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### Nginx SSL Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Rest of your configuration...
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## 📊 Monitoring

### Health Checks

**Backend Health Endpoint**:
```python
# Add to main.py
@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}
```

### Log Management

**Systemd Logs**:
```bash
# View logs
sudo journalctl -u donation-api -f

# Log rotation
sudo nano /etc/systemd/journald.conf
# Set SystemMaxUse=1G
```

**Application Logs**:
```python
# In main.py
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/donation-api.log'),
        logging.StreamHandler()
    ]
)
```

### Monitoring Tools

1. **Basic Monitoring**:
```bash
# Install htop for system monitoring
sudo apt install htop

# Monitor processes
htop
ps aux | grep uvicorn
```

2. **Database Monitoring**:
```sql
-- Check MySQL performance
SHOW PROCESSLIST;
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Threads_running';
```

3. **Nginx Monitoring**:
```bash
# Check nginx status
sudo systemctl status nginx

# Monitor access logs
sudo tail -f /var/log/nginx/access.log
```

## 🚨 Backup Strategy

### Database Backup

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u donation_user -p donation_db > /backups/donation_db_$DATE.sql
gzip /backups/donation_db_$DATE.sql

# Keep only last 7 days
find /backups -name "donation_db_*.sql.gz" -mtime +7 -delete
```

### File Backup

```bash
# Backup uploads directory
rsync -av /path/to/uploads/ /backups/uploads/

# Backup to S3 (if using AWS)
aws s3 sync /path/to/uploads/ s3://your-backup-bucket/uploads/
```

## 🔧 Maintenance

### Regular Tasks

1. **Update Dependencies**:
```bash
# Backend
pip list --outdated
pip install -r requirements.txt --upgrade

# Frontend
npm outdated
npm update
```

2. **Database Maintenance**:
```sql
-- Optimize tables
OPTIMIZE TABLE campaigns, donations, users;

-- Check table sizes
SELECT 
    table_name,
    round(((data_length + index_length) / 1024 / 1024), 2) as size_mb
FROM information_schema.tables 
WHERE table_schema = 'donation_db';
```

3. **Log Cleanup**:
```bash
# Rotate logs
sudo logrotate /etc/logrotate.conf

# Clean old logs
find /var/log -name "*.log" -mtime +30 -delete
```

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection**:
```bash
# Test MySQL connection
mysql -u donation_user -p -h localhost donation_db

# Check if MySQL is running
sudo systemctl status mysql
```

2. **API Not Responding**:
```bash
# Check if process is running
ps aux | grep uvicorn

# Check port binding
sudo netstat -tlnp | grep 8000

# Restart service
sudo systemctl restart donation-api
```

3. **Frontend Build Issues**:
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

4. **SSL Certificate Issues**:
```bash
# Check certificate
sudo certbot certificates

# Test SSL
openssl s_client -connect yourdomain.com:443
```

---

For additional support, refer to the main README.md or create an issue in the repository.
