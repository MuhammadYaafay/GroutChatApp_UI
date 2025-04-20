
# Real-Time Chat Application

A full-stack chat application with real-time messaging, direct messages, group chats, and file sharing.

## Features

- User Authentication (JWT-based)
- Direct Messages (1-on-1 chat)
- Group Chats / Channels
- Real-time messaging using Socket.IO
- Profile management (including profile picture)
- File sending (images/docs) with download support

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- shadcn/ui components
- Socket.IO client

### Backend
- Node.js
- Express.js
- MySQL
- Socket.IO
- JWT for authentication
- Multer for file uploads

## Project Structure

```
/
├── frontend/          # React frontend code
└── backend/           # Node.js & Express backend
    ├── config/        # Database configuration
    ├── controllers/   # Request handlers
    ├── middleware/    # Custom middleware functions
    ├── routes/        # API routes
    └── uploads/       # File uploads directory
```

## Database Schema

The application uses MySQL with the following schema:

- **Users**: Store user information (id, username, email, password, avatar, status, etc.)
- **Channels**: Store group chat information (id, name, description, is_private, etc.)
- **Channel Members**: Many-to-many relationship between users and channels
- **Messages**: Store messages for both direct and channel communication
- **Message Attachments**: Store file attachments for messages

## Setting Up Locally

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a MySQL database:
   ```sql
   CREATE DATABASE chatapp;
   ```

4. Configure environment variables:
   - Rename `.env` to `.env.local`
   - Update database credentials and JWT secret

5. Initialize the database with schema and sample data:
   ```bash
   mysql -u yourusername -p chatapp < config/db_init.sql
   ```

6. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the API endpoint:
   - Update the API base URL in `src/config.js` if needed

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and visit `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Log in a user
- `GET /api/auth/user` - Get logged in user
- `POST /api/auth/logout` - Log out a user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Update user password

### Messages
- `POST /api/messages/direct` - Send direct message
- `GET /api/messages/direct/:userId` - Get direct messages with a user
- `POST /api/messages/channel` - Send channel message
- `GET /api/messages/channel/:channelId` - Get messages in a channel
- `GET /api/messages/attachments/:id` - Download a message attachment

### Channels
- `POST /api/channels` - Create a new channel
- `GET /api/channels` - Get user's channels
- `GET /api/channels/available` - Get channels available to join
- `GET /api/channels/:id` - Get channel by ID
- `PUT /api/channels/:id` - Update a channel
- `POST /api/channels/:id/members` - Add a user to a channel
- `DELETE /api/channels/:id/members/:userId` - Remove a user from a channel
- `DELETE /api/channels/:id` - Delete a channel

## Socket.IO Events

### Client Events (Emit)
- `authenticate` - Authenticate the socket connection
- `direct_message` - Send a direct message
- `channel_message` - Send a channel message
- `typing` - Send typing indicator
- `message_read` - Mark a message as read
- `join_channel` - Join a channel room
- `leave_channel` - Leave a channel room

### Server Events (Listen)
- `direct_message` - Receive a direct message
- `channel_message` - Receive a channel message
- `typing` - Receive typing indicator
- `message_read` - Receive read receipt
- `user_status_change` - User status changed
- `channel_joined` - Successfully joined a channel
- `channel_left` - Successfully left a channel
- `error` - Error notification
