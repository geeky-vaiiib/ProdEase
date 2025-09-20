#!/bin/bash

# ProdEase Real-Time Updates Test Script
# Tests the real-time functionality and theme system

API_BASE_URL="http://localhost:5001/api"
FRONTEND_URL="http://localhost:3001"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🚀 Starting ProdEase Real-Time Updates Test Suite"
echo "============================================================"

# Test frontend connectivity
echo -e "\n🌐 Testing Frontend Connectivity..."
if curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" | grep -q "200"; then
    echo -e "  ${GREEN}✅ Frontend is accessible${NC}"
else
    echo -e "  ${RED}❌ Frontend connectivity issue${NC}"
fi

# Test authentication
echo -e "\n🔐 Testing Authentication..."
AUTH_RESPONSE=$(curl -s -X POST "$API_BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@prodease.com", "password": "testpass123"}')

if echo "$AUTH_RESPONSE" | grep -q '"success":true'; then
    echo -e "  ${GREEN}✅ Login successful${NC}"
    TOKEN=$(echo "$AUTH_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo -e "  ${BLUE}📄 Token obtained${NC}"
else
    echo -e "  ${RED}❌ Login failed${NC}"
    echo "  Response: $AUTH_RESPONSE"
    exit 1
fi

# Test Manufacturing Orders API
echo -e "\n📋 Testing Manufacturing Orders API..."

# Get all orders
echo -e "  📥 Fetching all orders..."
ORDERS_RESPONSE=$(curl -s -X GET "$API_BASE_URL/manufacturing-orders" \
  -H "Authorization: Bearer $TOKEN")

if echo "$ORDERS_RESPONSE" | grep -q '"success":true'; then
    echo -e "  ${GREEN}✅ Orders fetched successfully${NC}"
    ORDER_COUNT=$(echo "$ORDERS_RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
    echo -e "  ${BLUE}📊 Found $ORDER_COUNT orders${NC}"
    
    if [ "$ORDER_COUNT" -gt 0 ]; then
        # Extract first order ID
        ORDER_ID=$(echo "$ORDERS_RESPONSE" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
        echo -e "  ${BLUE}📄 Testing with order ID: $ORDER_ID${NC}"
        
        # Test order update
        echo -e "  📝 Testing order update..."
        UPDATE_RESPONSE=$(curl -s -X PUT "$API_BASE_URL/manufacturing-orders/$ORDER_ID" \
          -H "Authorization: Bearer $TOKEN" \
          -H "Content-Type: application/json" \
          -d '{"notes": "Updated via test script at '$(date)'"}')
        
        if echo "$UPDATE_RESPONSE" | grep -q '"success":true'; then
            echo -e "  ${GREEN}✅ Order updated successfully${NC}"
        else
            echo -e "  ${RED}❌ Order update failed${NC}"
        fi
        
        # Test status update
        echo -e "  🔄 Testing status update..."
        STATUS_RESPONSE=$(curl -s -X PATCH "$API_BASE_URL/manufacturing-orders/$ORDER_ID/status" \
          -H "Authorization: Bearer $TOKEN" \
          -H "Content-Type: application/json" \
          -d '{"status": "In Progress"}')
        
        if echo "$STATUS_RESPONSE" | grep -q '"success":true'; then
            echo -e "  ${GREEN}✅ Status updated successfully${NC}"
        else
            echo -e "  ${RED}❌ Status update failed${NC}"
        fi
    fi
else
    echo -e "  ${RED}❌ Failed to fetch orders${NC}"
fi

# Test Theme API
echo -e "\n🎨 Testing Theme API..."

# Get current theme
echo -e "  📥 Getting current theme..."
THEME_RESPONSE=$(curl -s -X GET "$API_BASE_URL/theme" \
  -H "Authorization: Bearer $TOKEN")

if echo "$THEME_RESPONSE" | grep -q '"success":true'; then
    echo -e "  ${GREEN}✅ Theme fetched successfully${NC}"
    CURRENT_THEME=$(echo "$THEME_RESPONSE" | grep -o '"theme":"[^"]*"' | cut -d'"' -f4)
    echo -e "  ${BLUE}🎨 Current theme: $CURRENT_THEME${NC}"
    
    # Test theme update
    echo -e "  🔄 Testing theme update..."
    NEW_THEME="dark"
    if [ "$CURRENT_THEME" = "dark" ]; then
        NEW_THEME="light"
    fi
    
    THEME_UPDATE_RESPONSE=$(curl -s -X PUT "$API_BASE_URL/theme" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"theme\": \"$NEW_THEME\"}")
    
    if echo "$THEME_UPDATE_RESPONSE" | grep -q '"success":true'; then
        echo -e "  ${GREEN}✅ Theme updated to: $NEW_THEME${NC}"
    else
        echo -e "  ${RED}❌ Theme update failed${NC}"
    fi
else
    echo -e "  ${RED}❌ Failed to get theme${NC}"
fi

# Test Backend Health
echo -e "\n🏥 Testing Backend Health..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE_URL/../health" 2>/dev/null || echo "000")
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "  ${GREEN}✅ Backend health check passed${NC}"
else
    echo -e "  ${YELLOW}⚠️ Backend health endpoint not available (this is normal)${NC}"
fi

echo -e "\n============================================================"
echo -e "${GREEN}🎉 Test Suite Complete!${NC}"

echo -e "\n📋 Manual Testing Checklist:"
echo -e "  1. Open ${BLUE}http://localhost:3001${NC} in your browser"
echo -e "  2. Login with ${BLUE}test@prodease.com / testpass123${NC}"
echo -e "  3. Navigate to Manufacturing Orders"
echo -e "  4. Test inline editing by clicking on any field"
echo -e "  5. Test theme toggle in the header"
echo -e "  6. Check real-time status indicator"
echo -e "  7. Verify data updates reflect immediately"

echo -e "\n✨ Expected Results:"
echo -e "  ${GREEN}✅ All edits should update immediately${NC}"
echo -e "  ${GREEN}✅ Theme toggle should work smoothly${NC}"
echo -e "  ${GREEN}✅ Real-time indicator should show 'Live' status${NC}"
echo -e "  ${GREEN}✅ No console errors in browser dev tools${NC}"

echo -e "\n🔗 Application URLs:"
echo -e "  Frontend: ${BLUE}http://localhost:3001${NC}"
echo -e "  Backend:  ${BLUE}http://localhost:5001${NC}"
