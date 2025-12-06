# Email Incident Tool - Backend

Express.js API server with TypeScript, Prisma ORM, and PostgreSQL.

## Features

- RESTful API for incident management
- Email parsing (`.msg` and `.eml` files)
- AI summarization (OpenRouter & Gemini)
- PostgreSQL database with Prisma ORM
- Input validation with Zod
- Structured logging with Winston
- Rate limiting and security headers

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp ../.env.example .env

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed

# Start development server
npm run dev
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/upload` | POST | Upload & parse email |
| `/api/summarize` | POST | Generate AI summary |
| `/api/incidents` | GET | List all incidents |
| `/api/incidents/:id` | GET | Get single incident |
| `/api/incidents` | POST | Create incident |

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── routes/         # API routes
├── services/       # Business logic
├── middleware/     # Express middleware
├── models/         # Type definitions
├── db/             # Database utilities
├── utils/          # Helper functions
├── app.ts          # Express app setup
└── server.ts       # Server entry point
```

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test -- --coverage
```

## Database Management

```bash
# Open Prisma Studio
npx prisma studio

# Create migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset
```
