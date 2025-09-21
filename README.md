# ProdEase - Manufacturing Management System

A comprehensive digital manufacturing workflow management and production tracking system built with modern web technologies.

## 🚀 Features

- **Manufacturing Orders Management**: Create, track, and manage manufacturing orders with real-time status updates
- **Work Orders**: Detailed work order tracking with progress monitoring
- **Bill of Materials (BOM)**: Comprehensive BOM management with component tracking
- **Work Centers**: Manage production work centers and capacity planning
- **Stock Ledger**: Real-time inventory tracking and stock management
- **User Management**: Role-based access control with admin, manager, and operator roles
- **Real-time Updates**: Live data synchronization across all connected clients
- **Dark/Light Theme**: Professional UI with theme switching and localStorage persistence
- **Responsive Design**: Mobile-friendly interface with persistent sidebar navigation
- **Authentication Flow**: Secure JWT-based authentication with route protection

## 🛠 Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS v4**: Utility-first CSS framework with dark mode
- **Radix UI**: Accessible component library
- **Lucide React**: Beautiful icons
- **Recharts**: Data visualization

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT**: JSON Web Token authentication
- **bcryptjs**: Password hashing
- **Helmet**: Security middleware
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Express rate limiting for API protection

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account or local MongoDB installation

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/geeky-vaiiib/ProdEase.git
   cd ProdEase
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Environment Configuration**
   
   Create `.env.local` in the root directory:
   ```env
   NEXT_PUBLIC_APP_NAME=ProdEase
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
   
   Create `backend/.env`:
   ```env
   # Database Configuration
   MONGODB_URI=your_mongodb_connection_string
   DB_NAME=prodease
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000
   
   # Rate Limiting (Development - High limits)
   RATE_LIMIT_WINDOW_MS=60000
   RATE_LIMIT_MAX_REQUESTS=1000
   ```

4. **Start the application**
   ```bash
   # Start backend (in one terminal)
   cd backend
   npm run dev
   
   # Start frontend (in another terminal)
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000 (or http://localhost:3001 if 3000 is in use)
   - Backend API: http://localhost:5000

## 🧪 Testing

### Smoke Tests
Run the comprehensive test suite to verify all functionality:
```bash
node test-prodease-functionality.js
```

### Manual Testing Checklist
1. **Health Check**: `curl http://localhost:5001/api/health`
2. **User Signup**: 
   ```bash
   curl -X POST http://localhost:5001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","email":"test@flowforge.com","password":"Test@1234","role":"operator"}'
   ```
3. **User Login**:
   ```bash
   curl -X POST http://localhost:5001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"testuser","password":"Test@1234"}'
   ```

### Frontend Flow Testing
1. Visit http://localhost:3000 → should redirect to /auth/login (not dashboard)
2. Sign up a user → redirect to login with success message
3. Login with created user → redirect to /dashboard with data fetching
4. Navigate through sidebar links → all pages render with consistent layout
5. Toggle theme → persists on reload
6. Access settings → profile editing and logout work

## 📡 API Endpoints

### Authentication
- `GET /api/health` - Health check endpoint
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - User logout

### Manufacturing Orders
- `GET /api/manufacturing-orders` - Get all manufacturing orders
- `POST /api/manufacturing-orders` - Create new manufacturing order
- `GET /api/manufacturing-orders/:id` - Get specific manufacturing order
- `PUT /api/manufacturing-orders/:id` - Update manufacturing order
- `DELETE /api/manufacturing-orders/:id` - Delete manufacturing order

### Work Orders
- `GET /api/work-orders` - Get all work orders
- `POST /api/work-orders` - Create new work order
- `GET /api/work-orders/:id` - Get specific work order
- `PUT /api/work-orders/:id` - Update work order

### Work Centers
- `GET /api/work-centers` - Get all work centers
- `POST /api/work-centers` - Create new work center
- `PUT /api/work-centers/:id` - Update work center

### Stock Management
- `GET /api/stock` - Get stock items
- `POST /api/stock` - Add stock item
- `PUT /api/stock/:id` - Update stock item

## 👥 User Roles

- **Admin**: Full system access, user management
- **Manager**: Manufacturing oversight, reporting, order management
- **Operator**: Production floor operations, work order updates

## 🔧 Development

### Project Structure
```
ProdEase/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   ├── manufacturing-orders/
│   ├── work-orders/
│   ├── work-centers/
│   ├── stock-ledger/
│   ├── bom/
│   └── settings/
├── components/            # Reusable React components
│   ├── ui/               # Base UI components
│   ├── app-layout.tsx    # Global layout component
│   └── auth-guard.tsx    # Route protection
├── contexts/             # React contexts
│   ├── auth-context.tsx  # Authentication state
│   ├── theme-context.tsx # Theme management
│   └── data-context.tsx  # Data management
├── lib/                  # Utilities
│   └── api.ts           # API client
├── backend/             # Express.js backend
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   └── server.js        # Main server file
└── test-prodease-functionality.js  # Test suite
```

### Key Features Implemented
- ✅ **Global App Layout**: Persistent sidebar and header across all pages
- ✅ **Theme Toggle**: Dark/light mode with localStorage persistence
- ✅ **Authentication Flow**: Route protection with JWT tokens
- ✅ **Settings Page**: Profile editing, preferences, and logout
- ✅ **API Integration**: Real API calls replacing mock data
- ✅ **Error Handling**: Comprehensive error states and user feedback
- ✅ **Responsive Design**: Mobile-friendly with collapsible sidebar

### Running Tests
```bash
# Lint code
npm run lint

# Build for production
npm run build

# Run integration tests
node test-prodease-functionality.js
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables for Production
Update `.env.local` and `backend/.env` with production values:
- Set `NODE_ENV=production`
- Use production MongoDB URI
- Set secure JWT secrets
- Configure proper CORS origins
- Adjust rate limiting for production traffic

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, create an issue in the GitHub repository: https://github.com/geeky-vaiiib/ProdEase
