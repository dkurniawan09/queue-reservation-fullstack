# Security Guidelines for `queue-reservation-fullstack`

This document provides targeted security recommendations for the **queue-reservation-fullstack** repository. It aligns with core security principles—Security by Design, Least Privilege, Defense in Depth, Input Validation & Output Encoding, Fail Securely, Keep Security Simple, and Secure Defaults—to ensure a robust, maintainable, and trustworthy queue management and reservation system.

---

## 1. Authentication & Access Control

### 1.1 Secure Authentication Flow
- Enforce strong password policies in the “Better Auth” configuration: minimum length (≥12), complexity (upper/lower/digit/special), and rotation reminders.  
- Use bcrypt or Argon2 (with unique salt per user) for server-side password hashing.  
- Protect session cookies with `HttpOnly`, `Secure`, and `SameSite=Strict` attributes.  
- Implement idle/absolute timeouts on sessions; revoke sessions on password change or logout.

### 1.2 JWT & Token Handling
- If using JWTs, enforce:  
  - Algorithm whitelist (e.g., RS256 or HS256); reject `alg=none`.  
  - Short expirations (e.g., 15 min access, 1 hr refresh) and rotation for refresh tokens.  
  - Strict validation of `exp`, `iss`, and `aud` claims.  
- Store refresh tokens in secure, `HttpOnly` cookies or a server database to prevent reuse.

### 1.3 Role-Based Access Control (RBAC)
- Define explicit roles (`USER`, `ADMIN`) in your database schema.  
- Enforce server-side permission checks on every protected API route (e.g., `/api/queues/*`).  
- Avoid client-side authorization logic as a sole guard; all sensitive operations must verify the user’s role and scope.

### 1.4 Multi-Factor Authentication (MFA)
- Offer optional MFA (TOTP or SMS) for administrators or high-risk operations (e.g., advancing a queue, cancelling reservations).

---

## 2. Input Handling & Data Validation

### 2.1 Server-Side Validation
- Use Zod (or a similar schema validation library) to validate all incoming JSON on Next.js API routes.  
- Validate reservation fields: date/time format, service IDs, user ownership, and enforce business rules (no double-booking).

### 2.2 Prevent Injection Risks
- Always use Drizzle ORM’s parameterized queries—never concatenate user inputs into SQL statements.  
- Sanitize any HTML inputs if you allow rich text (e.g., admin notes) using a library like DOMPurify.

### 2.3 File Uploads & Path Handling (If Applicable)
- Restrict upload types (e.g., image/png, image/jpeg) and max file size.  
- Store uploads outside the public webroot; generate randomized filenames.  
- Validate and normalize file paths to prevent traversal attacks.

---

## 3. Data Protection & Privacy

### 3.1 Data in Transit & At Rest
- Enforce HTTPS (TLS 1.2+). Redirect HTTP to HTTPS via Next.js middleware or reverse proxy.  
- Enable `Strict-Transport-Security` (HSTS) header: `max-age=31536000; includeSubDomains; preload`.
- Encrypt sensitive fields (PII) at rest if required by regulations (e.g., GDPR).  

### 3.2 Secrets Management
- Remove any hard-coded secrets from the codebase.  
- Use environment variables managed by your infrastructure (e.g., Vercel Environment Variables, AWS Secrets Manager).  
- Rotate secrets regularly and on suspected compromise.

### 3.3 Logging & Error Handling
- Do not expose stack traces or sensitive data in error responses.  
- Log errors server-side with structured logging (level, timestamp, user ID, endpoint, sanitized payload).  
- Mask or omit PII in logs; restrict log access to authorized DevOps or Security teams.

---

## 4. API & Service Security

### 4.1 Endpoint Hardening
- Require authentication middleware on all `/api/*` routes by default.  
- Apply rate limiting (e.g., 100 requests/min per IP or user) on critical endpoints:  
  - `/api/auth/*` (login, signup) to mitigate brute-force.  
  - `/api/reservations` to prevent DoS or mass bookings.

### 4.2 CORS Policy
- Configure CORS to allow only your trusted origins (e.g., `https://app.example.com`).  
- Avoid wildcard (`*`) in production.

### 4.3 API Versioning
- Prefix critical endpoints with `/api/v1/` to manage breaking changes while preserving backward compatibility.

### 4.4 Rate Limiting & Throttling
- Use a middleware (e.g., `express-rate-limit`, custom Next.js middleware) to enforce global and per-route limits.

---

## 5. Web Application Security Hygiene

### 5.1 Security Headers
- Add the following HTTP headers in Next.js `next.config.js` or via a proxy:  
  - `Content-Security-Policy`: Define allowed sources for scripts, styles, images, and frames.  
  - `X-Content-Type-Options: nosniff`  
  - `X-Frame-Options: DENY` or set `frame-ancestors` in CSP  
  - `Referrer-Policy: strict-origin-when-cross-origin`

### 5.2 CSRF Protection
- For cookie-based session flows, implement a CSRF token (synchronizer token pattern) on all state-changing requests (`POST`, `PUT`, `DELETE`).

### 5.3 Secure Client-Side Storage
- Avoid storing tokens or sensitive data in `localStorage` or `sessionStorage`.  
- If using cookies, set `Secure`, `HttpOnly`, and `SameSite` attributes.

### 5.4 Subresource Integrity (SRI)
- When loading third-party scripts or styles (e.g., CDN), include integrity hashes to guard against tampering.

---

## 6. Infrastructure & Configuration Management

### 6.1 Docker & Deployment
- Use minimal base images (e.g., `node:18-alpine`) and remove build tools in production images.  
- Do not run containers as `root`; create and use a non-root application user.  
- Scan your Docker images regularly for vulnerabilities (e.g., using Trivy or Clair).

### 6.2 Secure Defaults
- Disable Next.js dev/debug features in production (`NEXT_PUBLIC_VERCEL_ENV=production`).  
- Do not expose `.git` directories or source maps publicly.

### 6.3 Network Hardening
- Expose only necessary ports (e.g., 443).  
- If using a managed database, restrict connections via IP allowlists or VPC peering.

---

## 7. Dependency Management

- Maintain a `package-lock.json` or `yarn.lock` to lock transitive dependency versions.  
- Integrate a Software Composition Analysis (SCA) tool (e.g., Dependabot, Snyk) in CI to detect and alert on vulnerable packages.  
- Regularly update dependencies to patched, stable releases.
- Remove unused dependencies to reduce the attack surface.

---

## 8. Testing & CI/CD Security

- Include automated unit and integration tests that validate:  
  - Authentication and authorization guards.  
  - Input validation and error cases (e.g., double bookings).  
  - Rate-limit enforcement and CORS restrictions.
- Secure your CI/CD pipeline:  
  - Store secrets (tokens, certs) in CI vaults, not plain YAML files.  
  - Enforce branch protection rules and require code reviews for merges.  
  - Scan code for secrets using a tool like GitHub’s Secret Scanning or TruffleHog.

---

By integrating these guidelines into your development, review, and deployment processes, **queue-reservation-fullstack** will achieve a layered, defense-in-depth posture, reducing the risk of unauthorized access, data breaches, and system disruption.