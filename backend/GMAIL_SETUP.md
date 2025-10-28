# Gmail Setup Guide for ProdEase Backend

This guide will help you set up Gmail to send emails from your ProdEase application.

## Prerequisites

- A Gmail account
- Node.js and npm installed
- ProdEase backend set up

## Step 1: Enable 2-Factor Authentication on Gmail

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left sidebar
3. Under "Signing in to Google", click on **2-Step Verification**
4. Follow the prompts to enable 2-Step Verification

## Step 2: Generate App-Specific Password

Since you have 2-Factor Authentication enabled, you need to create an app-specific password for ProdEase:

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left sidebar
3. Under "Signing in to Google", click on **App passwords**
   - You may need to sign in again
4. Select app: **Mail**
5. Select device: **Other (Custom name)**
6. Enter name: **ProdEase Backend**
7. Click **Generate**
8. **Copy the 16-character password** that appears
   - This is your `EMAIL_PASS` - you won't be able to see it again!

## Step 3: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cd /Users/vaibhavjp/Downloads/ProdEase-1/backend
   cp .env.example .env
   ```

2. Edit the `.env` file and update the email settings:
   ```env
   # Email Configuration (Gmail)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-actual-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   EMAIL_FROM=your-actual-email@gmail.com
   ```

3. Replace:
   - `your-actual-email@gmail.com` with your Gmail address
   - `your-16-character-app-password` with the app password from Step 2

## Step 4: Verify Email Configuration

1. Start your backend server:
   ```bash
   npm run dev
   ```

2. Test email functionality by:
   - Creating a new user account (should send welcome email)
   - Using the forgot password feature (should send OTP email)

## Step 5: Security Best Practices

✅ **DO:**
- Keep your `.env` file secure and never commit it to git
- Use different app passwords for different applications
- Revoke app passwords you no longer need
- Use strong passwords for your Gmail account

❌ **DON'T:**
- Share your app password with anyone
- Commit `.env` file to version control
- Use your regular Gmail password in the app
- Disable 2-Factor Authentication

## Troubleshooting

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Solution:** Make sure you're using an app-specific password, not your regular Gmail password.

### Error: "Connection timeout"

**Solution:** 
- Check your firewall settings
- Ensure port 587 is not blocked
- Try using port 465 with `secure: true` in the transporter config

### Email not sending but no error

**Solution:**
- Verify `EMAIL_USER` and `EMAIL_FROM` are the same
- Check spam folder
- Verify 2FA is enabled on Gmail

### "Less secure app access" message

**Solution:** Google has deprecated less secure apps. You must use 2FA + App Password.

## Testing Email Service

You can test the email service using this curl command:

```bash
# Test forgot password (sends OTP email)
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## Alternative: Using Environment Variables Directly

If you prefer not to use a `.env` file, you can set environment variables directly:

### macOS/Linux:
```bash
export EMAIL_USER="your-email@gmail.com"
export EMAIL_PASS="your-app-password"
export EMAIL_HOST="smtp.gmail.com"
export EMAIL_PORT="587"
export EMAIL_FROM="your-email@gmail.com"
```

### Windows (PowerShell):
```powershell
$env:EMAIL_USER="your-email@gmail.com"
$env:EMAIL_PASS="your-app-password"
$env:EMAIL_HOST="smtp.gmail.com"
$env:EMAIL_PORT="587"
$env:EMAIL_FROM="your-email@gmail.com"
```

## Using Other Email Providers

If you want to use a different email provider:

### Outlook/Office365:
```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

### Yahoo Mail:
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

### SendGrid:
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

## Email Templates

ProdEase currently includes two email templates:

1. **OTP Email** - Sent when users request password reset
   - Beautiful HTML template
   - 6-digit OTP code
   - 10-minute expiry
   - Security warnings

2. **Welcome Email** - Sent when new users register
   - Professional HTML template
   - Feature highlights
   - Getting started information

## Monitoring Email Delivery

To monitor email delivery in production:

1. Check backend logs for email sending status
2. Use Gmail's "Sent" folder to verify emails were sent
3. Consider using email analytics tools like:
   - SendGrid Analytics
   - Mailgun Analytics
   - Postmark

## Support

If you encounter issues:

1. Check the backend logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test with a simple nodemailer script first
4. Review Gmail's security settings

## Quick Setup Script

Run this script to quickly set up your `.env` file:

```bash
#!/bin/bash

echo "🔧 ProdEase Gmail Setup"
echo "======================="
echo ""

# Prompt for Gmail address
read -p "Enter your Gmail address: " EMAIL_USER

# Prompt for app password
echo ""
echo "⚠️  You need a Gmail App Password (not your regular password)"
echo "Get it from: https://myaccount.google.com/apppasswords"
read -p "Enter your Gmail App Password (16 characters): " EMAIL_PASS

# Create .env file
cat > .env << EOF
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/prodease

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRE=30d

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=$EMAIL_USER
EMAIL_PASS=$EMAIL_PASS
EMAIL_FROM=$EMAIL_USER

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF

echo ""
echo "✅ Configuration complete!"
echo "📧 Email configured for: $EMAIL_USER"
echo ""
echo "Start your server with: npm run dev"
```

Save this as `setup-gmail.sh` and run:
```bash
chmod +x setup-gmail.sh
./setup-gmail.sh
```

---

For more information, visit the [Nodemailer Gmail Documentation](https://nodemailer.com/usage/using-gmail/)
