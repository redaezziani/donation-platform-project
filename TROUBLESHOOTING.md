# 🔧 Troubleshooting Guide

This guide helps you resolve common issues with the Donation Platform.

## 🚫 Common Issues and Solutions

### 1. Database Connection Issues

#### Error: "Can't connect to MySQL server"
```bash
# Check if MySQL container is running
docker-compose ps mysql

# If not running, start it
docker-compose up -d mysql

# Check MySQL logs
docker-compose logs mysql

# Test connection manually
docker-compose exec mysql mysql -u donation_user -p donation_db
```

#### Error: "Access denied for user"
- Check database credentials in `.env` file
- Ensure MYSQL_USER and MYSQL_PASSWORD match DATABASE_URL
- Try recreating the database container:
```bash
docker-compose down
docker volume rm donation-platform-project_mysql_data
docker-compose up -d mysql
```

### 2. Backend API Issues

#### Error: "Backend not responding / 502 Bad Gateway"
```bash
# Check backend container status
docker-compose ps backend

# View backend logs
docker-compose logs backend

# Check if port 8000 is available
sudo netstat -tlnp | grep 8000

# Restart backend service
docker-compose restart backend
```

#### Error: "ModuleNotFoundError" or Python import errors
```bash
# Rebuild backend container
docker-compose build --no-cache backend
docker-compose up -d backend

# Check if all requirements are installed
docker-compose exec backend pip list
```

#### Error: "Alembic migration failed"
```bash
# Check current migration status
docker-compose exec backend alembic current

# View migration history
docker-compose exec backend alembic history

# If needed, reset and re-run migrations
docker-compose exec backend alembic downgrade base
docker-compose exec backend alembic upgrade head
```

### 3. Frontend Issues

#### Error: "Frontend not loading / blank page"
```bash
# Check frontend container logs
docker-compose logs frontend

# Check if running on correct port
curl http://localhost:3000

# Rebuild frontend container
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

#### Error: "API calls failing / CORS errors"
- Check `VITE_API_BASE_URL` in frontend `.env`
- Ensure backend is accessible at the configured URL
- For Docker: use `http://localhost:8000` (not container names)
- Check browser network tab for actual error responses

#### Error: "Environment variables not loaded"
- Ensure `.env` files exist in both frontend and root directories
- Environment variables must be prefixed with `VITE_` for frontend
- Restart containers after changing environment variables

### 4. Payment (Stripe) Issues

#### Error: "Stripe key not found" or payment failures
- Verify Stripe keys in `.env` file are correct
- Check if using test keys vs live keys appropriately
- Ensure `STRIPE_PUBLISHABLE_KEY` matches `VITE_STRIPE_PUBLISHABLE_KEY`
- Test with Stripe test card numbers:
  - Success: 4242 4242 4242 4242
  - Declined: 4000 0000 0000 0002

#### Error: "Webhook verification failed"
- Ensure `STRIPE_WEBHOOK_SECRET` is set correctly
- Check webhook endpoint in Stripe dashboard
- Verify webhook is pointing to correct URL

### 5. Email Issues

#### Error: "Email not sending"
```bash
# Test email configuration
docker-compose exec backend python -c "
from app.services.email_service import EmailService
service = EmailService()
print('Testing email...')
# This will show any SMTP errors
"
```

#### Gmail-specific issues:
- Ensure 2FA is enabled on Gmail account
- Use App Password, not regular password
- Check if "Less secure app access" is disabled (should be)
- Verify SMTP settings:
  - Server: smtp.gmail.com
  - Port: 587
  - Username: your full Gmail address
  - Password: App Password (16 characters, no spaces)

### 6. Docker Issues

#### Error: "Cannot connect to Docker daemon"
```bash
# Start Docker service
sudo systemctl start docker

# Add user to docker group (requires logout/login)
sudo usermod -aG docker $USER
```

#### Error: "Port already in use"
```bash
# Find process using the port
sudo netstat -tlnp | grep :8000

# Kill the process (replace PID)
sudo kill -9 <PID>

# Or change port in docker-compose.yml
```

#### Error: "No space left on device"
```bash
# Clean up Docker system
docker system prune -f

# Remove unused volumes
docker volume prune -f

# Remove unused images
docker image prune -a -f
```

#### Error: "Build context is too large"
- Add `.dockerignore` files to exclude unnecessary files
- Common excludes: `node_modules/`, `.git/`, `*.log`, `.env`

### 7. Performance Issues

#### Slow database queries
```bash
# Check MySQL slow query log
docker-compose exec mysql mysql -u root -p -e "SHOW VARIABLES LIKE 'slow_query_log';"

# Monitor MySQL performance
docker-compose exec mysql mysqladmin -u root -p processlist
```

#### High memory usage
```bash
# Check container resource usage
docker stats

# Limit container memory in docker-compose.yml:
# deploy:
#   resources:
#     limits:
#       memory: 512M
```

### 8. SSL/HTTPS Issues (Production)

#### Error: "Mixed content" or "Insecure connection"
- Ensure all URLs use HTTPS in production
- Update `VITE_API_BASE_URL` to use `https://`
- Check SSL certificate validity
- Verify CORS settings allow HTTPS origins

#### Error: "SSL certificate verification failed"
```bash
# Test SSL certificate
openssl s_client -connect yourdomain.com:443

# Check certificate expiration
echo | openssl s_client -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

## 🔍 Debug Mode

### Enable Debug Logging

1. **Backend Debug Mode**:
```bash
# Add to backend/.env
ENVIRONMENT=development
LOG_LEVEL=DEBUG

# Restart backend
docker-compose restart backend
```

2. **Frontend Debug Mode**:
```bash
# Add to frontend/.env
VITE_ENVIRONMENT=development
VITE_DEBUG=true

# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend
```

### Useful Debug Commands

```bash
# View all logs in real-time
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# Execute bash in container for debugging
docker-compose exec backend bash
docker-compose exec frontend sh

# Check container health
docker-compose ps
docker inspect <container_name>

# Monitor container resources
docker stats

# Check network connectivity between containers
docker-compose exec backend ping mysql
docker-compose exec frontend ping backend
```

## 🆘 Getting Help

### Before Asking for Help

1. **Check the logs** first with `docker-compose logs -f`
2. **Try restarting** the problematic service
3. **Check environment variables** are set correctly
4. **Verify network connectivity** between services
5. **Test with minimal configuration** (default values)

### Information to Include When Reporting Issues

- **Error message** (full text, not screenshot)
- **Docker and Docker Compose versions**
- **Operating system**
- **Steps to reproduce**
- **Container logs** (relevant portions)
- **Environment configuration** (remove sensitive data)

### Quick Diagnostic Script

```bash
#!/bin/bash
echo "=== Donation Platform Diagnostics ==="
echo "Docker version: $(docker --version)"
echo "Docker Compose version: $(docker-compose --version)"
echo ""
echo "Container status:"
docker-compose ps
echo ""
echo "Environment file exists:"
ls -la .env 2>/dev/null || echo ".env file not found"
echo ""
echo "Port usage:"
sudo netstat -tlnp | grep -E ':3000|:8000|:3306'
echo ""
echo "Recent container logs (last 20 lines):"
docker-compose logs --tail=20
```

Save this as `diagnose.sh` and run it to gather diagnostic information.

## 🔄 Recovery Procedures

### Complete Reset (Nuclear Option)
```bash
# Stop all services
docker-compose down

# Remove all volumes (⚠️ DELETES ALL DATA)
docker-compose down -v

# Clean Docker system
docker system prune -a -f

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d

# Re-run setup
docker-compose exec backend alembic upgrade head
docker-compose exec backend python -m app.db.seed_admin
```

### Partial Reset (Keep Database)
```bash
# Stop non-database services
docker-compose stop backend frontend

# Rebuild and restart
docker-compose build --no-cache backend frontend
docker-compose up -d backend frontend
```

### Configuration Reset
```bash
# Backup current config
cp .env .env.backup

# Reset to default
cp .env.example .env

# Edit with your values
nano .env

# Restart services
docker-compose down && docker-compose up -d
```

Remember: Always backup your data before performing reset operations!
