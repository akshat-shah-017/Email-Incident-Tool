# Database Schema

## Overview

The Email Incident Tool uses PostgreSQL as its primary database, managed through Prisma ORM.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          incidents                               │
├─────────────────────────────────────────────────────────────────┤
│ PK  incident_id     SERIAL                                      │
├─────────────────────────────────────────────────────────────────┤
│     subject         VARCHAR(500)    NOT NULL                    │
│     sender_name     VARCHAR(255)    NULL                        │
│ IDX sender_email    VARCHAR(255)    NOT NULL                    │
│ IDX received_at     TIMESTAMPTZ     NOT NULL                    │
│ IDX logged_at       TIMESTAMPTZ     NOT NULL DEFAULT now()      │
│     summary         TEXT            NULL                        │
│     body_text       TEXT            NOT NULL                    │
│     raw_eml         TEXT            NULL                        │
│     file_name       VARCHAR(255)    NULL                        │
│     file_type       VARCHAR(10)     NULL                        │
│     summarized      BOOLEAN         NOT NULL DEFAULT false      │
│     error_message   TEXT            NULL                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       system_config                              │
├─────────────────────────────────────────────────────────────────┤
│ PK  id              SERIAL                                      │
├─────────────────────────────────────────────────────────────────┤
│ UQ  key             VARCHAR(100)    NOT NULL                    │
│     value           TEXT            NOT NULL                    │
│     created_at      TIMESTAMPTZ     NOT NULL DEFAULT now()      │
│     updated_at      TIMESTAMPTZ     NOT NULL                    │
└─────────────────────────────────────────────────────────────────┘
```

## Tables

### incidents

Main table storing all processed email incidents.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `incident_id` | SERIAL | PRIMARY KEY | Unique auto-incremented incident ID |
| `subject` | VARCHAR(500) | NOT NULL | Email subject/title |
| `sender_name` | VARCHAR(255) | NULL | Sender's display name |
| `sender_email` | VARCHAR(255) | NOT NULL, INDEXED | Sender's email address |
| `received_at` | TIMESTAMPTZ | NOT NULL, INDEXED | When email was received |
| `logged_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now(), INDEXED | When incident was logged |
| `summary` | TEXT | NULL | AI-generated summary |
| `body_text` | TEXT | NOT NULL | Full email body text |
| `raw_eml` | TEXT | NULL | Raw email file content |
| `file_name` | VARCHAR(255) | NULL | Original uploaded filename |
| `file_type` | VARCHAR(10) | NULL | File extension (.msg/.eml) |
| `summarized` | BOOLEAN | NOT NULL, DEFAULT false | Whether AI summarization succeeded |
| `error_message` | TEXT | NULL | Error message if processing failed |

### system_config

System configuration and metadata storage.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incremented ID |
| `key` | VARCHAR(100) | NOT NULL, UNIQUE | Configuration key |
| `value` | TEXT | NOT NULL | Configuration value |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Record creation time |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update time |

## Indexes

### incidents

| Index | Columns | Purpose |
|-------|---------|---------|
| `incidents_pkey` | `incident_id` | Primary key (auto) |
| `incidents_sender_email_idx` | `sender_email` | Fast sender lookup |
| `incidents_received_at_idx` | `received_at` | Date range queries |
| `incidents_logged_at_idx` | `logged_at` | Recent incidents |
| `incidents_subject_idx` | `subject` | Subject search |

### system_config

| Index | Columns | Purpose |
|-------|---------|---------|
| `system_config_pkey` | `id` | Primary key (auto) |
| `system_config_key_key` | `key` | Unique config lookup |

## Prisma Schema

```prisma
model Incident {
  id          Int       @id @default(autoincrement()) @map("incident_id")
  subject     String    @db.VarChar(500)
  senderName  String?   @map("sender_name") @db.VarChar(255)
  senderEmail String    @map("sender_email") @db.VarChar(255)
  receivedAt  DateTime  @map("received_at") @db.Timestamptz
  loggedAt    DateTime  @default(now()) @map("logged_at") @db.Timestamptz
  summary     String?   @db.Text
  bodyText    String    @map("body_text") @db.Text
  rawEml      String?   @map("raw_eml") @db.Text
  fileName    String?   @map("file_name") @db.VarChar(255)
  fileType    String?   @map("file_type") @db.VarChar(10)
  summarized  Boolean   @default(false)
  errorMessage String?  @map("error_message") @db.Text

  @@index([senderEmail])
  @@index([receivedAt])
  @@index([loggedAt])
  @@index([subject])
  @@map("incidents")
}

model SystemConfig {
  id        Int      @id @default(autoincrement())
  key       String   @unique @db.VarChar(100)
  value     String   @db.Text
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamptz

  @@map("system_config")
}
```

## Migration Commands

```bash
# Generate migration
npx prisma migrate dev --name <migration_name>

# Apply migrations
npx prisma migrate deploy

# Reset database (DESTRUCTIVE)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate

# Open Prisma Studio
npx prisma studio
```

## Seed Data

The seed script creates sample incidents for development:

```bash
npx prisma db seed
```

Sample data includes:
- Server outage alert
- Weekly status report
- Customer complaint

## Performance Considerations

1. **Indexes** - Critical columns are indexed for fast lookups
2. **Text Columns** - `summary` and `body_text` use TEXT type for large content
3. **Timestamps** - TIMESTAMPTZ for timezone-aware dates
4. **Pagination** - API supports cursor-based pagination
5. **Connection Pooling** - Prisma handles connection pooling automatically

## Backup & Recovery

### Manual Backup
```bash
pg_dump -h localhost -U postgres -d email_incidents > backup.sql
```

### Restore
```bash
psql -h localhost -U postgres -d email_incidents < backup.sql
```

### Automated Backups
For production, use managed PostgreSQL services (Neon, Supabase, RDS) which provide automatic backups.
