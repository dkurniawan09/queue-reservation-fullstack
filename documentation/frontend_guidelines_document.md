# Frontend Guideline Document

This document explains the frontend setup for the **queue-reservation-fullstack** project. It covers the overall architecture, design principles, styling, component structure, state management, navigation, performance, testing, and more. The goal is to give a clear picture of how the frontend is built and maintained.

## 1. Frontend Architecture

### 1.1 Frameworks and Libraries
- **Next.js (App Router)**: Handles page routing, server-side rendering, and API routes. Splits the app into folders under `app/` for pages, layouts, and server endpoints.
- **TypeScript**: Adds type checking for safer, more predictable code—especially when passing data between frontend and backend.
- **shadcn/ui**: A set of accessible, customizable React components (calendars, tables, forms) to speed up UI development.
- **Tailwind CSS**: A utility-first approach to styling that keeps styles consistent and easy to override.
- **next-themes**: Manages dark and light mode across the app.

### 1.2 Scalability, Maintainability, and Performance
- **Modular Structure**: Code is split into directories (`app/`, `components/`, `db/schema/`, `lib/`), keeping features and concerns separate.
- **Server and Client Components**: Next.js App Router allows server components for data fetching and client components for interactivity, reducing browser bundle size.
- **API Routes**: Built-in Next.js routes under `app/api/` let frontend and backend share code (validation, error handling) and types.
- **Containerization**: Docker ensures a consistent environment for development and production, making scaling smoother.

## 2. Design Principles

### 2.1 Usability
- Clear, labeled form fields and buttons.
- Feedback on user actions (success messages, loading indicators, error alerts).

### 2.2 Accessibility
- Proper ARIA attributes and semantic HTML in all components.
- Keyboard navigation and focus management in dialogs and menus.
- High color contrast in both light and dark modes.

### 2.3 Responsiveness
- Layouts adapt to mobile, tablet, and desktop via Tailwind’s responsive utility classes.
- Flexible containers and grid/flex patterns ensure content reflows naturally.

### 2.4 Consistency
- Shared component library (`shadcn/ui` + custom wrappers) ensures uniform look and feel.
- Centralized theme settings in Tailwind config and `next-themes` provider.

## 3. Styling and Theming

### 3.1 Styling Approach
- **Utility-first** with **Tailwind CSS**. All spacing, typography, colors, and layout are controlled by utility classes in markup.
- No separate CSS files; custom tweaks go into `tailwind.config.js`.

### 3.2 Theming
- **Light and dark modes** via `next-themes`. Components read the current theme and automatically adjust colors.
- Theme switcher stored in local storage so user preference persists.

### 3.3 Visual Style
- **Modern Flat Design** with subtle glassmorphic elements (frosted backgrounds on modals and cards).
- **Simple, clean interfaces** without heavy shadows or gradients.

### 3.4 Color Palette
| Role            | Light Mode  | Dark Mode   |
|-----------------|-------------|-------------|
| Primary         | #4F46E5     | #6366F1     |
| Secondary       | #F59E0B     | #D97706     |
| Success         | #10B981     | #34D399     |
| Error           | #EF4444     | #F87171     |
| Background      | #F9FAFB     | #1F2937     |
| Surface/Card    | #FFFFFF     | #111827     |
| Text Primary    | #111827     | #F9FAFB     |
| Text Secondary  | #4B5563     | #9CA3AF     |

### 3.5 Fonts
- **Inter** (sans-serif) for all text: clean, modern, and highly legible.
- System font fallback: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial`.

## 4. Component Structure

### 4.1 Organization
- **components/ui/**: Reusable building blocks imported directly from `shadcn/ui` or wrapped for our brand.
- **components/**: Application-specific components (e.g., `ReservationForm.tsx`, `QueueTable.tsx`, `AdminControls.tsx`).
- **app/**: Top-level folders for pages and nested layouts (public vs. admin sections).

### 4.2 Reusability
- Components accept props to customize labels, styles, and data.
- Common patterns (buttons, dialogs, tables) live in `components/ui` to avoid duplication.

### 4.3 Benefits of Component-Based Architecture
- **Maintainability**: Fix or enhance one component and see changes everywhere it’s used.
- **Readability**: Small, focused components are easier to understand and test.
- **Scalability**: New features are new components that plug into existing layouts.

## 5. State Management

### 5.1 Approach
- **React Query** (or **SWR**) for server state: fetching, caching, background revalidation, and polling.
- **Context API** for lightweight global state (e.g., theme switcher, user session data).

### 5.2 Data Flow
1. Components call a custom hook (`useReservations`, `useQueue`) that wraps React Query.
2. Hooks fetch data from Next.js API routes.
3. React Query caches results, provides loading and error states, and re-fetches data when needed.

## 6. Routing and Navigation

### 6.1 Routing Library
- Next.js App Router automatically maps files under `app/` to URL paths.

### 6.2 Structure
- **Public pages**: `app/reserve/page.tsx`, `app/dashboard/page.tsx`.
- **Admin section**: `app/admin/layout.tsx` with nested routes like `app/admin/queue/page.tsx`.
- **Shared layouts**: `app/layout.tsx` for global header/navigation.

### 6.3 Navigation Patterns
- **Link** component from Next.js for client-side transitions.
- Conditional navigation items based on user role (guest/user/admin).

## 7. Performance Optimization

### 7.1 Code Splitting and Lazy Loading
- Next.js automatically splits code by route.
- Client-only components use dynamic imports (`next/dynamic`) to delay loading until needed.

### 7.2 Asset Optimization
- Image optimization with Next.js `Image` component.
- SVG icons inlined or loaded as React components for minimal overhead.

### 7.3 Other Strategies
- **Server Components**: Reduce client bundle size by fetching data on the server.
- **Caching**: React Query caches API data to avoid unnecessary network calls.
- **Tree Shaking**: Tailwind CSS purges unused classes in production build.

## 8. Testing and Quality Assurance

### 8.1 Unit and Integration Testing
- **Jest** with **React Testing Library**:
  - Test individual components in isolation.
  - Mock API calls to test data-fetching hooks.

### 8.2 End-to-End Testing
- **Cypress**:
  - Simulate real user flows (booking a reservation, logging in as admin, advancing queue).

### 8.3 Code Quality
- **ESLint** for linting rules and consistency.
- **Prettier** for code formatting.
- **GitHub Actions** (or similar) to run tests and lint checks on every pull request.

## 9. Conclusion and Overall Frontend Summary

This frontend setup uses modern tools—Next.js, TypeScript, Tailwind CSS, and shadcn/ui—to create a fast, maintainable, and accessible queue reservation app. Component-based architecture and React Query keep the code organized and responsive, while built-in theming and styling ensure a polished look. Finally, thorough testing and performance optimizations guarantee a reliable user experience. Together, these guidelines will help you build, scale, and maintain the frontend with confidence.