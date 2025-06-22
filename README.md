# 🌟 Multi-Language Donation Platform

A comprehensive, full-stack donation platform built with FastAPI and React that supports multiple languages and provides secure payment processing through Stripe.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Backend Setup](#-backend-setup)
- [Frontend Setup](#-frontend-setup)
- [Database Setup](#-database-setup)
- [Payment Integration](#-payment-integration)
- [Email Configuration](#-email-configuration)
- [API Documentation](#-api-documentation)
- [Multi-Language Support](#-multi-language-support)
- [Admin Features](#-admin-features)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Core Features
- 🌍 **Multi-language support** (Arabic, English, Spanish, French, Russian)
- 💳 **Secure payment processing** with Stripe integration
- 👥 **User authentication** and role-based access control
- 📊 **Admin dashboard** with comprehensive analytics
- 📱 **Responsive design** for all devices
- 📧 **Email notifications** and newsletter system

### Campaign Management
- ✅ **Campaign creation** with rich text editor
- 🖼️ **Image upload** and management
- 📈 **Real-time progress tracking**
- 🏷️ **Category-based organization**
- ⏰ **Campaign status management** (Draft, Pending, Active, Completed)
- 📊 **Detailed analytics** and reporting

### Donation System
- 💰 **Flexible donation amounts**
- 👤 **Anonymous donation option**
- 💌 **Personal messages** to campaign creators
- 🔒 **Secure payment processing**
- 📄 **Donation history** and receipts
- 📈 **Real-time donation tracking**

### Admin Panel
- 👨‍💼 **User management** with role assignment
- ✅ **Campaign approval** workflow
- 📊 **Comprehensive analytics** dashboard
- 📧 **Newsletter management**
- 💳 **Payment monitoring**
- 📈 **Revenue and trend analysis**

## 🛠 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Database ORM
- **Alembic** - Database migration tool
- **MySQL** - Primary database
- **Stripe** - Payment processing
- **Pydantic** - Data validation
- **JWT** - Authentication tokens
- **SMTP** - Email notifications

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **i18next** - Internationalization
- **Framer Motion** - Animations
- **React Hook Form** - Form management
- **Recharts** - Data visualization

## 📁 Project Structure

```
donation-platform-project/
├── donation-platfrom-backend/          # FastAPI Backend
│   ├── app/
│   │   ├── api/                        # API routes
│   │   │   ├── endpoints/              # Individual endpoint files
│   │   │   │   ├── auth.py            # Authentication endpoints
│   │   │   │   ├── campaigns.py       # Campaign management
│   │   │   │   ├── donations.py       # Payment and donations
│   │   │   │   ├── users.py           # User management
│   │   │   │   ├── analytics.py       # Analytics endpoints
│   │   │   │   └── newsletter.py      # Newsletter management
│   │   │   └── api.py                 # Main API router
│   │   ├── auth/                      # Authentication logic
│   │   ├── core/                      # Core configuration
│   │   ├── db/                        # Database models and setup
│   │   │   ├── models/                # SQLAlchemy models
│   │   │   └── migrations/            # Alembic migrations
│   │   ├── schemas/                   # Pydantic schemas
│   │   ├── services/                  # Business logic
│   │   ├── templates/                 # Email templates
│   │   └── main.py                    # FastAPI app entry point
│   ├── alembic/                       # Database migration files
│   ├── uploads/                       # File upload storage
│   ├── requirements.txt               # Python dependencies
│   └── alembic.ini                    # Alembic configuration
│
├── donation-platform-frontend/        # React Frontend
│   ├── src/
│   │   ├── components/                # Reusable components
│   │   │   ├── ui/                    # Base UI components
│   │   │   ├── admin/                 # Admin-specific components
│   │   │   └── charts/                # Chart components
│   │   ├── pages/                     # Page components
│   │   ├── contexts/                  # React contexts
│   │   ├── hooks/                     # Custom hooks
│   │   ├── lib/                       # Utilities and API
│   │   ├── locales/                   # Translation files
│   │   └── assets/                    # Static assets
│   ├── public/                        # Public assets
│   ├── package.json                   # Dependencies
│   └── vite.config.js                 # Vite configuration
│
├── .env.example                       # Environment variables template
├── README.md                          # This file
└── ANALYTICS_README.md                # Analytics documentation
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- MySQL 8.0+
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd donation-platform-project
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

### 3. Backend Setup
```bash
cd donation-platfrom-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Seed initial data
python -m app.db.seed_admin
python -m app.db.seed_campaigns

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Frontend Setup
```bash
cd donation-platform-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 5. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔧 Backend Setup

### Database Configuration

1. **Create MySQL Database**:
```sql
CREATE DATABASE donation_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'donation_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON donation_db.* TO 'donation_user'@'localhost';
FLUSH PRIVILEGES;
```

2. **Update .env file**:
```env
DATABASE_URL=mysql+pymysql://donation_user:your_password@localhost:3306/donation_db
```

### Database Migrations

```bash
# Initialize Alembic (if not already done)
alembic init alembic

# Create new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Downgrade migration
alembic downgrade -1
```

### Seed Data

```bash
# Create admin user
python -m app.db.seed_admin

# Create sample campaigns
python -m app.db.seed_campaigns

# Initialize categories
python -m app.db.seed_categories
```

### Running the Backend

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 🎨 Frontend Setup

### Environment Variables

Create a `.env.local` file in the frontend directory:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Customization

- **Theme**: Modify `src/index.css` for global styles
- **Components**: UI components in `src/components/ui/`
- **Languages**: Add translations in `src/locales/`
- **API**: Configure endpoints in `src/lib/api.js`

## 🗄 Database Setup

### Schema Overview

The platform uses the following main tables:

- **users** - User accounts and authentication
- **campaigns** - Fundraising campaigns
- **donations** - Payment records
- **categories** - Campaign categories
- **newsletter_subscriptions** - Email subscribers
- **campaign_categories** - Many-to-many relationship table

### Key Models

```python
# User Model
class User(Base):
    id: int
    email: str
    username: str
    full_name: str
    is_active: bool
    is_admin: bool
    hashed_password: str

# Campaign Model
class Campaign(Base):
    id: int
    title: str
    description: str
    target_amount: float
    current_amount: float
    status: CampaignStatus
    lang: str
    creator_id: int

# Donation Model
class Donation(Base):
    id: int
    amount: float
    currency: str
    is_anonymous: bool
    payment_status: str
    payment_id: str
    donor_id: int (nullable)
    campaign_id: int
```

## 💳 Payment Integration

### Stripe Setup

1. **Create Stripe Account**: [stripe.com](https://stripe.com)

2. **Get API Keys**: 
   - Secret Key (for backend)
   - Publishable Key (for frontend)
   - Webhook Secret (for webhooks)

3. **Configure Webhooks**:
   - URL: `https://yourapi.com/api/v1/donations/webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

4. **Environment Variables**:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Payment Flow

1. User selects donation amount
2. Frontend creates payment intent via API
3. Stripe Elements collects payment details
4. Payment is processed securely
5. Webhook confirms payment success
6. Donation record is created
7. Campaign amount is updated
8. Email confirmation is sent

## 📧 Email Configuration

### SMTP Setup

1. **Gmail Setup** (recommended for development):
   - Enable 2FA on your Gmail account
   - Generate an App Password
   - Use the App Password in SMTP_PASSWORD

2. **Environment Variables**:
```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@yourplatform.org
```

### Email Templates

Email templates are located in `app/templates/emails/` with language-specific versions:
- `en/` - English templates
- `ar/` - Arabic templates
- `es/` - Spanish templates
- `fr/` - French templates
- `ru/` - Russian templates

## 📖 API Documentation

### Authentication

```bash
# Register user
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "full_name": "Full Name"
}

# Login
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Campaigns

```bash
# Get campaigns (with pagination)
GET /api/v1/campaigns/paginated?page=1&page_size=10&lang=en

# Get single campaign
GET /api/v1/campaigns/{id}

# Create campaign (authenticated)
POST /api/v1/campaigns/
Content-Type: multipart/form-data

# Update campaign
PUT /api/v1/campaigns/{id}
```

### Donations

```bash
# Create payment intent
POST /api/v1/donations/create-payment-intent
{
  "campaign_id": 1,
  "amount": 100.0,
  "currency": "usd",
  "donor_email": "donor@example.com",
  "is_anonymous": false
}

# Confirm payment
POST /api/v1/donations/confirm-payment/{payment_intent_id}

# Get campaign donations
GET /api/v1/donations/campaign/{campaign_id}
```

### Admin Endpoints

```bash
# Get all users (admin only)
GET /api/v1/users/?page=1&page_size=10

# Update user status (admin only)
PUT /api/v1/users/{id}/status

# Get analytics data (admin only)
GET /api/v1/analytics/weekly-overview
GET /api/v1/analytics/comprehensive
```

## 🌍 Multi-Language Support

### Supported Languages

- **English (en)** - Default
- **Arabic (ar)** - RTL support
- **Spanish (es)**
- **French (fr)**
- **Russian (ru)**

### Adding New Languages

1. **Backend**: Create email templates in `app/templates/emails/{lang}/`
2. **Frontend**: Add translations in `src/locales/{lang}/common.json`
3. **Database**: Campaigns support `lang` field for language-specific content

### Language Detection

The platform automatically detects user language preferences from:
1. URL parameters (`?lang=ar`)
2. Browser language settings
3. User account preferences
4. Default to English

## 👨‍💼 Admin Features

### Admin Dashboard

Access the admin panel at `/admin` with admin credentials.

**Features include:**
- 📊 **Analytics Dashboard** - Real-time statistics and charts
- 👥 **User Management** - View, edit, and manage user accounts
- ✅ **Campaign Approval** - Review and approve new campaigns
- 💳 **Payment Monitoring** - Track donations and revenue
- 📧 **Newsletter Management** - Manage email subscribers
- 📈 **Trend Analysis** - Weekly and monthly performance data

### Default Admin Account

After running the seed script, you can login with:
- **Email**: admin@qalbwahed.org
- **Password**: admin123
- **Change this immediately in production!**

### Admin Permissions

Admin users can:
- View all campaigns regardless of language
- Approve/reject pending campaigns
- Access user management features
- View comprehensive analytics
- Manage newsletter subscriptions
- Access payment and donation data

## 🔐 Security Features

- **JWT Authentication** with secure token handling
- **Password hashing** using bcrypt
- **Input validation** with Pydantic schemas
- **SQL injection protection** via SQLAlchemy ORM
- **CORS configuration** for secure cross-origin requests
- **File upload validation** and sanitization
- **Payment security** through Stripe's secure infrastructure

## 🚀 Deployment

### Backend Deployment

1. **Update environment variables** for production
2. **Set up SSL certificates**
3. **Configure reverse proxy** (nginx recommended)
4. **Set up process manager** (systemd, supervisor, or PM2)
5. **Configure database** with proper backup strategy

### Frontend Deployment

1. **Build the application**:
```bash
npm run build
```

2. **Deploy to static hosting** (Netlify, Vercel, or serve with nginx)

3. **Configure environment variables** for production API endpoints

## 🔧 Development Tips

### Backend Development

```bash
# Watch for changes during development
uvicorn app.main:app --reload

# Run with different port
uvicorn app.main:app --port 8001

# Enable debug logging
export PYTHONPATH=$PYTHONPATH:$(pwd)
python -m app.main
```

### Frontend Development

```bash
# Start dev server with custom port
npm run dev -- --port 3000

# Build and preview
npm run build && npm run preview

# Lint and fix code
npm run lint -- --fix
```

### Database Management

```bash
# Reset database (development only)
alembic downgrade base
alembic upgrade head

# Create new migration
alembic revision --autogenerate -m "Add new feature"

# Check migration status
alembic current
alembic history
```

## 📞 Support

For questions and support:
- 📧 **Email**: support@yourplatform.org
- 📖 **Documentation**: `/docs` endpoint for API docs
- 🐛 **Issues**: GitHub Issues for bug reports
- 💬 **Discussions**: GitHub Discussions for questions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use ESLint configuration for JavaScript
- Write tests for new features
- Update documentation for API changes
- Ensure multi-language support for user-facing features

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **FastAPI** for the excellent Python web framework
- **React** for the powerful frontend library
- **Stripe** for secure payment processing
- **Tailwind CSS** for beautiful styling
- **Radix UI** for accessible components
- **SQLAlchemy** for robust database management

---

Made with ❤️ for making the world a better place through technology-enabled giving.
