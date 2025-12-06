# API Documentation

Complete API reference for the Email Incident Logging & Summarization Tool.

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Response Format

All responses follow this structure:

### Success Response
```json
{
  "status": "success",
  "data": { ... },
  "message": "Optional success message",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Human-readable error message",
  "error": {
    "code": "ERROR_CODE",
    "details": { ... }
  }
}
```

---

## Endpoints

### Health Check

#### `GET /api/health`

Check system health status.

**Response:**
```json
{
  "status": "success",
  "data": {
    "status": "healthy",
    "timestamp": "2024-12-06T10:30:00.000Z",
    "version": "1.0.0",
    "services": {
      "database": { "status": "up" },
      "ai": { "status": "up", "message": "Providers: openrouter, gemini" }
    }
  }
}
```

#### `GET /api/health/ping`

Simple ping endpoint.

**Response:**
```json
{
  "status": "success",
  "message": "pong",
  "timestamp": "2024-12-06T10:30:00.000Z"
}
```

---

### Upload

#### `POST /api/upload`

Upload and process an email file.

**Content-Type:** `multipart/form-data`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | File | Yes | Email file (.msg or .eml) |

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "subject": "Server Outage Alert",
    "senderName": "System Monitoring",
    "senderEmail": "monitoring@company.com",
    "receivedAt": "2024-12-06T08:30:00.000Z",
    "loggedAt": "2024-12-06T10:35:00.000Z",
    "summary": "AI-generated summary...",
    "bodyText": "Full email content...",
    "summarized": true,
    "fileName": "alert.eml",
    "fileType": ".eml"
  },
  "message": "Email processed successfully. Incident #1 created."
}
```

**Error Responses:**
- `400` - Invalid file type
- `422` - File processing error

#### `GET /api/upload/types`

Get supported file types.

**Response:**
```json
{
  "status": "success",
  "data": [".msg", ".eml"]
}
```

---

### Incidents

#### `GET /api/incidents`

Get all incidents with pagination and filtering.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page (max 100) |
| search | string | - | Search in subject, sender, summary |
| senderEmail | string | - | Filter by sender email |
| subject | string | - | Filter by subject |
| startDate | string | - | Filter by start date (ISO format) |
| endDate | string | - | Filter by end date (ISO format) |
| incidentId | string | - | Filter by incident ID |

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "subject": "Server Outage Alert",
      "senderName": "System Monitoring",
      "senderEmail": "monitoring@company.com",
      "receivedAt": "2024-12-06T08:30:00.000Z",
      "loggedAt": "2024-12-06T10:35:00.000Z",
      "summary": "AI-generated summary...",
      "bodyText": "Full email content...",
      "summarized": true,
      "fileName": "alert.eml",
      "fileType": ".eml"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### `GET /api/incidents/stats`

Get incident statistics.

**Response:**
```json
{
  "status": "success",
  "data": {
    "total": 150,
    "summarized": 145,
    "unsummarized": 5,
    "todayCount": 12
  }
}
```

#### `GET /api/incidents/:id`

Get a single incident by ID.

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "subject": "Server Outage Alert",
    "senderName": "System Monitoring",
    "senderEmail": "monitoring@company.com",
    "receivedAt": "2024-12-06T08:30:00.000Z",
    "loggedAt": "2024-12-06T10:35:00.000Z",
    "summary": "AI-generated summary...",
    "bodyText": "Full email content...",
    "rawEml": "Raw email content...",
    "summarized": true,
    "fileName": "alert.eml",
    "fileType": ".eml",
    "errorMessage": null
  }
}
```

**Error Responses:**
- `404` - Incident not found

#### `POST /api/incidents`

Create a new incident manually.

**Request Body:**
```json
{
  "subject": "Manual Incident",
  "senderName": "John Doe",
  "senderEmail": "john@example.com",
  "receivedAt": "2024-12-06T08:30:00.000Z",
  "bodyText": "Email content...",
  "summary": "Optional summary"
}
```

**Response:**
```json
{
  "status": "success",
  "data": { ... },
  "message": "Incident #1 created successfully"
}
```

#### `PUT /api/incidents/:id`

Update an incident.

**Request Body:**
```json
{
  "subject": "Updated Subject",
  "summary": "Updated summary"
}
```

**Response:**
```json
{
  "status": "success",
  "data": { ... },
  "message": "Incident #1 updated successfully"
}
```

#### `DELETE /api/incidents/:id`

Delete an incident.

**Response:**
```json
{
  "status": "success",
  "message": "Incident #1 deleted successfully"
}
```

---

### Summarization

#### `POST /api/summarize`

Generate AI summary for provided content.

**Request Body:**
```json
{
  "content": "Text content to summarize...",
  "maxLength": 500
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "success": true,
    "summary": "AI-generated summary...",
    "provider": "openrouter"
  },
  "message": "Summary generated successfully"
}
```

#### `GET /api/summarize/status`

Check AI service availability.

**Response:**
```json
{
  "status": "success",
  "data": {
    "available": true,
    "providers": ["openrouter", "gemini"]
  }
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Request validation failed |
| NOT_FOUND | 404 | Resource not found |
| FILE_PROCESSING_ERROR | 422 | Email file processing failed |
| AI_SERVICE_ERROR | 503 | AI summarization service error |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Internal server error |

---

## Rate Limiting

- Default: 100 requests per 15 minutes per IP
- Applies to all `/api/*` endpoints
- Headers returned:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`
