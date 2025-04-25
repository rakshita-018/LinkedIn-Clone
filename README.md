# 🔗 LinkedIn Clone

A full-stack LinkedIn clone that replicates core features of the professional networking platform. Built with **ReactJS** and **Spring Boot**, the app supports secure authentication, user interaction, real-time messaging, and more.

---

## 🚀 Features

### 👤 Authentication
- JWT-based Authentication (Login/Signup)
- OAuth2 Social Login (Google)
- Secure password hashing and token refresh system

### 📝 Posts & Interactions
- Create, edit, delete posts
- Like and comment on posts

### 💬 Messaging
- Real-time chat between users using WebSockets
- Messages display status: **"sent" or "read"**

### 🔔 Notifications
- Instant push notifications for:
  - Post likes/comments
  - Connection requests
  - New messages

### 🌐 Networking
- Send/accept/reject connection requests
- View connections

### 📢 Recommendations
- Suggests new people to connect with based on:
  - Mutual connections (friends of friends)
  - Profile similarity (company, role, location)
- Dynamically scored and sorted to show the most relevant connections

### 🖼️ Picture Storing
- Upload and store profile pictures and post images

### 🔍 Search
- Full-text search on users and posts using **Hibernate Search** + **Apache Lucene**

---

## 🛠️ Tech Stack

### 🧠 Backend
- **Spring Boot** (REST API)
- **Spring Security** (JWT, OAuth2)
- **Hibernate Search + Lucene** (Full-text search)
- **MySQL** (Relational database)
- **WebSockets** (Real-time chat)

### 🌐 Frontend
- **React.js** (Component-based UI)
- **React Router** (Navigation)
- **CSS** (Custom styling)
