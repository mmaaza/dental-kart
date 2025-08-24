# Chat System Implementation

This document describes the chat system implementation that allows users and vendors to chat with admins, but not with each other.

## Overview

The chat system is designed with the following architecture:
- **Users and Vendors** can only chat with **Admins**
- **Users and Vendors** cannot chat with each other
- **Admins** can chat with all users and vendors
- Real-time updates via polling (every 10 seconds)

## Backend Implementation

### Models

#### Chat Model (`backend/src/models/chat.model.js`)
- Stores chat conversations between participants
- Supports message types: text, file, image
- Tracks read/unread status
- Chat types: `user-admin`, `vendor-admin`

#### Message Schema
- `sender`: Reference to User model
- `content`: Message text
- `messageType`: text, file, or image
- `fileUrl`: Optional file attachment URL
- `isRead`: Read status
- `createdAt`: Timestamp

### Controllers

#### Chat Controller (`backend/src/controllers/chat.controller.js`)
- `getUserChat`: Get user's chat with admin
- `sendMessage`: Send message to admin (users/vendors only)
- `getAdminChats`: Get all chats for admin
- `getAdminChat`: Get specific chat for admin
- `adminSendMessage`: Admin sends message to user/vendor
- `markAsRead`: Mark messages as read
- `getUnreadCount`: Get unread message count

### Routes

#### Chat Routes (`backend/src/routes/chat.routes.js`)
- `GET /api/chat`: Get user's chat with admin
- `POST /api/chat/message`: Send message to admin
- `PUT /api/chat/:chatId/read`: Mark messages as read
- `GET /api/chat/unread`: Get unread count
- `GET /api/chat/admin`: Get all admin chats
- `GET /api/chat/admin/:chatId`: Get specific admin chat
- `POST /api/chat/admin/:chatId/message`: Admin sends message

## Frontend Implementation

### Services

#### Chat Service (`src/services/chatService.js`)
- `chatService`: For users and vendors
- `adminChatService`: For admins
- Handles API calls to backend

### Context

#### Chat Context (`src/contexts/ChatContext.jsx`)
- Manages chat state across the application
- Provides real-time updates via polling
- Handles authentication-based access control
- Auto-refreshes chat data every 10 seconds

### Components

#### Chat Widget (`src/components/ui/ChatWidget.jsx`)
- Floating chat widget for users and vendors
- Shows unread message count
- Requires authentication to send messages
- Auto-scrolls to latest messages
- Shows typing indicators

#### Admin Chat Page (`src/pages/admin/AdminChatPage.jsx`)
- Full chat interface for admins
- Lists all conversations with users/vendors
- Shows participant information and role badges
- Real-time message updates
- Unread message indicators

## Features

### For Users/Vendors
- ✅ Chat with admin only
- ✅ Real-time message updates
- ✅ Unread message count
- ✅ Typing indicators
- ✅ Message timestamps
- ✅ Authentication required

### For Admins
- ✅ View all conversations
- ✅ Respond to users and vendors
- ✅ See participant information
- ✅ Unread message indicators
- ✅ Real-time updates
- ✅ Role-based chat filtering

### Security Features
- ✅ Role-based access control
- ✅ Authentication required for all operations
- ✅ Users/vendors cannot chat with each other
- ✅ Admin-only endpoints protected

## Usage

### For Users/Vendors
1. Login to the application
2. Click the chat widget (bottom-right corner)
3. Send messages to admin
4. View real-time responses

### For Admins
1. Login as admin
2. Navigate to `/admin/chat`
3. Select a conversation from the list
4. Send responses to users/vendors

## API Endpoints

### User/Vendor Endpoints
```
GET    /api/chat                    # Get user's chat with admin
POST   /api/chat/message           # Send message to admin
PUT    /api/chat/:chatId/read      # Mark messages as read
GET    /api/chat/unread            # Get unread count
```

### Admin Endpoints
```
GET    /api/chat/admin             # Get all admin chats
GET    /api/chat/admin/:chatId     # Get specific admin chat
POST   /api/chat/admin/:chatId/message  # Admin sends message
```

## Database Schema

### Chat Collection
```javascript
{
  _id: ObjectId,
  participants: [ObjectId], // Array of user IDs
  messages: [{
    _id: ObjectId,
    sender: ObjectId, // Reference to User
    content: String,
    messageType: String, // 'text', 'file', 'image'
    fileUrl: String, // Optional
    isRead: Boolean,
    createdAt: Date
  }],
  lastMessage: Date,
  isActive: Boolean,
  chatType: String, // 'user-admin', 'vendor-admin'
  createdAt: Date,
  updatedAt: Date
}
```

## Future Enhancements

- [ ] WebSocket support for real-time messaging
- [ ] File upload functionality
- [ ] Message notifications
- [ ] Chat history export
- [ ] Message search functionality
- [ ] Typing indicators
- [ ] Message reactions
- [ ] Chat analytics

## Testing

To test the chat system:

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend**
   ```bash
   npm run dev
   ```

3. **Test as a user/vendor**
   - Login as a user or vendor
   - Click the chat widget
   - Send a message

4. **Test as an admin**
   - Login as an admin
   - Navigate to `/admin/chat`
   - Select a conversation and respond

## Notes

- The system uses polling for real-time updates (every 10 seconds)
- All chat operations require authentication
- Users and vendors can only chat with admins
- Admins can chat with all users and vendors
- The chat widget only appears for users and vendors (not admins) 