# 🔔 In-App Notification System

## Overview
A complete real-time notification system for admin users with automatic triggers, browser notifications, and a beautiful UI.

## ✨ Features

### 1. **Real-Time Notifications**
- Uses Supabase Realtime subscriptions
- Instant updates without page refresh
- Automatic badge count updates

### 2. **Automatic Triggers**
Notifications are automatically created for:
- ✅ **New Orders** - When a customer places an order
- ✅ **Order Status Changes** - When order moves through workflow
- ✅ **Low Stock Alerts** - When product stock ≤ 5 items
- ✅ **New Invoices** - When an invoice is created

### 3. **Notification Types**
- **Info** (Blue) - General information, new orders
- **Success** (Green) - Completed actions, invoices created
- **Warning** (Yellow) - Low stock alerts
- **Error** (Red) - Failed actions, cancelled orders

### 4. **Interactive UI**
- Bell icon with unread count badge
- Dropdown with last 10 notifications
- Click notification to mark as read
- Link to related resource (order, product, invoice)
- Time-ago formatting (e.g., "5m ago", "2h ago")
- "Mark all as read" functionality
- "Clear read" to remove old notifications

### 5. **Browser Notifications**
- Requests permission on first load
- Shows desktop notifications for new alerts
- Works even when tab is not active

## 📁 File Structure

```
components/
├── NotificationBell.jsx          # Main notification component

pages/api/notifications/
├── index.js                      # GET all notifications
├── [id].js                       # PATCH (read/unread), DELETE
├── mark-all-read.js              # POST to mark multiple as read
└── clear-read.js                 # DELETE all read notifications

supabase/migrations/
└── create_notifications_table.sql # Database schema & triggers

NOTIFICATION_SETUP.md             # Setup instructions
```

## 🚀 Setup Instructions

### Step 1: Apply Database Migration

Go to your Supabase Dashboard:
1. Navigate to **SQL Editor**
2. Create a **New Query**
3. Copy contents from `supabase/migrations/create_notifications_table.sql`
4. Click **Run**

### Step 2: Verify Installation

1. Restart your dev server: `npm run dev`
2. Login to admin dashboard
3. Look for the bell icon (🔔) in the top navbar
4. Click it - should show "No notifications yet"

### Step 3: Test the System

Create a test notification:
```sql
INSERT INTO notifications (title, message, type, category)
VALUES (
  'Welcome!',
  'Your notification system is working perfectly! 🎉',
  'success',
  'general'
);
```

Refresh the admin page - you should see the notification!

## 📊 Database Schema

```sql
notifications (
  id              UUID PRIMARY KEY
  title           VARCHAR(255)      -- Short title
  message         TEXT              -- Detailed message
  type            VARCHAR(50)       -- info, success, warning, error
  category        VARCHAR(50)       -- order, product, invoice, customer
  is_read         BOOLEAN           -- Read status
  link            VARCHAR(500)      -- Optional link to resource
  metadata        JSONB             -- Additional JSON data
  created_at      TIMESTAMP
  updated_at      TIMESTAMP
)
```

## 🔥 Automatic Triggers

### 1. New Order Notification
```sql
-- Triggered on: INSERT into orders table
-- Creates: "New Order Received" notification
-- Links to: /admin/orders/{id}
```

### 2. Order Status Change
```sql
-- Triggered on: UPDATE orders.status
-- Creates: "Order Status Updated" notification
-- Type: success (completed), error (cancelled), info (others)
-- Links to: /admin/orders/{id}
```

### 3. Low Stock Alert
```sql
-- Triggered on: INSERT/UPDATE products when stock ≤ 5
-- Creates: "Low Stock Alert" notification
-- Type: warning
-- Links to: /admin/products/{id}/edit
```

### 4. New Invoice
```sql
-- Triggered on: INSERT into invoices table
-- Creates: "New Invoice Created" notification
-- Type: success
-- Links to: /admin/invoices/{id}
```

## 💻 API Endpoints

### GET `/api/notifications`
Fetch notifications with optional filters
```javascript
// Get last 10 notifications
GET /api/notifications?limit=10

// Get only unread
GET /api/notifications?unreadOnly=true

Response: {
  notifications: [...],
  unreadCount: 5
}
```

### PATCH `/api/notifications/[id]`
Mark notification as read/unread
```javascript
PATCH /api/notifications/abc-123
Body: { is_read: true }
```

### DELETE `/api/notifications/[id]`
Delete a notification
```javascript
DELETE /api/notifications/abc-123
```

### POST `/api/notifications/mark-all-read`
Mark multiple notifications as read
```javascript
POST /api/notifications/mark-all-read
Body: { notificationIds: ['id1', 'id2', 'id3'] }
```

### DELETE `/api/notifications/clear-read`
Clear all read notifications
```javascript
DELETE /api/notifications/clear-read
```

## 🎨 UI Components

### NotificationBell Component
```jsx
<NotificationBell />
```

Features:
- Real-time updates via Supabase subscriptions
- Auto-refreshes every time notifications change
- Animated badge with unread count
- Beautiful dropdown with icons
- Click-outside to close
- Responsive design

### Visual Indicators
- **Unread Badge** - Red circle with count (pulsing animation)
- **Blue Dot** - Next to unread notifications in dropdown
- **Blue Background** - Unread notification rows
- **Color-coded Icons** - Different icon for each type

## 🔧 Customization

### Add Custom Notification
```javascript
// From any API route or server-side code
const { data, error } = await supabase
  .from('notifications')
  .insert({
    title: 'Custom Event',
    message: 'Something important happened!',
    type: 'info',
    category: 'general',
    link: '/admin/some-page',
    metadata: {
      custom_field: 'value'
    }
  })
```

### Create New Trigger
```sql
-- Example: Notify when customer registers
CREATE OR REPLACE FUNCTION notify_new_customer()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (title, message, type, category, metadata)
  VALUES (
    'New Customer',
    'Customer ' || NEW.name || ' just registered!',
    'success',
    'customer',
    jsonb_build_object('customer_id', NEW.id, 'email', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_new_customer
  AFTER INSERT ON customers
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_customer();
```

## 📱 Browser Notification Permissions

The system automatically requests browser notification permission on first load. Users will see:
- Chrome: "empirecarac.in wants to show notifications"
- Allow or Block

If allowed, desktop notifications will appear for new alerts even when the tab is inactive.

## 🎯 Best Practices

1. **Keep titles short** - 3-7 words max
2. **Messages should be actionable** - Tell admin what happened and why
3. **Always include links** - Let admins click to see details
4. **Use metadata** - Store extra data for future reference
5. **Set appropriate types** - Helps admins prioritize
6. **Clean old notifications** - Use "Clear read" regularly

## 🐛 Troubleshooting

### Bell icon not showing
- Check AdminLayout.jsx imports NotificationBell
- Verify component is added to navbar

### No notifications appearing
- Run the SQL migration in Supabase dashboard
- Check database has `notifications` table
- Test with manual INSERT query

### Realtime not working
- Check Supabase Realtime is enabled for your project
- Verify API keys are correct in .env.local
- Check browser console for errors

### API errors
- Ensure all API routes exist in pages/api/notifications/
- Check Supabase permissions (RLS policies if enabled)
- Verify environment variables

## 🚀 Future Enhancements

Possible additions:
- Email notifications for critical alerts
- SMS notifications via Twilio
- Notification preferences/settings
- Notification history page
- Bulk actions (delete multiple)
- Notification search/filter
- Push notifications for mobile
- Notification scheduling

## 📄 License
Part of Empire Car A/C Spare Parts Management System
