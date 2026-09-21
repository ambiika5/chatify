# 💬 Chatify

Chatify is a real-time private 1-to-1 chat application built with React, Node.js, Express, Socket.IO, Prisma, and MySQL.

It allows users to register, log in, search for other users, create private conversations, and exchange messages in real time with delivery/read status and typing indicators.

---

## ✨ Features

### 🔐 Authentication
- User registration
- User login
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes
- Logout

### 👤 User Management
- View current user profile
- Search users by username/email
- View users by ID
- Online/offline status
- Last seen tracking

### 💬 Private 1-to-1 Chat
- Private conversations between two users
- Multiple separate conversations
- Conversation history
- Message pagination
- No group chats

### ⚡ Real-Time Messaging
- Real-time messaging using Socket.IO
- Conversation rooms
- Instant message delivery
- Multiple connected users
- Real-time typing indicators

### ✓ Message Status
Messages support three statuses:

`SENT → DELIVERED → READ`

- Sent messages
- Delivered messages
- Read receipts
- Real-time read status updates

### 🔔 Unread Messages
- WhatsApp-style unread message count
- Unread count displayed beside conversations
- Counts update in real time
- Counts persist after page refresh/login
- Opening a conversation clears its unread count
- Duplicate messages do not increase the count

### 🟢 Online / Offline
- Online status through Socket.IO connection
- Offline status after disconnect
- Last seen information

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- JavaScript
- Socket.IO Client
- CSS

### Backend

- Node.js
- Express.js
- Socket.IO
- Prisma
- MySQL
- JWT
- bcrypt
- dotenv

### Database

- MySQL 8.0
- Prisma ORM

---

## 🏗️ Project Structure

```text
Chatify/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── api.js
│   │   ├── socket.js
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── routes/
│   ├── prisma/
│   ├── index.js
│   ├── package.json
│   └── ...
│
└── README.md
