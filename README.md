# Auth App Frontend Client

Complete React frontend for Hyderabad Metro smart ticketing with authentication, route selection, payment flow, and QR ticket access.

## Features

✅ **User Registration** - Create a new account with form validation
✅ **User Login** - Secure login with backend JWT authentication
✅ **Protected Dashboard** - Auth-based access to metro booking features
✅ **Metro Route Selection** - Choose from station and to station
✅ **Fare Preview** - Distance, fare, and estimated travel time
✅ **Ticket Booking** - Reserve metro tickets for a selected date
✅ **Wallet Payment Flow** - Pay for reserved tickets using stored user wallet data
✅ **QR Ticket View** - Display QR code for paid tickets
✅ **Interactive Network Guide** - Red, Blue, and Green line guidance in dashboard
✅ **Responsive UI** - Works across desktop and mobile layouts

## Installation

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Setup Environment Variables

Create a `.env` file in the frontend directory:

```bash
REACT_APP_API_URL=https://metro-smart-ticketing-backend.onrender.com/api/auth
```

If `.env` is not provided, the app falls back to the deployed Render backend.

### 3. Start the Frontend

**Development Mode:**

```bash
npm start
```

or

```bash
npm run dev
```

**Production Build:**

```bash
npm run build
```

Frontend will run on `http://localhost:3000`

## Application Flow

### 1. Register

Users can create an account from the registration page.

**Fields:**

- Full Name
- Email
- Password
- Confirm Password

### 2. Login

Users authenticate with email and password.

**Backend integration:**

- `POST /api/auth/login`
- Stores returned JWT token in localStorage
- Uses token for protected metro endpoints

### 3. Dashboard

After login, users can:

- View wallet balance and passenger profile
- Select metro lines and stations
- Preview fare and route information
- Reserve tickets
- Pay for tickets
- Open QR ticket for paid journeys

### 4. Metro Ticket Flow

**Station Data:**

- `GET /api/metro/stations`

**Fare Preview:**

- `POST /api/metro/fare`

**Book Ticket:**

- `POST /api/metro/book`

**Pay Ticket:**

- `POST /api/metro/pay`

**My Tickets:**

- `GET /api/metro/my-tickets`

All metro endpoints require:

```bash
Authorization: Bearer <JWT_TOKEN>
```

## Pages and Components

### Main Pages

- `LoginPage` - User sign in
- `RegisterPage` - User registration
- `Dashboard` - Booking, payment, map, and QR workflow

### Supporting Components

- `ProtectedRoute` - Restricts dashboard access to logged-in users
- `AuthContext` - Handles auth state, token storage, and user session
- `metroApi` - Connects frontend with metro backend endpoints

## Project Structure

```text
frontend/
├── public/
│   └── index.html
├── src/
│   ├── assets/
│   │   └── logos/               # Metro logos and train illustration assets
│   ├── components/
│   │   ├── Dashboard.css        # Dashboard styling
│   │   ├── Dashboard.js         # Main metro ticketing dashboard
│   │   └── ProtectedRoute.js    # Protected route wrapper
│   ├── context/
│   │   └── AuthContext.js       # Auth and token management
│   ├── pages/
│   │   ├── LoginPage.js         # Login UI
│   │   ├── RegisterPage.js      # Registration UI
│   │   ├── LoginPage.css
│   │   └── RegisterPage.css
│   ├── services/
│   │   └── metroApi.js          # Metro API calls
│   ├── App.js                   # App routes
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## Dependencies

### Production

- **react** - Frontend UI library
- **react-dom** - DOM renderer for React
- **react-router-dom** - App routing
- **react-icons** - Icon library used across UI
- **bootstrap** - UI utility and layout support
- **qrcode** - QR ticket generation
- **react-scripts** - React build and dev tooling

## Authentication Details

### Stored Client Data

Frontend stores:

- `user` in localStorage
- `authToken` in localStorage

### Session Handling

- Token is restored on app load
- Current user is verified using `/api/auth/me`
- On unauthorized metro API response, session is cleared automatically

## UI Highlights

### Dashboard Includes

1. **Hero Carousel** - Metro smart ticketing highlights
2. **Metro Arrival Animation** - Animated train section after carousel
3. **Interactive Network Guide** - Corridor overview and station selection support
4. **Journey Planner** - Booking form with fare summary
5. **Ticket Desk** - Pending and paid tickets list
6. **QR Ticket Modal** - QR display for active paid journey

## Backend Connection

Default backend used by frontend:

```bash
https://metro-smart-ticketing-backend.onrender.com/api/auth
```

Derived metro API base:

```bash
https://metro-smart-ticketing-backend.onrender.com/api/metro
```

## Available Scripts

```bash
npm start     # Start development server
npm run dev   # Start development server
npm run build # Create production build
npm test      # Run tests
```

## Notes

- If backend token is invalid or expired, frontend clears the session automatically.
- The dashboard depends on backend metro endpoints for fare, booking, payment, and ticket history.
- The frontend uses the deployed Render backend by default unless overridden in `.env`.
