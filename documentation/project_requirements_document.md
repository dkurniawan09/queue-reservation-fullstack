# Project Requirements Document (PRD)

## 1. Project Overview

This project is a full-stack web application template for a queue management and online reservation system. It provides everything you need to let customers sign up, book time slots for services, and view or cancel their reservations. On the flip side, administrators get a secure dashboard where they can see the current queue, advance to the next customer, or manage bookings in real time.

We’re building it because many small businesses—salons, clinics, repair shops—need a simple way to move their in-person queues online. Key objectives include:

•  Allowing users to register, log in, and reserve available slots via an intuitive form.  
•  Giving admins a protected dashboard to monitor and control the queue.  
•  Ensuring the system is secure, scalable, and easy to deploy through Docker and Vercel.  

Success looks like stable bookings (no double-bookings), sub-second page loads, a user-friendly UI with dark mode, and straightforward deployment to production.

## 2. In-Scope vs. Out-of-Scope

**In-Scope (First Release)**
- Email/password authentication (Better Auth library) with session handling.  
- PostgreSQL database schema for users, services, reservations, and queue entries (via Drizzle ORM).  
- Reservation UI: selection of service, date, and time slot on `/reserve`.  
- User dashboard at `/dashboard` to view, cancel, or modify their reservations.  
- Admin dashboard under `/admin/queue` with queue table, “Next Customer” and “Cancel” controls.  
- Basic input validation (Zod) on all API routes.  
- Responsive, accessible UI built with shadcn/ui and Tailwind CSS.  
- Dark mode support (next-themes).  
- Containerization with Docker and deployment setup for Vercel.  

**Out-of-Scope (Phase 2+)**
- Payment gateway integration (Stripe, PayPal).  
- SMS or email notifications for reminders or confirmations.  
- WebSocket real-time updates (only polling with React Query/SWR initially).  
- Multi-language (i18n) support.  
- Detailed analytics or reporting dashboards.  
- Mobile-only native apps (React Native or SwiftUI).  

## 3. User Flow

A new visitor lands on the home page and clicks “Sign Up.” They register with email and password, then are redirected to `/reserve`. Here they select a service type, pick an available date on a calendar component, choose a time slot from a dropdown, and hit “Book Now.” Behind the scenes, the form calls `POST /api/reservations`. The server checks the session, validates inputs with Zod, writes a new record via Drizzle ORM, and returns success or an error (e.g., if the slot is taken). The user sees a confirmation toast and can click “My Reservations.”

Authenticated users visit `/dashboard` to see a clean table of upcoming and past bookings. They can cancel or modify reservations. Administrators sign in with a special role and land on `/admin/queue`. A sidebar shows navigation links; the main area displays a live queue table. Admins click “Next Customer” to advance the queue (via `POST /api/queues/[id]/advance`) or “Cancel” to remove a booking. All operations happen seamlessly, with data fetched using React Query or SWR for polling every 10–30 seconds.

## 4. Core Features

- **Authentication & Authorization**: Email/password sign up, login, logout, session management, and role-based access (user vs. admin).
- **Reservation Form & API**: User-facing booking form with service selector, calendar, time picker; server endpoints to create and fetch reservations.
- **User Dashboard**: Table of personal reservations with cancel or reschedule options.
- **Admin Queue Dashboard**: Live queue table showing next customers, with actions to advance or cancel.
- **Data Modeling**: Drizzle ORM schemas for users, services, reservations, and queue entries; migrations to create tables and indexes.
- **UI Components**: shadcn/ui primitives (Input, Select, Calendar, Table, Button, Dialog) customized via Tailwind CSS.
- **Theming**: Light/dark mode support with next-themes.
- **Validation & Error Handling**: Zod schemas for all inputs; user-friendly error messages and server-side logging.
- **State Management & Data Fetching**: React Query or SWR for caching, polling, and revalidation of reservation and queue data.
- **Deployment & Dev Workflow**: Docker setup for consistent environments; Vercel configuration for CI/CD.

## 5. Tech Stack & Tools

- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui, next-themes  
- **Backend**: Next.js API Routes (Node.js), TypeScript, Better Auth library  
- **Database**: PostgreSQL, Drizzle ORM  
- **Validation**: Zod (runtime input validation)  
- **State/Data Fetching**: React Query or SWR for client-side caching and polling  
- **Containerization**: Docker, Docker Compose  
- **Deployment**: Vercel (Git-based CI/CD pipeline)  
- **Code Quality**: ESLint, Prettier  
- **Utilities**: GitHub Actions for tests, Node.js LTS, environment variables via `.env`  
- **IDE/Plugins (optional)**: VS Code with Windsurf (dev environment scaffolding), Cursor AI for code suggestions

## 6. Non-Functional Requirements

- **Performance**:  
  • API response times under 200 ms.  
  • Page loads under 1 second on 3G/LTE.  
- **Scalability**:  
  • Support up to 1,000 concurrent users with horizontal scaling.  
- **Security**:  
  • All traffic over HTTPS.  
  • OWASP Top 10 mitigation.  
  • Secure JWT/session storage.  
  • Environment variables for secrets.  
- **Usability & Accessibility**:  
  • WCAG 2.1 AA compliance for forms and tables.  
  • Responsive design for desktop and mobile.  
- **Reliability & Monitoring**:  
  • Centralized logging of errors and user actions.  
  • Health checks for the API.  
- **Compliance**:  
  • GDPR-ready user data handling.  
  • Database encrypted at rest if required by host.

## 7. Constraints & Assumptions

- PostgreSQL is available and reachable from containerized services.  
- Docker and Docker Compose are used in dev and staging; Vercel handles production builds.  
- Better Auth library supports all required auth flows.  
- Node.js LTS (18+) runtime in production.  
- No SMS gateway or third-party notifications initially.  
- Users have modern browsers that support ES modules and CSS variables.  
- Service timeslots are defined in the database; business rules for slot length live in code.

## 8. Known Issues & Potential Pitfalls

- **Double-Booking/Race Conditions**: Two users may try to book the same slot at once.  
  • Mitigation: Use database-level unique constraints on `(service_id, datetime)`, wrap creation in transactions, check availability again before commit.
- **Polling Overhead**: Frequent polling can tax the server and client.  
  • Mitigation: Start with 15–30 sec polling; later upgrade to WebSockets if needed.
- **Theme FOUC (Flash of Unstyled Content)**: Dark/light mode switch can cause a flicker on load.  
  • Mitigation: Follow next-themes best practices with `next/script` to set the initial theme.
- **Database Migrations Drift**: Schema changes may get out of sync.  
  • Mitigation: Adopt a migration tool (e.g., Drizzle’s migration CLI) and enforce migrations in CI.
- **Error Transparency**: Users need clear feedback on booking failures.  
  • Mitigation: Standardize API error format, show toast or inline messages for validation issues.
- **Container Networking**: Misconfigured Docker ports can block the database connection.  
  • Mitigation: Document all required ports and environment variables in `docker-compose.yml`.

---

**This PRD is the single source of truth for the AI model to generate subsequent Technical Stack, Frontend Guidelines, Backend Structure, App Flow, and File Structure documents.** All details are spelled out—there’s no guesswork left.