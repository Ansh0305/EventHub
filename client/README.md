# EventHub - Client

The React frontend for EventHub, a modern event management platform.

## 🛠️ Tech Stack

- **React 19** - UI library
- **React Router 7** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **date-fns** - Date formatting
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx       # Navigation bar
│   ├── EventCard.jsx    # Event card component
│   ├── ImageUpload.jsx  # Cloudinary image upload
│   ├── ProtectedRoute.jsx # Auth protection wrapper
│   └── LoadingSpinner.jsx # Loading indicator
├── pages/               # Page components
│   ├── Dashboard.jsx    # Home page with events list
│   ├── Login.jsx        # User login
│   ├── Signup.jsx       # User registration
│   ├── EventDetail.jsx  # Single event view
│   ├── CreateEvent.jsx  # Create new event form
│   ├── EditEvent.jsx    # Edit existing event
│   ├── MyEvents.jsx     # User's events dashboard
│   └── AdminDashboard.jsx # Admin panel
├── context/
│   └── AuthContext.jsx  # Authentication state management
├── services/
│   └── api.js           # Axios API configuration
├── App.jsx              # Main app with routes
├── main.jsx             # Entry point
└── index.css            # Global styles & design system
```

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- Backend server running on port 5000

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

## 📄 Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Browse all events with search & filters |
| `/login` | Login | User authentication |
| `/signup` | Signup | New user registration |
| `/event/:id` | Event Detail | View event details, RSVP |
| `/create-event` | Create Event | Create new event (protected) |
| `/edit-event/:id` | Edit Event | Edit own event (protected) |
| `/my-events` | My Events | View created & attending events |
| `/admin` | Admin Dashboard | Admin panel (admin only) |

## 🎨 Features

- **Modern UI** - Dark theme with glassmorphism effects
- **Responsive Design** - Works on mobile, tablet, and desktop
- **Image Upload** - Cloudinary integration for event images
- **Real-time Notifications** - Toast notifications for actions
- **Protected Routes** - Authentication-based access control
- **Search & Filter** - Find events by title, category, or location
