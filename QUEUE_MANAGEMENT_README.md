# Queue Management & Online Reservation System

A modern full-stack queue management system built with Next.js, TypeScript, and PostgreSQL. This system allows customers to book appointments online and enables administrators to manage queues in real-time.

## 🚀 Features

### For Customers
- **Online Booking**: Browse services and book appointments
- **Calendar Integration**: Interactive calendar to select preferred dates
- **Time Slot Selection**: View available time slots and book appointments
- **Reservation Management**: View, modify, and cancel bookings
- **Real-time Updates**: Live queue status and wait times
- **User Authentication**: Secure sign-up and login system

### For Administrators
- **Queue Management Dashboard**: Real-time view of current queue
- **Customer Check-in**: Mark customers as checked in and manage queue positions
- **Queue Advancement**: Move customers through the queue with one click
- **Service Management**: Add, edit, and remove services
- **Time Slot Management**: Configure availability and capacity
- **Analytics Dashboard**: View booking statistics and queue metrics

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with Radix UI primitives
- **Authentication**: Better Auth with email/password support
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod schema validation
- **Styling**: Tailwind CSS with dark mode support
- **Icons**: Lucide React
- **Notifications**: Sonner toast system
- **Deployment**: Docker support

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your database configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/postgres
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Authentication
BETTER_AUTH_SECRET=your_secret_key_here
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

### 3. Set Up Database

Start the PostgreSQL database:

```bash
# Using Docker (recommended)
npm run db:dev

# Or with your own PostgreSQL instance
# Make sure it's running and accessible via DATABASE_URL
```

### 4. Create Database Schema

Generate and run database migrations:

```bash
npm run db:generate
npm run db:push
```

### 5. Seed Sample Data (Optional)

Add sample services and time slots for testing:

```bash
npm run db:seed
```

### 6. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── services/       # Service management
│   │   ├── reservations/   # Booking management
│   │   └── queue/          # Queue operations
│   ├── admin/              # Admin dashboard
│   ├── dashboard/          # User dashboard
│   ├── reserve/            # Booking page
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── *.tsx              # Custom components
├── db/
│   ├── schema/            # Database schemas
│   └── index.ts           # Database setup
├── hooks/
│   └── use-auth.ts        # Authentication hook
├── lib/
│   └── auth.ts           # Auth configuration
└── scripts/
    └── seed-data.ts      # Data seeding script
```

## 🎯 Usage

### For Customers

1. **Sign Up/Sign In**: Create an account or log in
2. **Browse Services**: View available services on the landing page
3. **Book Appointment**: Click "Book Appointment" → Select service → Choose date/time → Confirm
4. **Manage Reservations**: View your bookings in the dashboard
5. **Check In**: Use the check-in feature when you arrive

### For Administrators

1. **Access Admin Dashboard**: Go to `/admin/queue` (requires admin role)
2. **View Queue**: See real-time queue status and customer positions
3. **Manage Services**: Go to `/admin/services` to add/edit services
4. **Process Queue**: Use "Start" button to advance customers
5. **Monitor Analytics**: Track queue performance and booking statistics

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `BETTER_AUTH_SECRET` | Secret for authentication tokens | Required |
| `Better_AUTH_URL` | Base URL for auth callbacks | `http://localhost:3000` |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Public auth URL | `http://localhost:3000` |

### Database Configuration

The system uses Drizzle ORM with PostgreSQL. Key tables:

- `user`: User accounts (from Better Auth)
- `service`: Available services
- `time_slot`: Available appointment slots
- `reservation`: Customer bookings
- `queue_entry`: Queue management

## 🚀 Deployment

### Docker Deployment

Build and run with Docker:

```bash
# Build the image
npm run docker:build

# Start with Docker Compose
npm run docker:up
```

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Set production environment variables

3. Start the server:
   ```bash
   npm start
   ```

## 🧪 Development

### Adding New Services

1. Go to `/admin/services`
2. Click "Add Service"
3. Fill in service details (name, description, duration)
4. Click "Create Service"

### Managing Time Slots

Time slots are automatically generated based on service duration and business hours (9 AM - 5 PM). You can modify the seeding script to customize:

- Business hours
- Time slot intervals
- Service availability

### Customizing the UI

The application uses shadcn/ui components with Tailwind CSS. Customize:

- `tailwind.config.js`: Theme and styling
- `components/ui/`: UI components
- `app/globals.css`: Global styles

## 🔍 API Endpoints

### Authentication
- `GET/POST /api/auth/[...all]` - Authentication endpoints

### Services
- `GET /api/services` - List all services
- `POST /api/services` - Create new service

### Time Slots
- `GET /api/timeslots/[serviceId]` - Get available time slots

### Reservations
- `GET /api/reservations` - Get user reservations
- `POST /api/reservations` - Create new reservation
- `PATCH /api/reservations/[id]` - Update reservation
- `DELETE /api/reservations/[id]` - Cancel reservation

### Queue Management
- `GET /api/queue` - Get current queue
- `POST /api/queue/checkin` - Check in customer
- `POST /api/queue/advance/[id]` - Advance queue

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in `.env`
   - Verify database credentials

2. **Migration Issues**
   - Run `npm run db:push` to sync schema
   - Check Drizzle configuration in `drizzle.config.ts`

3. **Authentication Issues**
   - Verify Better Auth secret
   - Check auth configuration in `lib/auth.ts`

### Getting Help

1. Check the console for error messages
2. Verify environment variables
3. Ensure database is properly configured
4. Review the authentication setup

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.