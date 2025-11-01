# Backend Structure Document

This document outlines the backend architecture, hosting solutions, and infrastructure components for the **queue-reservation-fullstack** project. It is written in everyday language to ensure clarity and completeness.

## 1. Backend Architecture

**Overall Design:**
- We use a **Next.js**‐based backend with API Routes. This lets us write server code alongside our frontend, keeping everything in one codebase. 
- **Model–View–Controller (MVC)** principles guide our directory structure:
  - Models: database schema and ORM definitions.
  - Controllers: Next.js API handlers that process requests, talk to the database, and return responses.
  - Views: minimal server-side rendering in API Routes (JSON responses only).
- **Drizzle ORM** provides a type‐safe layer on top of PostgreSQL, ensuring SQL queries match our TypeScript types.

**Scalability and Performance:**
- **Serverless API Routes** on Vercel scale automatically with demand—more users means more instances spin up.
- **Containerization (Docker)** ensures consistent environments between development and production and allows us to run identical containers on any cloud provider.
- **Connection Pooling** is handled by the database driver, keeping connections efficient under load.

**Maintainability:**
- Clear separation of concerns: API logic lives under `app/api`, schema definitions under `db/schema`, and utility code under `lib/`.
- Strict typing (TypeScript + Drizzle) reduces runtime errors and makes refactoring safer.
- Reusable components and helper functions prevent duplication.

## 2. Database Management

**Database Technology:**
- Type: **Relational (SQL)**
- System: **PostgreSQL** (hosted via a managed service such as Amazon RDS, Google Cloud SQL, or Supabase)

**Data Structure and Access:**
- Tables represent core entities: Users, Services, Reservations, and QueueEntries.
- **Drizzle ORM** handles schema definitions and generates type‐safe queries, so developers write minimal raw SQL and avoid common mistakes.
- **Migrations** (via Drizzle) keep schema changes organized and reproducible.

**Data Management Practices:**
- **Environment variables** store database connection strings, ensuring credentials never land in source control.
- **Backups** are configured at the managed database level (daily snapshots).
- **Connection pooling** avoids overloading the database during traffic spikes.

## 3. Database Schema

Below is the SQL schema for our PostgreSQL database. It is presented in standard SQL format for clarity.

```sql
-- Users table holds application users and administrators
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Services table lists the offerings that can be reserved
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL,
  capacity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reservations table links users to services at a specific time slot
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  time_slot TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending','confirmed','canceled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- QueueEntries table tracks the order of reservations waiting in a queue
CREATE TABLE queue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
  position INT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('waiting','in_service','completed','skipped')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```  

_All timestamps use `TIMESTAMPTZ` for timezone awareness, and UUIDs ensure uniqueness across distributed systems._

## 4. API Design and Endpoints

We follow a **RESTful** design, exposing JSON endpoints under `app/api`. Authentication middleware runs on each protected route.

Key endpoints:

- **POST /api/reservations**
  - Create a new reservation. 
  - Body: `{ service_id, time_slot }`.
  - Authenticated users only.

- **GET /api/reservations**
  - Fetch all reservations for the logged-in user.
  - Authenticated users only.

- **GET /api/queues/{service_id}**
  - Get the current queue entries for a specific service.
  - Admins only.

- **POST /api/queues/{service_id}/advance**
  - Move the queue forward by updating the next entry to `in_service` or `completed`.
  - Admins only.

- **POST /api/auth/login** and **POST /api/auth/register**
  - Handled by the **Better Auth** library for user signup and login.

Each handler:
- Validates input (using Zod for schema validation).
- Checks user role (user vs. admin).
- Executes Drizzle ORM queries.
- Returns a structured JSON response with `data` or `error` fields.

## 5. Hosting Solutions

- **Vercel** (serverless) for hosting Next.js API Routes and frontend:
  - Automatic scaling and zero-configuration deployments.
  - Built-in CDN for static assets and edge caching.

- **Managed PostgreSQL** on a cloud provider (e.g., Amazon RDS, Google Cloud SQL, or Supabase):
  - Automated backups and high availability.
  - Predictable performance SLAs.

- **Docker** for local development and optional self-hosted production:
  - Containers with identical dependencies ease debugging and on-premises setups.

## 6. Infrastructure Components

- **Load Balancer / Serverless Edge Network:**
  - Vercel’s platform distributes requests across global edge nodes.

- **Content Delivery Network (CDN):**
  - Static assets (JS, CSS, images) are cached at edge locations for low latency.

- **Caching Layer:**
  - In-memory cache (e.g., Redis) can be added to store frequently accessed data such as available time slots.
  - Reduces database load during peak times.

- **Message Queue (optional):**
  - For advanced real-time features (e.g., push notifications when it’s a user’s turn), a lightweight queue like Bull or RabbitMQ can be integrated.

## 7. Security Measures

- **Authentication & Authorization:**
  - **Better Auth** library handles sign-up, login, password resets, and session cookies.
  - Role-based access control ensures only admins can hit certain endpoints.

- **Transport Security:**
  - HTTPS enforced at the CDN/edge layer (Vercel).

- **Data Encryption:**
  - All data in transit is TLS-encrypted.
  - Database credentials and secrets stored in environment variables, never in code.

- **Input Validation & Sanitization:**
  - Zod schemas validate all incoming JSON to prevent injection attacks and malformed data.

- **Rate Limiting (recommended):**
  - API throttling to fend off brute-force or denial-of-service attacks (e.g., via Vercel Edge Middleware).

## 8. Monitoring and Maintenance

- **Logging and Error Tracking:**
  - Integrate a service like Sentry to capture uncaught exceptions and performance issues.

- **Performance Monitoring:**
  - Vercel Analytics for real-time metrics on request latencies and error rates.

- **Database Health:**
  - Use the cloud provider’s dashboard (e.g., RDS Console) for slow-query insights and CPU/memory monitoring.

- **Maintenance Strategy:**
  - Scheduled database migrations via Drizzle with rollbacks.
  - Dependency upgrades managed through automated pull requests (e.g., Dependabot).
  - Periodic security audits for dependencies.

## 9. Conclusion and Overall Backend Summary

This backend is built with modern, scalable tools:

- A **Next.js** serverless API, containerized by **Docker**, deployed on **Vercel**.
- A **PostgreSQL** database accessed through **Drizzle ORM** for type safety and maintainability.
- RESTful endpoints secured by **Better Auth**, with role-based access for users and admins.
- A network of edge-cached CDN endpoints, optional Redis caching, and load-balanced serverless functions ensure performance under load.
- Monitoring, logging, and backup strategies keep the system reliable and maintainable.

Together, these components form a robust backend foundation that supports real-time queue management, reliable reservations, and a smooth user experience for both customers and administrators.