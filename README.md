# Persija Jakarta Company Profile API

A learning project to build a REST API with Express for Persija Jakarta's company profile.

## About This Project

This is my first project using Object-Oriented Programming (OOP) paradigm. The main focus is learning OOP concepts through building a structured API with classes for controllers, services, repositories, and more.

## Tech Stack

- TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Zod Validation
- Argon2 Password Hashing
- Multer File Upload

## Setup

1. Install dependencies: `npm install`
2. Setup `.env`:
   ```
   DATABASE_URL="postgresql://..."
   DIRECT_URL="postgresql://..."
   JWT_SECRET="your-secret"
   NODE_ENV="development"
   PORT=8080
   ```
3. Run migrations: `npm run prisma:migrate`
4. Generate Prisma: `npm run prisma:generate`
5. Run dev: `npm run dev`

## API Documentation

### Auth

- `POST /api/auth/register` - Register user (email, firstName, lastName, password, role)

### Root

- `GET /` - Server status

### Planned Endpoints

- User management (CRUD)
- Post management (news/articles)
- Players management
- Staff management
- Contact form

## Database Models

- User (admin/user roles)
- Post (news with categories)
- Players (football players)
- Staff (team staff)
- ContactForm (inquiries)

## Scripts

- `npm run dev` - Development
- `npm start` - Production
- `npm run prisma:studio` - Database GUI
