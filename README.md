# 🤝 Donation Platform - Digital Humanitarian Platform

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-frontend-yellow?logo=vite)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-backend-green?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-utility-blue?logo=tailwindcss)](https://tailwindcss.com/)
[![Radix UI](https://img.shields.io/badge/Radix%20UI-components-purple?logo=radix-ui)](https://radix-ui.com/)
[![Stripe](https://img.shields.io/badge/Stripe-payments-blueviolet?logo=stripe)](https://stripe.com/)
[![MySQL](https://img.shields.io/badge/MySQL-database-lightgrey?logo=mysql)](https://www.mysql.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-database-blue?logo=postgresql)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/JWT-authentication-orange?logo=jsonwebtokens)](https://jwt.io/)
[![Python](https://img.shields.io/badge/Python-3.8%2B-blue?logo=python)](https://www.python.org/)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A modern, multilingual donation platform that connects donors with impactful humanitarian and social campaigns. Built with React (Vite) frontend and FastAPI backend, supporting multiple languages and secure payment processing.

## 🌟 Features

### 🎯 Core Features

- **Campaign Management**: Create, browse, and manage fundraising campaigns
- **Secure Donations**: Stripe-powered payment processing with multiple payment methods
- **Multi-language Support**: Full support for Arabic, English, Spanish, French, and Russian
- **Analytics Dashboard**: Comprehensive analytics for donations, campaigns, and user engagement
- **Admin Panel**: Complete administrative control over users, campaigns, and donations
- **Anonymous Donations**: Option for donors to contribute anonymously
- **Real-time Updates**: Live campaign progress tracking and instant notifications

### 🔒 Security & Trust

- **Bank-level Security**: Latest encryption technologies for all transactions
- **Identity Verification**: Campaign creators undergo verification for transparency
- **Secure File Storage**: Safe image and document upload system
- **JWT Authentication**: Secure user authentication and authorization

### 🌍 Accessibility

- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **RTL Support**: Full right-to-left language support for Arabic
- **Modern UI/UX**: Built with Radix UI and Tailwind CSS for beautiful interfaces
- **Progressive Web App**: PWA capabilities for enhanced user experience

## 🏗️ Technology Stack

### Frontend

- **React 18** with **Vite** for fast development and building
- **Tailwind CSS** for styling with **Radix UI** components
- **React Router** for navigation
- **React Hook Form** with **Zod** validation
- **Framer Motion** for animations
- **i18next** for internationalization
- **Stripe React** for payment processing
- **React Markdown** for rich content display

### Backend

- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Database ORM
- **Alembic** - Database migrations
- **Pydantic** - Data validation
- **JWT** - Authentication tokens
- **Stripe** - Payment processing
- **Python-multipart** - File upload handling

### Database

- **MySQL/PostgreSQL** compatible
- **Alembic** for database versioning and migrations

## 📁 Project Structure

```
donation-platform-project/
├── donation-platform-frontend/          # React frontend application
│   ├── src/
│   │   ├── components/                   # Reusable UI components
│   │   │   ├── ui/                      # Base UI components (Radix UI)
│   │   │   ├── charts/                  # Chart components for analytics
│   │   │   ├── card-ui/                 # Custom card components
│   │   │   └── ...                      # Feature-specific components
│   │   ├── pages/                       # Page components
│   │   │   ├── admin/                   # Admin panel pages
│   │   │   └── ...                      # Public pages
│   │   ├── contexts/                    # React context providers
│   │   ├── hooks/                       # Custom React hooks
│   │   ├── lib/                         # Utility libraries
│   │   ├── locales/                     # Translation files
│   │   │   ├── ar/                      # Arabic translations
│   │   │   ├── en/                      # English translations
│   │   │   ├── es/                      # Spanish translations
│   │   │   ├── fr/                      # French translations
│   │   │   └── ru/                      # Russian translations
│   │   └── assets/                      # Static assets
│   └── ...
├── donation-platfrom-backend/           # FastAPI backend application
│   ├── app/
│   │   ├── api/                         # API endpoints
│   │   ├── auth/                        # Authentication logic
│   │   ├── core/                        # Core configurations
│   │   ├── db/                          # Database models and setup
│   │   ├── schemas/                     # Pydantic schemas
│   │   └── services/                    # Business logic services
│   ├── alembic/                         # Database migrations
│   └── uploads/                         # File upload storage
└── README.md                            # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **MySQL** or **PostgreSQL** database
- **Stripe** account for payment processing

### Frontend Setup

1. **Navigate to frontend directory:**

   ```bash
   cd donation-platform-frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create environment file:**

   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables:**

   ```env
   VITE_API_BASE_URL=http://localhost:8000
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

### Backend Setup

1. **Navigate to backend directory:**

   ```bash
   cd donation-platfrom-backend
   ```

2. **Create virtual environment:**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Create environment file:**

   ```bash
   cp .env.example .env
   ```

5. **Configure environment variables:**

   ```env
   DATABASE_URL=mysql://username:password@localhost/donation_platform
   SECRET_KEY=your-secret-key-here
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   ```

6. **Run database migrations:**

   ```bash
   alembic upgrade head
   ```

7. **Start the server:**
   ```bash
   uvicorn app.main:app --reload
   ```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_APP_NAME=Donation Platform
```

#### Backend (.env)

```env
DATABASE_URL=mysql://user:password@localhost/dbname
SECRET_KEY=your-super-secret-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CORS_ORIGINS=["http://localhost:5173"]
```

### Database Setup

1. **Create database:**

   ```sql
   CREATE DATABASE donation_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Run migrations:**

   ```bash
   cd donation-platfrom-backend
   alembic upgrade head
   ```

3. **Seed initial data (optional):**
   ```bash
   python -m app.db.seed_admin
   python -m app.db.seed_campaigns
   ```

## 📚 API Documentation

The backend provides comprehensive API documentation available at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key API Endpoints

#### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Token refresh

#### Campaigns

- `GET /api/campaigns` - List all campaigns
- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns/{id}` - Get campaign details
- `PUT /api/campaigns/{id}` - Update campaign

#### Donations

- `POST /api/donations` - Create donation
- `GET /api/donations/{id}` - Get donation details
- `POST /api/donations/webhook` - Stripe webhook

#### Admin

- `GET /api/admin/users` - Manage users
- `GET /api/admin/campaigns` - Manage campaigns
- `GET /api/admin/analytics` - View analytics

## 🌐 Internationalization

The platform supports 5 languages with complete translations:

- 🇸🇦 **Arabic** (العربية) - Primary language with RTL support
- 🇺🇸 **English** - Secondary language
- 🇪🇸 **Spanish** (Español)
- 🇫🇷 **French** (Français)
- 🇷🇺 **Russian** (Русский)

### Adding New Languages

1. **Create translation file:**

   ```bash
   mkdir src/locales/[language-code]
   cp src/locales/en/common.json src/locales/[language-code]/common.json
   ```

2. **Translate content:**
   Edit the new `common.json` file with translations

3. **Update i18n configuration:**
   Add the new language to `src/lib/i18n.js`

## 🎨 UI Components

The platform uses a modern design system built on:

- **Radix UI** - Accessible, unstyled components
- **Tailwind CSS** - Utility-first CSS framework
- **Custom components** - Platform-specific UI elements
- **Framer Motion** - Smooth animations and transitions

### Key UI Features

- Dark/Light mode support
- Responsive design for all screen sizes
- Accessibility-first approach
- Smooth page transitions
- Interactive charts and graphs
- Modern card-based layouts

## 🔐 Security Features

### Authentication & Authorization

- JWT-based authentication
- Role-based access control (Admin, User)
- Password hashing with bcrypt
- Secure session management

### Payment Security

- Stripe's bank-level security
- PCI DSS compliance
- Encrypted payment processing
- Webhook verification

### Data Protection

- HTTPS enforcement
- CORS configuration
- Input validation and sanitization
- File upload security

## 📊 Analytics & Reporting

The platform includes comprehensive analytics:

### Dashboard Metrics

- Total donations received
- Active campaigns count
- User registration trends
- Campaign success rates

### Charts & Visualizations

- Donation trends over time
- Campaign status distribution
- Category-wise donation breakdown
- Geographic donation patterns

### Admin Reports

- User management statistics
- Campaign performance metrics
- Financial transaction reports
- Platform usage analytics

## 🚀 Deployment

### Frontend Deployment

1. **Build the application:**

   ```bash
   npm run build
   ```

2. **Deploy to hosting service:**
   - Vercel, Netlify, or any static hosting
   - Configure environment variables
   - Set up custom domain (optional)

### Backend Deployment

1. **Prepare for production:**

   ```bash
   pip install gunicorn
   ```

2. **Run with Gunicorn:**

   ```bash
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

3. **Deploy to cloud service:**
   - AWS, Google Cloud, Heroku, or DigitalOcean
   - Configure database connection
   - Set up environment variables
   - Configure domain and SSL

### Docker Deployment

Create `docker-compose.yml`:

```yaml
version: "3.8"
services:
  frontend:
    build: ./donation-platform-frontend
    ports:
      - "3000:3000"

  backend:
    build: ./donation-platfrom-backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=mysql://user:pass@db:3306/donation_platform

  db:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: donation_platform
      MYSQL_ROOT_PASSWORD: rootpassword
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes:**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch:**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Help

### Documentation

- [API Documentation](http://localhost:8000/docs)
- [Component Storybook](docs/components.md)
- [Deployment Guide](docs/deployment.md)

### Getting Help

- 📧 Email: support@donationplatform.com
- 💬 Discord: [Join our community](https://discord.gg/donationplatform)
- 🐛 Issues: [GitHub Issues](https://github.com/username/donation-platform/issues)

### FAQ

**Q: How do I set up Stripe payments?**
A: Create a Stripe account, get your API keys, and add them to your environment variables.

**Q: Can I customize the UI theme?**
A: Yes! The platform uses Tailwind CSS and Radix UI, making customization straightforward.

**Q: How do I add a new language?**
A: Create a new translation file in `src/locales/[lang]/common.json` and update the i18n configuration.

**Q: Is the platform mobile-friendly?**
A: Absolutely! The platform is fully responsive and works great on all devices.

## 🙏 Acknowledgments

- [Radix UI](https://radix-ui.com/) for accessible UI components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [FastAPI](https://fastapi.tiangolo.com/) for the modern Python web framework
- [Stripe](https://stripe.com/) for secure payment processing
- [Framer Motion](https://framer.com/motion/) for smooth animations

---

**Made with ❤️ for humanitarian causes worldwide**

_"Every donation, no matter the size, directly contributes to improving others' lives and creating a tangible positive impact."_
