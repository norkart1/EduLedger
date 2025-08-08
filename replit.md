# Student Banking System

## Overview

This is a full-stack student banking management system built with React, Express.js, PostgreSQL, and TypeScript. The application provides two main intvgvgggerfaces: a student portal for account registration and balance viewing, and an admin portal for managing student accounts, processing transactions, and generating reports. The system handles basic banking operations including deposits, withdrawals, and transaction history tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, built using Vite for fast development and optimized builds
- **UI Library**: Shadcn/ui components built on Radix UI primitives for accessible, consistent design
- **Styling**: Tailwind CSS with custom CSS variables for theming support (light/dark modes)
- **State Management**: Zustand for authentication state persistence with local storage
- **Data Fetching**: TanStack Query (React Query) for server state management with caching and optimistic updates
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **Database ORM**: Drizzle ORM with PostgreSQL for type-safe database operations
- **File Handling**: Multer middleware for profile image uploads with local file storage
- **Authentication**: Session-based authentication with bcrypt password hashing
- **API Design**: RESTful API structure with JSON responses and comprehensive error handling
- **Development**: Hot module replacement with Vite integration for seamless full-stack development

### Database Design
- **Students Table**: Core entity storing account information, balances, and profile data
- **Transactions Table**: Financial transaction records with type, amount, and balance tracking
- **Admins Table**: Administrative user accounts with hashed password storage
- **Relationships**: One-to-many between students and transactions with foreign key constraints

### Security & Validation
- **Input Validation**: Zod schemas for both client and server-side validation
- **Password Security**: Bcrypt hashing with salt rounds for admin authentication
- **File Upload Security**: Image-only filtering with size limits and secure file naming
- **Type Safety**: End-to-end TypeScript coverage with shared schema definitions

### Business Logic
- **Account Management**: Automatic account number generation and balance tracking
- **Transaction Processing**: Atomic operations ensuring balance consistency
- **Analytics**: Real-time calculations for total balances, account counts, and transaction metrics
- **Reporting**: PDF and Excel report generation for administrative oversight

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **Drizzle Kit**: Database migration and schema management tooling

### UI & Styling
- **Radix UI**: Comprehensive collection of accessible React components
- **Tailwind CSS**: Utility-first CSS framework with JIT compilation
- **Lucide React**: Consistent icon library for user interface elements

### Development Tools
- **Vite**: Fast build tool with HMR and optimized production builds
- **TypeScript**: Static type checking across the entire application stack
- **ESBuild**: Fast JavaScript bundler for server-side code compilation

### File & Document Processing
- **Multer**: Express middleware for handling multipart/form-data file uploads
- **PDFKit**: JavaScript library for programmatic PDF document generation
- **XLSX**: Library for Excel spreadsheet creation and data export

### Utility Libraries
- **Date-fns**: Modern date utility library for transaction timestamp formatting
- **Class Variance Authority**: Utility for creating type-safe component variants
- **CLSX**: Conditional className utility for dynamic styling