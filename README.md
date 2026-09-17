# PRAVAH — Industrial ERP Platform

**Business workflow and inventory management platform built with the PERN stack.**

```
Customer → Enquiry → Quotation → Sales Order → Inventory Reservation → Dispatch
```

---

## Tech Stack

| Layer          | Technology                     |
| -------------- | ------------------------------ |
| **Frontend**   | React.js + TypeScript + Vite   |
| **Backend**    | Node.js + Express.js + TypeScript |
| **Database**   | PostgreSQL                     |
| **ORM**        | Prisma 7                       |
| **Auth**       | JWT + bcryptjs                 |
| **Validation** | Zod                            |
| **Testing**    | Jest + Supertest               |
| **Routing**    | React Router v7                |
| **State**      | React Context + React Query    |
| **Styling**    | Custom CSS (Dark Industrial Theme) |

---

## Project Structure

```
pravah/
├── backend/
│   ├── src/
│   │   ├── config/         # Database & environment config
│   │   ├── middleware/      # Auth, RBAC, validation, error handling
│   │   ├── routes/          # Express route definitions
│   │   ├── controllers/     # Request/response handlers
│   │   ├── services/        # Business logic layer
│   │   ├── validators/      # Zod validation schemas
│   │   ├── app.ts           # Express app setup
│   │   └── server.ts        # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Seed data script
│   ├── tests/               # Automated test suite
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Shared UI components
│   │   ├── pages/           # Page components
│   │   ├── context/         # Auth context
│   │   ├── services/        # API client
│   │   ├── types/           # TypeScript interfaces
│   │   ├── App.tsx          # Main app with routing
│   │   └── index.css        # Design system
│   └── package.json
│
└── README.md
```

---

## Prerequisites

- **Node.js** v20+ (tested with v24.14.1)
- **PostgreSQL** v14+ running locally
- **npm** v10+

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd pravah
```

### 2. Database Setup

Create the PostgreSQL database:

```sql
CREATE DATABASE pravah_db;
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env` and set your PostgreSQL password:

```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/pravah_db?schema=public"
JWT_SECRET="your-secure-random-secret"
```

### 4. Run Migrations

```bash
npx prisma migrate dev --name init
```

### 5. Seed Database

```bash
npm run db:seed
```

### 6. Start Backend Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000/api`

### 7. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

---

## Test Credentials

| Role        | Email                | Password     |
| ----------- | -------------------- | ------------ |
| **Admin**   | admin@pravah.com     | password123  |
| **Sales**   | sales@pravah.com     | password123  |

---

## Running Tests

Ensure the database is running and `.env` is configured, then:

```bash
cd backend
npm test
```

### Test Suite

| # | Test                        | What It Verifies                                     |
|---|----------------------------|------------------------------------------------------|
| 1 | Quotation Calculation       | Backend correctly calculates amounts with discount + GST |
| 2 | Invalid Conversion          | DRAFT/REJECTED quotations cannot create Sales Orders  |
| 3 | Duplicate Order Prevention  | Same quotation cannot create multiple Sales Orders    |
| 4 | Insufficient Inventory      | Reservation rejected when requested > available       |
| 5 | Authorization (RBAC)        | SALES_USER gets 403 on admin-only operations         |
| 6 | Concurrent Reservation      | Simultaneous requests cannot overbook inventory       |

---

## API Documentation

### Authentication

```
POST /api/auth/login         # Login with email/password → JWT token
GET  /api/auth/me            # Get current user profile [Auth]
```

### Customers

```
POST /api/customers          # Create customer [Auth, SALES_USER|ADMIN]
GET  /api/customers          # List all customers [Auth]
GET  /api/customers/:id      # Get customer by ID [Auth]
```

### Enquiries

```
POST /api/enquiries          # Create enquiry with items [Auth, SALES_USER|ADMIN]
GET  /api/enquiries          # List all enquiries [Auth]
GET  /api/enquiries/:id      # Get enquiry by ID [Auth]
```

### Quotations

```
POST  /api/quotations              # Create quotation [Auth, SALES_USER|ADMIN]
GET   /api/quotations              # List all quotations [Auth]
GET   /api/quotations/:id          # Get quotation by ID [Auth]
PATCH /api/quotations/:id/status   # Update status (DRAFT→SENT→ACCEPTED/REJECTED) [Auth]
POST  /api/quotations/:id/convert  # Convert accepted quotation to Sales Order [Auth]
```

### Sales Orders

```
GET   /api/sales-orders              # List all orders [Auth]
GET   /api/sales-orders/:id          # Get order by ID [Auth]
POST  /api/sales-orders/:id/confirm  # Confirm & reserve inventory [Auth, ADMIN]
POST  /api/sales-orders/:id/dispatch # Process dispatch [Auth, ADMIN]
PATCH /api/sales-orders/:id/cancel   # Cancel order [Auth, ADMIN]
```

### Inventory

```
GET   /api/inventory                  # List all inventory [Auth]
GET   /api/inventory/:productId       # Get product inventory [Auth]
PATCH /api/inventory/:productId       # Update physical quantity [Auth, ADMIN]
```

### Health Check

```
GET /api/health              # API status check
```

---

## Key Business Rules

1. **Passwords** are stored as bcrypt hashes, never plaintext
2. **All APIs** are protected by JWT authentication
3. **Role-based access** is enforced on the backend (not just frontend)
4. **Quotation amounts** are calculated by the backend — never trusted from frontend
5. **Status transitions** are enforced: DRAFT → SENT → ACCEPTED/REJECTED
6. **Only ACCEPTED** quotations can be converted to Sales Orders
7. **One quotation** = one Sales Order (duplicate prevention via unique constraint)
8. **Available stock** = Physical - Reserved
9. **Inventory reservation** uses PostgreSQL row-level locking (`SELECT ... FOR UPDATE`)
10. **Concurrent reservations** are handled atomically to prevent overbooking
11. **Dispatch** decreases both physical and reserved quantities
12. **Cancelled orders** release reserved stock back to available

---

## Database Entities

```
users → customers → enquiries → enquiry_items → products → inventory
                 → quotations → quotation_items
                 → sales_orders → sales_order_items
                 → dispatches
```

All relationships enforced through foreign keys with proper constraints.

---

## Environment Variables

| Variable        | Description                        | Default                   |
| --------------- | ---------------------------------- | ------------------------- |
| `DATABASE_URL`  | PostgreSQL connection string       | Required                  |
| `JWT_SECRET`    | Secret key for JWT signing         | Required for production   |
| `JWT_EXPIRES_IN`| Token expiration time              | `24h`                     |
| `PORT`          | Backend server port                | `3000`                    |
| `NODE_ENV`      | Environment (development/production)| `development`            |
| `CORS_ORIGIN`   | Allowed frontend origin            | `http://localhost:5173`   |

---

## Author

**Harini Vutukuru**

PERN Full-Stack Technical Case Study
