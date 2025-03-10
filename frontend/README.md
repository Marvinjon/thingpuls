# Politico Frontend

This is the frontend for the Politico project, a comprehensive platform for monitoring parliamentary proceedings in Iceland.

## Features

- User authentication and account management
- View and search for MPs, bills, and voting records
- Participate in discussion forums
- Submit whistleblowing reports
- View and analyze parliamentary data with interactive visualizations
- Personalized dashboards and notification preferences

## Technology Stack

- **React**: Frontend library for building the user interface
- **React Router**: For client-side routing
- **Material-UI**: UI component library for a modern look and feel
- **Axios**: HTTP client for making API requests
- **Chart.js and React-Chartjs-2**: For data visualization
- **JWT Authentication**: Secure user authentication

## Directory Structure

```
frontend/
  ├── public/                 # Static files
  ├── src/                    # Source code
  │   ├── components/         # Reusable UI components
  │   │   ├── auth/           # Authentication components
  │   │   ├── layout/         # Layout components (header, footer, etc.)
  │   │   └── ui/             # UI components (buttons, cards, etc.)
  │   ├── context/            # Context providers (auth, etc.)
  │   ├── hooks/              # Custom hooks
  │   ├── pages/              # Page components
  │   │   ├── analytics/      # Analytics pages
  │   │   ├── auth/           # Authentication pages
  │   │   ├── engagement/     # Discussion and whistleblowing pages
  │   │   ├── parliament/     # Parliament data pages
  │   │   └── user/           # User profile and settings pages
  │   ├── services/           # API services
  │   ├── utils/              # Utility functions
  │   ├── App.js              # Main app component
  │   ├── index.js            # Entry point
  │   └── theme.js            # Material-UI theme configuration
  ├── package.json            # Project dependencies
  └── README.md               # This file
```

## Setup and Running

1. Make sure the backend is running
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. Build for production:
   ```
   npm run build
   ```

## Connecting to the Backend

The frontend is configured to connect to the backend API running on http://localhost:8000 via a proxy setting in package.json. Make sure the backend server is running when developing locally.

## Authentication

The frontend uses JWT authentication, storing tokens in localStorage. Protected routes require authentication, and users will be redirected to the login page if they try to access protected content without being authenticated.

## State Management

- **Context API**: Used for managing authentication state and user information
- **Component-level state**: Used for form handling and UI state
- **API services**: Centralized in the services directory for data fetching 