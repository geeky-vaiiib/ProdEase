# 🧪 ProdEase User Testing Guide

## 🚀 Quick Start

1. **Start the Application**:
   ```bash
   # Terminal 1: Start Backend
   cd backend && npm run dev
   
   # Terminal 2: Start Frontend  
   npm run dev
   ```

2. **Access the Application**: Open http://localhost:3002 (or the port shown in terminal)

3. **Login Credentials**:
   - **Email**: admin@prodease.com
   - **Password**: admin123

## 🧭 **Testing Navigation Features**

### **1. Header Navigation**
- **🔔 Notifications**: Click the bell icon to see real-time notifications
  - View unread notifications with badges
  - Mark individual notifications as read
  - Mark all notifications as read
  - Click notification actions to navigate

- **⚙️ Settings**: Click the settings icon for application preferences
  - Toggle theme (Light/Dark/System)
  - Adjust notification preferences
  - Configure data sync settings
  - Access logout functionality

- **👤 User Profile**: Click your avatar for account options
  - View user information and role
  - Access profile management
  - Admin-only features (if admin role)
  - Quick logout option

- **🔍 Global Search**: Press `⌘K` (Cmd+K) or `Ctrl+K` to open search
  - Search across orders, work centers, stock items
  - Use keyboard navigation (↑↓ arrows, Enter)
  - View categorized results with status badges

### **2. Theme System Testing**
- **Settings Dropdown**: Change theme via settings menu
- **Profile Page**: Update theme in Preferences tab
- **Real-time Updates**: Theme changes apply instantly
- **Persistence**: Theme preference saved across sessions

## 📦 **Testing Manufacturing Orders**

### **1. View Orders**
- Navigate to **Manufacturing Orders** page
- View existing orders in table format
- Check real-time status indicators
- Test search and filtering functionality

### **2. Create New Order**
- Click **"New Order"** button to open modal
- Fill in required fields:
  - Product Name (required)
  - Quantity (required, minimum 1)
  - Due Date (required, future date)
  - Assignee (required, select from dropdown)
  - Priority (Low/Medium/High)
  - Optional: Start Date, Notes
- **Validation Testing**:
  - Try submitting with empty required fields
  - Enter invalid dates (past due date)
  - Enter negative quantities
- **Success**: Order appears immediately in list

### **3. Edit Orders**
- Click on any field in the orders table
- Make inline edits (quantity, notes, etc.)
- Watch for real-time updates and success indicators
- Test error handling with invalid data

### **4. Delete Orders**
- Click the delete (trash) icon on any order
- **Confirmation Dialog** should appear
- Test both "Cancel" and "Delete" options
- Verify order is removed from list immediately

## 📊 **Testing Stock Ledger**

### **1. View Stock Items**
- Navigate to **Stock Ledger** page
- View inventory items with categories
- Check stock status indicators (In Stock/Low Stock)
- Test search and category filtering

### **2. Add Stock Items**
- Click **"Add Stock Item"** button
- Fill in item details:
  - Item Name (required)
  - Category (required, dropdown selection)
  - Unit (required, dropdown selection)
  - Current Stock, Unit Cost, Minimum Stock
  - Supplier (optional, dropdown)
  - Description (optional)
- **Validation Testing**:
  - Submit with missing required fields
  - Enter negative values for costs/quantities
- **Success**: Item appears in stock ledger

### **3. Stock Management**
- Edit stock quantities inline
- Watch for low stock alerts
- Test stock adjustment functionality
- Verify real-time inventory calculations

## 👤 **Testing User Profile System**

### **1. Access Profile**
- Click user avatar → "Profile" or navigate to `/profile`
- View comprehensive profile interface with tabs

### **2. Profile Tab**
- **Avatar Section**: View current avatar with camera icon
- **Edit Information**:
  - Username, Email, Phone, Department
  - Bio/Description field
  - Department selection dropdown
- **Save Changes**: Test form validation and success messages

### **3. Security Tab**
- **Change Password**:
  - Enter current password
  - Set new password (minimum 8 characters)
  - Confirm new password
  - Test password visibility toggles (eye icons)
  - Test validation (password mismatch, too short)
- **Security Settings**:
  - Toggle Two-Factor Authentication
  - Toggle Login Notifications
  - View Login History button

### **4. Preferences Tab**
- **Notifications**:
  - Toggle Email Notifications
  - Toggle Push Notifications  
  - Toggle Weekly Reports
- **Appearance**:
  - Change Theme (Light/Dark/System)
  - Select Language (English/Spanish/French/German)
  - Set Timezone (UTC/EST/PST/CET)
- **Save Preferences**: Test real-time theme updates

## 🔄 **Testing Real-Time Features**

### **1. Data Synchronization**
- Open application in two browser tabs
- Make changes in one tab (create/edit/delete orders)
- Watch for automatic updates in the second tab
- Check the "Live" indicator in header

### **2. Optimistic UI Updates**
- Create a new manufacturing order
- Notice immediate appearance in list
- Watch for success confirmation messages
- Test error scenarios (disconnect internet, invalid data)

### **3. Auto-Refresh**
- Leave application open for 30+ seconds
- Watch for automatic background data refresh
- Check sync status indicator

## 🔒 **Testing Security Features**

### **1. Authentication**
- Test login with correct credentials
- Test login with incorrect credentials
- Test logout functionality from multiple locations:
  - Settings dropdown
  - User profile dropdown
  - Profile page

### **2. Authorization**
- Test role-based features (admin vs. manager vs. operator)
- Verify restricted actions show appropriate messages
- Test protected routes (try accessing without login)

### **3. Delete Confirmations**
- Test delete confirmations for all item types:
  - Manufacturing Orders
  - Stock Items
  - Work Centers (if available)
  - Work Orders (if available)
- Verify "Cancel" prevents deletion
- Verify "Delete" removes item with confirmation

## 📱 **Testing Responsive Design**

### **1. Desktop Testing**
- Test on full-screen desktop browser
- Verify all dropdowns and modals work properly
- Check table layouts and navigation

### **2. Mobile Testing**
- Resize browser to mobile width (< 768px)
- Test navigation menu functionality
- Verify forms and modals are usable
- Check touch interactions

### **3. Tablet Testing**
- Test medium screen sizes (768px - 1024px)
- Verify layout adaptations
- Test touch and mouse interactions

## 🎯 **Performance Testing**

### **1. Load Testing**
- Create multiple manufacturing orders quickly
- Test search with large datasets
- Monitor response times (should be < 200ms)

### **2. Error Handling**
- Disconnect internet during operations
- Test with invalid API responses
- Verify graceful error recovery

### **3. Memory Usage**
- Leave application open for extended periods
- Monitor browser memory usage
- Test for memory leaks

## ✅ **Expected Results**

After testing, you should observe:
- ✅ **Zero page refreshes** needed for any operations
- ✅ **Instant visual feedback** for all user actions
- ✅ **Professional UI/UX** with smooth animations
- ✅ **Comprehensive error handling** with helpful messages
- ✅ **Real-time synchronization** across browser tabs
- ✅ **Responsive design** working on all device sizes
- ✅ **Secure operations** with proper confirmations
- ✅ **Fast performance** with < 200ms response times

## 🐛 **Reporting Issues**

If you encounter any issues during testing:
1. Note the exact steps to reproduce
2. Check browser console for errors
3. Verify backend is running (check terminal output)
4. Test in different browsers if needed
5. Document expected vs. actual behavior

---

**🎉 Happy Testing! The application should provide a smooth, professional manufacturing management experience.**
