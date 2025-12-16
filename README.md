# EventHub - Event Management Platform

A full-stack MERN application for creating, viewing, and RSVPing to events with secure authentication, capacity enforcement, and **race condition prevention** for concurrent RSVPs.

![EventHub](https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=400&fit=crop)

## 🚀 Live Demo

- **Frontend**: [https://your-frontend.vercel.app](https://your-frontend.vercel.app)
- **Backend API**: [https://your-backend.onrender.com](https://your-backend.onrender.com)

## ✨ Features

### Core Features
- **User Authentication**
  - Secure signup and login with JWT
  - Password hashing with bcrypt
  - Protected routes and persistent sessions

- **Event Management (CRUD)**
  - Create events with image upload (Cloudinary)
  - View all upcoming events with filters
  - Edit and delete own events
  - Category-based filtering
  - Search by title, description, or location

- **RSVP System**
  - Join and leave events
  - **Capacity enforcement** - prevents overbooking
  - **Concurrency handling** - race condition prevention
  - **Duplicate prevention** - one RSVP per user per event
  - Real-time attendee count updates

- **Responsive Design**
  - Mobile-first approach
  - Seamless experience across Desktop, Tablet, and Mobile
  - Premium dark theme with glassmorphism effects

### Optional Enhancements Implemented
- ✅ **Search & Filtering** - Search by title/description, filter by category
- ✅ **User Dashboard** - View created events and attending events
- ✅ **Polished UI/UX** - Dark mode, animations, form validation
- ✅ **Admin Panel** - Manage users, events, view platform statistics

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React.js, React Router, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose |
| **Authentication** | JWT (JSON Web Tokens) |
| **Image Upload** | Cloudinary |
| **Styling** | Vanilla CSS with custom design system |
| **Icons** | Lucide React |
| **Deployment** | Vercel (Frontend), Render (Backend), MongoDB Atlas |

---

## 📁 Project Structure

```
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── EventCard.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── ImageUpload.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── pages/             # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── EventDetail.jsx
│   │   │   ├── CreateEvent.jsx
│   │   │   ├── EditEvent.jsx
│   │   │   ├── MyEvents.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── context/           # React Context
│   │   │   └── AuthContext.jsx
│   │   ├── services/          # API services
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
│
├── server/                    # Express.js Backend
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── cloudinary.js      # Cloudinary configuration
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   └── rsvpController.js  # Concurrency-safe RSVP logic
│   ├── middleware/
│   │   └── auth.js            # JWT verification
│   ├── models/
│   │   ├── User.js
│   │   └── Event.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   └── adminRoutes.js     # Admin-only routes
│   ├── index.js               # Server entry point
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## 🔒 RSVP Concurrency & Capacity Handling

### The Challenge

When multiple users attempt to RSVP for the last available spot simultaneously, a **race condition** can occur:

1. User A checks capacity: 99/100 (1 spot available) ✓
2. User B checks capacity: 99/100 (1 spot available) ✓
3. User A increments: 100/100 ✓
4. User B increments: 101/100 ❌ **Overbooking!**

### The Solution: MongoDB Atomic Operations + Transactions

We solve this using **atomic findOneAndUpdate** operations with capacity checks embedded in the query:

```javascript
// server/controllers/rsvpController.js

const joinEvent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // ATOMIC OPERATION: Check and update happen as ONE operation
    // This is the KEY to preventing race conditions
    const event = await Event.findOneAndUpdate(
      {
        _id: eventId,
        // Capacity check IN THE QUERY - only matches if not full
        attendeeCount: { $lt: eventCapacity },
        // Duplicate check IN THE QUERY - only matches if user not attending
        attendees: { $ne: userId },
      },
      {
        // Atomic updates
        $push: { attendees: userId },
        $inc: { attendeeCount: 1 },
      },
      { 
        new: true,
        session,
      }
    );

    // If event is null, update failed (full or already joined)
    if (!event) {
      await session.abortTransaction();
      return res.status(400).json({ 
        error: 'Event is full or you already joined' 
      });
    }

    await session.commitTransaction();
    res.json({ success: true, event });
    
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: 'RSVP failed' });
  } finally {
    session.endSession();
  }
};
```

### Why This Works

| Feature | Implementation | Purpose |
|---------|---------------|---------|
| **Atomic Operation** | `findOneAndUpdate` | Check + update = single atomic operation |
| **Capacity Check** | `attendeeCount: { $lt: capacity }` | Query only matches if under capacity |
| **Duplicate Prevention** | `attendees: { $ne: userId }` | Query only matches if user not in array |
| **Atomic Increment** | `$inc: { attendeeCount: 1 }` | Prevent stale count issues |
| **Transaction** | `startSession()` | ACID compliance for extra safety |

### Race Condition Prevention

With our atomic approach, the race condition is prevented:

1. User A: `findOneAndUpdate` → Capacity 99 < 100 ✓ → Increments to 100
2. User B: `findOneAndUpdate` → Capacity 100 < 100 ✗ → Query returns null → Error: "Event is full"

**Both operations are atomic** - MongoDB ensures the check and update happen without interference.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas account
- Cloudinary account

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/event-management.git
cd event-management
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eventdb
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:5173
```

Start the server:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
```

### 4. Open the Application

Visit `http://localhost:5173` in your browser.

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user (protected) |

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | Get all events (with filters) |
| GET | `/api/events/:id` | Get single event |
| POST | `/api/events` | Create event (protected) |
| PUT | `/api/events/:id` | Update event (owner only) |
| DELETE | `/api/events/:id` | Delete event (owner only) |
| GET | `/api/events/user/my-events` | Get user's created events |
| GET | `/api/events/user/attending` | Get events user is attending |

### RSVP

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/events/:id/join` | Join event (protected) |
| POST | `/api/events/:id/leave` | Leave event (protected) |
| GET | `/api/events/:id/rsvp-status` | Get RSVP status (protected) |

### Admin (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Get dashboard statistics |
| GET | `/api/admin/users` | Get all users |
| DELETE | `/api/admin/users/:id` | Delete user and their events |
| PUT | `/api/admin/users/:id/role` | Update user role |
| GET | `/api/admin/events` | Get all events (including past) |
| DELETE | `/api/admin/events/:id` | Delete any event |

---

## 🚢 Deployment

### Backend (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set root directory to `server`
4. Add environment variables
5. Build command: `npm install`
6. Start command: `node index.js`

### Frontend (Vercel)

1. Import repository on Vercel
2. Set root directory to `client`
3. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
4. Deploy

### MongoDB Atlas

1. Create a free M0 cluster
2. Whitelist `0.0.0.0/0` for cloud access
3. Create database user
4. Get connection string

---

## 📄 License

MIT License - feel free to use this project for your own purposes.

---

## 👨‍💻 Author

Built with ❤️ for the Full Stack Intern Assessment
