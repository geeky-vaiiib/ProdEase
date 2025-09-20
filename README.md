# 🔧 ProdEase Manufacturing Management System

A comprehensive, production-ready manufacturing management platform built with modern web technologies. ProdEase eliminates spreadsheets and manual tracking with a centralized dashboard, user roles, and real-time data management.

![ProdEase Logo](public/prodease-logo.svg)

## ✨ Features

### 🔐 **Authentication & Security**
- Secure JWT-based authentication with role-based access control
- Password reset with email OTP verification
- Multi-role support (Admin, Manager, Operator, Inventory)
- Session management and secure logout

### 📋 **Manufacturing Orders Management**
- Create, track, and manage production orders end-to-end
- Real-time progress tracking with visual indicators
- Priority-based order management
- Component and BOM integration
- Assignee management and notifications

### ⚙️ **Work Orders & Operations**
- Detailed operation tracking and scheduling
- Work center assignment and capacity planning
- Time tracking with efficiency monitoring
- Quality check integration
- Collaborative comment system

### 📦 **Stock & Inventory Management**
- Real-time inventory tracking with automatic calculations
- Stock transactions (IN/OUT/ADJUSTMENT) with audit trail
- Low stock alerts and reorder level management
- Supplier information and lead time tracking
- Cost tracking and inventory valuation

### 🏭 **Work Centers & Resources**
- Equipment and resource management
- Capacity planning and availability tracking
- Maintenance scheduling and downtime tracking
- Operator assignment and skill management
- Performance metrics and efficiency monitoring

### 📊 **Dashboard & Analytics**
- Real-time KPI monitoring and production metrics
- Interactive charts and data visualization
- Stock level alerts and critical notifications
- Order status overview with filtering
- Performance analytics and reporting

### 🎨 **Modern UI/UX**
- Responsive design for desktop, tablet, and mobile
- Light/dark mode toggle with system preference detection
- Professional ProdEase branding and logo
- Intuitive navigation with master and profile sidebars
- Accessible design following WCAG guidelines

## 🚀 Technology Stack

### **Frontend**
- **React 18** with Next.js 14 (App Router)
- **TypeScript** for type safety and better development experience
- **Tailwind CSS v4** for modern, responsive styling
- **shadcn/ui** for consistent, accessible UI components
- **Lucide React** for beautiful, scalable icons
- **React Context API** for global state management

### **Backend**
- **Node.js** with Express.js framework
- **MongoDB Atlas** with Mongoose ODM
- **JWT** for secure authentication
- **bcryptjs** for password hashing (12 rounds)
- **Joi** for comprehensive request validation
- **Nodemailer** for email notifications
- **Helmet** for security headers
- **CORS** for cross-origin resource sharing
- **Rate limiting** for API protection

## 📋 Prerequisites

- **Node.js 18+**
- **MongoDB Atlas** account (or local MongoDB instance)
- **Git** for version control
- **Email service** (Gmail, SendGrid, etc.) for OTP functionality

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/prodease.git
cd prodease
```

### 2. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
npm install
cd ..
```

### 3. Environment Configuration

**Frontend (`.env.local`):**
```env
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

**Backend (`backend/.env`):**
```env
NODE_ENV=development
PORT=5001

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=ProdEase
DB_NAME=prodease

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRE=7d

# Email Configuration (for OTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@prodease.com

# CORS Configuration
FRONTEND_URL=http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Start Development Servers

**Backend Server:**
```bash
cd backend
npm run dev
```

**Frontend Server (new terminal):**
```bash
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5001
- **API Health Check**: http://localhost:5001/health

## 👥 Default User Accounts

The system includes pre-configured users for testing:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | admin@prodease.com | admin123 | Full system access |
| **Manager** | manager@prodease.com | manager123 | Create/edit orders, manage users |
| **Operator** | operator@prodease.com | operator123 | View orders, update work orders |

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
ProdEase/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── manufacturing-orders/ # Manufacturing order management
│   ├── work-orders/       # Work order management
│   ├── bom/              # Bills of Materials
│   ├── work-centers/     # Work center management
│   ├── stock-ledger/     # Inventory tracking
│   ├── profile/          # User profile
│   └── reports/          # Reports section
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   ├── master-sidebar.tsx # Navigation sidebar
│   ├── profile-sidebar.tsx # User sidebar
│   └── protected-route.tsx # Route protection
├── contexts/             # React Context providers
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
└── public/              # Static assets
```

## Key Features

### Authentication
- Mock authentication system with local storage
- Protected routes with automatic redirection
- User session management

### Dashboard
- Real-time KPIs for manufacturing orders
- Filtering and search functionality
- Responsive design for all screen sizes

### Manufacturing Management
- Complete manufacturing order lifecycle
- Work order tracking and management
- BOM creation and management
- Stock ledger for inventory tracking

### User Experience
- Modern, dark-themed UI
- Responsive design for mobile and desktop
- Error boundaries for graceful error handling
- Loading states and user feedback

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

The project uses:
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting (configured in IDE)
- Tailwind CSS for styling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🎯 Current Status

✅ **PRODUCTION READY** - The application is fully functional with:
- ✅ Complete authentication system with JWT and role-based access
- ✅ Full CRUD operations with real-time inline editing
- ✅ Professional UI/UX with comprehensive theme system (light/dark/system)
- ✅ MongoDB Atlas integration with data persistence
- ✅ Security best practices implemented (CORS, rate limiting, input validation)
- ✅ Comprehensive error handling and user feedback
- ✅ Responsive design across all devices
- ✅ Build process working without errors
- ✅ Environment configuration and deployment ready

## License

This project is licensed under the MIT License.
