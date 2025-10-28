# ProdEase Backend - Manufacturing Management System

## Overview

This is a comprehensive backend system for managing manufacturing operations, implementing the complete flow from Bill of Materials (BOM) to finished goods production.

## Architecture

### Core Manufacturing Flow

```
BOM → Manufacturing Order → Work Orders → Stock Updates → Finished Goods
```

### Key Entities

1. **Bill of Materials (BOM)**
   - Defines product recipes with materials and operations
   - Contains components (raw materials) and operations (manufacturing steps)
   - Versioned and can be in Draft, Active, or Archived status

2. **Manufacturing Order (MO)**
   - Production request created from a BOM
   - Tracks quantity to produce, due dates, and progress
   - Automatically generates work orders
   - Manages material reservations and consumption

3. **Work Order (WO)**
   - Individual operation steps from the BOM
   - Assigned to specific work centers
   - Tracks time, materials consumed, and quality checks
   - Sequential execution (next WO becomes ready when previous completes)

4. **Work Center**
   - Physical locations or machines where operations happen
   - Tracks capacity, downtime, and maintenance
   - Cost per hour for operation costing

5. **Material**
   - Raw materials, components, and finished goods
   - Real-time inventory tracking
   - Stock reservations and movements
   - Supplier information and reorder levels

6. **Stock Ledger**
   - Complete transaction history for materials
   - Tracks IN, OUT, RESERVE, UNRESERVE, and ADJUSTMENT transactions
   - Links to MO/WO references

7. **User**
   - Role-based access control (Admin, Manager, Supervisor, Operator, Inventory, Quality)
   - Granular permissions for different operations

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/verify-otp` - Verify OTP code
- `POST /api/auth/reset-password` - Reset password with OTP
- `GET /api/auth/me` - Get current user profile

### Dashboard
- `GET /api/dashboard/overview` - Comprehensive dashboard with all KPIs
- `GET /api/dashboard/performance` - Production performance metrics
- `GET /api/dashboard/alerts` - System alerts and notifications
- `GET /api/dashboard/my-dashboard` - User-specific dashboard

### Bill of Materials (BOM)
- `GET /api/bom` - List all BOMs (with filtering)
- `GET /api/bom/:id` - Get single BOM
- `POST /api/bom` - Create new BOM (Manager/Admin)
- `PUT /api/bom/:id` - Update BOM (Manager/Admin)
- `PATCH /api/bom/:id/approve` - Approve BOM (Manager/Admin)
- `DELETE /api/bom/:id` - Delete BOM (Manager/Admin)

### Manufacturing Orders
- `GET /api/manufacturing-orders` - List all MOs (with filtering)
- `GET /api/manufacturing-orders/:id` - Get single MO
- `POST /api/manufacturing-orders` - Create MO (Manager/Admin)
- `POST /api/manufacturing-orders/from-bom/:bomId` - Create MO from BOM
- `PUT /api/manufacturing-orders/:id` - Update MO
- `PATCH /api/manufacturing-orders/:id/status` - Update MO status
- `PATCH /api/manufacturing-orders/:id/cancel` - Cancel MO (unreserves materials)
- `DELETE /api/manufacturing-orders/:id` - Delete MO (Draft/Cancelled only)
- `POST /api/manufacturing-orders/:id/generate-work-orders` - Generate WOs from BOM
- `POST /api/manufacturing-orders/:id/reserve-materials` - Reserve materials
- `POST /api/manufacturing-orders/:id/complete` - Complete MO (adds finished goods)
- `PATCH /api/manufacturing-orders/:id/update-progress` - Recalculate progress
- `GET /api/manufacturing-orders/stats/overview` - MO statistics

### Work Orders
- `GET /api/work-orders` - List all WOs (with filtering)
- `GET /api/work-orders/:id` - Get single WO
- `POST /api/work-orders` - Create WO (Manager/Admin)
- `PUT /api/work-orders/:id` - Update WO
- `PATCH /api/work-orders/:id/start` - Start WO
- `PATCH /api/work-orders/:id/complete` - Complete WO (consumes materials, updates next WO)
- `POST /api/work-orders/:id/comments` - Add comment to WO

### Materials
- `GET /api/materials` - List all materials (with filtering)
- `GET /api/materials/:id` - Get single material
- `POST /api/materials` - Create material (Inventory/Admin)
- `PUT /api/materials/:id` - Update material (Inventory/Admin)
- `PATCH /api/materials/:id/stock` - Update stock (Inventory/Admin)
- `DELETE /api/materials/:id` - Delete material (Admin)
- `GET /api/materials/low-stock` - Get low stock materials
- `GET /api/materials/stats/overview` - Material statistics

### Work Centers
- `GET /api/work-centers` - List all work centers
- `GET /api/work-centers/:id` - Get single work center
- `POST /api/work-centers` - Create work center (Manager/Admin)
- `PUT /api/work-centers/:id` - Update work center (Manager/Admin)
- `PATCH /api/work-centers/:id/status` - Update work center status
- `DELETE /api/work-centers/:id` - Delete work center (Admin)

### Stock Ledger
- `GET /api/stock-ledger` - List all stock ledger entries
- `GET /api/stock-ledger/:id` - Get single ledger entry
- `GET /api/stock-ledger/material/:materialId` - Get ledger for specific material

### Users
- `GET /api/users` - List all users (Admin)
- `GET /api/users/:id` - Get single user (Admin)
- `PUT /api/users/:id` - Update user (Admin)
- `PATCH /api/users/:id/role` - Update user role (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

## Manufacturing Flow Details

### 1. Creating a Manufacturing Order from BOM

```javascript
POST /api/manufacturing-orders/from-bom/:bomId
{
  "quantity": 100,
  "scheduledStartDate": "2025-11-01",
  "dueDate": "2025-11-15",
  "assignee": "userId",
  "priority": "High"
}
```

This will:
- Create MO with components from BOM
- Calculate material requirements (quantity * BOM component quantity)
- Set initial status to "Draft"

### 2. Generating Work Orders

```javascript
POST /api/manufacturing-orders/:id/generate-work-orders
```

This will:
- Create one WO for each operation in the BOM
- Set first WO to "Ready", others to "Pending"
- Assign materials to WOs
- Link WOs to the MO

### 3. Reserving Materials

```javascript
POST /api/manufacturing-orders/:id/reserve-materials
```

This will:
- Check stock availability for all components
- Reserve stock (increases reservedStock, decreases availableStock)
- Mark components as reserved in MO
- Log RESERVE transactions in stock ledger

### 4. Starting and Completing Work Orders

```javascript
PATCH /api/work-orders/:id/start
PATCH /api/work-orders/:id/complete
{
  "realDuration": 120,
  "qualityCheck": {
    "passed": true,
    "notes": "Quality approved"
  },
  "materials": [
    {
      "materialId": "...",
      "quantityConsumed": 50,
      "quantityScrapped": 2
    }
  ]
}
```

Complete WO will:
- Unreserve materials
- Consume actual quantities from stock
- Update MO progress
- Set next WO in sequence to "Ready"
- Log OUT transactions in stock ledger

### 5. Completing Manufacturing Order

```javascript
POST /api/manufacturing-orders/:id/complete
```

This will:
- Verify all WOs are completed
- Add finished goods to inventory (if material exists)
- Set MO status to "Done"
- Log IN transaction for finished goods

### 6. Cancelling Manufacturing Order

```javascript
PATCH /api/manufacturing-orders/:id/cancel
{
  "reason": "Customer cancelled order"
}
```

This will:
- Unreserve all materials
- Cancel all pending/ready WOs
- Set MO status to "Cancelled"
- Log UNRESERVE transactions

## Role-Based Access Control

### Roles and Permissions

1. **Admin** - Full system access
   - All permissions enabled

2. **Manager** - Production management
   - Create/approve MOs
   - Manage BOMs
   - View reports
   - Start/complete WOs

3. **Supervisor** - Team supervision
   - Create MOs
   - Start/complete WOs
   - View reports

4. **Operator** - Floor operations
   - Start/complete assigned WOs
   - View assigned tasks

5. **Inventory** - Stock management
   - Manage materials
   - Adjust stock levels
   - View reports

6. **Quality** - Quality control
   - View reports
   - Perform quality checks

## Database Models

### Relationships

```
User ←→ ManufacturingOrder (assignee, createdBy)
User ←→ WorkOrder (assignee, createdBy)
User ←→ BOM (createdBy, approvedBy)
BOM → ManufacturingOrder
BOM → Material (components)
BOM → WorkCenter (operations)
ManufacturingOrder → WorkOrder (multiple)
ManufacturingOrder → Material (components)
WorkOrder → WorkCenter
WorkOrder → Material (materials)
Material → StockLedger
```

### Indexes

All models have appropriate indexes for:
- Unique fields (reference, code, email)
- Foreign keys (IDs)
- Frequently queried fields (status, dates)
- Search fields (name, reference)

## Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/prodease
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_email_password
```

## Installation

```bash
cd backend
npm install
```

## Running

```bash
# Development
npm run dev

# Production
npm start
```

## Key Features

1. **Automated Manufacturing Flow**
   - Sequential work order execution
   - Automatic material reservations and consumption
   - Progress tracking and status updates

2. **Real-time Inventory Management**
   - Stock reservations prevent overselling
   - Complete transaction history
   - Low stock alerts

3. **Comprehensive Analytics**
   - Production efficiency metrics
   - Work center utilization
   - Quality metrics
   - Material consumption analysis

4. **Role-based Security**
   - JWT authentication
   - Granular permissions
   - Protected endpoints

5. **Error Handling**
   - Validation on all inputs
   - Transaction rollback on failures
   - Detailed error messages

## Best Practices

1. Always create MOs from approved BOMs
2. Reserve materials before starting production
3. Complete WOs in sequence
4. Perform quality checks when required
5. Cancel MOs properly to unreserve materials
6. Monitor alerts for low stock and overdue orders

## Future Enhancements

- [ ] Real-time notifications via WebSocket
- [ ] Advanced scheduling algorithms
- [ ] Mobile app for operators
- [ ] Barcode/QR code scanning
- [ ] Advanced reporting with charts
- [ ] Integration with ERP systems
- [ ] Batch/lot tracking
- [ ] Predictive maintenance
- [ ] AI-powered demand forecasting
