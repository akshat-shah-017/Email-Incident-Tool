# Email Incident Logging & Summarization Tool

A responsive web application that allows users to upload Outlook emails, automatically parse metadata, summarize content using AI, and store the processed information as searchable "incident" records in a database.

![Email Incident Tool](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)

## 🚀 Features

- **Drag-and-Drop Upload**: Upload `.msg` and `.eml` email files effortlessly
- **Automatic Parsing**: Extract subject, sender details, email body, and received date
- **AI Summarization**: Generate concise summaries using OpenRouter or Google Gemini
- **Incident Management**: Unique, auto-incremented incident numbers
- **Search & Filter**: Find incidents by number, sender, subject, or date range
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## 📁 Project Structure

```
email-incident-tool/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Type definitions
│   │   ├── db/             # Database utilities
│   │   └── utils/          # Helper functions
│   ├── prisma/             # Prisma schema & migrations
│   ├── Dockerfile
│   └── package.json
├── frontend/               # React + Vite application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── store/          # Zustand state management
│   │   ├── utils/          # API wrapper & helpers
│   │   └── styles/         # Global styles
│   ├── Dockerfile
│   └── package.json
├── docs/                   # Documentation
│   ├── API.md
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── DB_SCHEMA.md
│   └── DEPLOYMENT_GUIDE.md
├── tests/                  # Test suites
│   ├── backend-tests/
│   ├── frontend-tests/
│   └── api-tests/
├── .github/workflows/      # CI/CD pipelines
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Email Parsing**: eml-parser, msgreader
- **Validation**: Zod
- **Logging**: Winston

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Icons**: Lucide React

### DevOps
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Hosting**: Render / Railway / Vercel

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose (optional)

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/email-incident-tool.git
cd email-incident-tool

# Copy environment file
cp .env.example .env

# Edit .env with your API keys
nano .env

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

### Option 2: Manual Setup

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp ../.env.example .env

# Run database migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed

# Start development server
npm run dev
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/email_incidents"

# AI Services
OPENROUTER_API_KEY="your-openrouter-api-key"
GEMINI_API_KEY="your-gemini-api-key"

# Server
PORT=5000
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:5000/api
```

## 📖 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload` | POST | Upload & parse email file |
| `/api/summarize` | POST | Generate AI summary |
| `/api/incidents` | GET | Fetch all incidents |
| `/api/incidents/:id` | GET | Get single incident |
| `/api/incidents` | POST | Create incident record |

See [API Documentation](./docs/API.md) for detailed endpoint specifications.

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# API integration tests
cd tests/api-tests && npm test
```

## 🚢 Deployment

### Docker Deployment

```bash
# Build and push images
docker-compose build
docker-compose push

# Deploy to your server
docker-compose -f docker-compose.prod.yml up -d
```

### Platform-Specific Guides

- [Deploy to Render](./docs/DEPLOYMENT_GUIDE.md#render)
- [Deploy to Railway](./docs/DEPLOYMENT_GUIDE.md#railway)
- [Deploy to Vercel](./docs/DEPLOYMENT_GUIDE.md#vercel)

## 📚 Documentation

- [System Architecture](./docs/SYSTEM_ARCHITECTURE.md)
- [Database Schema](./docs/DB_SCHEMA.md)
- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenRouter](https://openrouter.ai/) for AI summarization API
- [Google Gemini](https://deepmind.google/technologies/gemini/) for AI summarization fallback
- [Prisma](https://www.prisma.io/) for database ORM
- [TailwindCSS](https://tailwindcss.com/) for styling
