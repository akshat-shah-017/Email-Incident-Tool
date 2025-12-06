# Email Incident Tool - Frontend

React frontend application built with Vite, TailwindCSS, and Zustand.

## Features

- Drag-and-drop email file upload
- Responsive incident table with pagination
- Search and filter functionality
- AI summary display
- Incident detail view
- Dark mode with premium design

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/     # Reusable React components
│   ├── Layout.tsx
│   ├── DragDropZone.tsx
│   ├── SearchFilter.tsx
│   ├── IncidentTable.tsx
│   └── StatsCards.tsx
├── pages/         # Page components
│   ├── Dashboard.tsx
│   └── IncidentDetail.tsx
├── store/         # Zustand state management
├── utils/         # API wrapper & helpers
├── styles/        # Global CSS
├── App.tsx        # Main application
└── main.tsx       # Entry point
```

## Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
```

## Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Building for Production

```bash
# Build
npm run build

# The output will be in the 'dist' folder
```
