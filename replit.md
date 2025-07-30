# MoodTune 2.0 - Mood Tracking Application

## Overview

MoodTune is a modern mood tracking web application built with React frontend, Express backend, and PostgreSQL database. The application allows users to track their emotional states through interactive mood sliders and quick mood buttons, visualize their mood through dynamic color representations, and analyze their mood patterns over time.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (TanStack Query) for server state, React hooks for local state
- **UI Framework**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured via Drizzle config)
- **API Style**: RESTful API endpoints
- **Session Management**: In-memory storage for development (extensible to database storage)

### Project Structure
```
├── client/          # Frontend React application
├── server/          # Backend Express application
├── shared/          # Shared TypeScript types and schemas
├── migrations/      # Database migration files
└── attached_assets/ # Additional project documentation
```

## Key Components

### Frontend Components
1. **MoodSlider**: Interactive sliders for happiness and calmness levels (0-100 scale)
2. **QuickMoodButtons**: Preset mood buttons with emoji representations
3. **ColorDisplay**: Dynamic color visualization based on mood with breathing animation
4. **MoodHistory**: Recent mood entries display with timestamps
5. **Analytics**: Mood trend visualization and statistics

### Backend Services
1. **Storage Layer**: Abstracted storage interface supporting both in-memory and database persistence
2. **Mood Entry Management**: CRUD operations for mood tracking data
3. **API Routes**: RESTful endpoints for mood entry operations

### Data Models
- **User**: Basic user information with username/password
- **MoodEntry**: Comprehensive mood data including:
  - Happiness and calmness levels (0-100)
  - Color representation (hex, HSL, HSL components)
  - Optional quick mood selection
  - Notes and timestamps

## Data Flow

1. **Mood Input**: Users interact with sliders or quick mood buttons
2. **Color Calculation**: Real-time color generation based on mood coordinates using HSL color space
3. **Visual Feedback**: Immediate color display with breathing animation
4. **Data Persistence**: Mood entries saved to database with full color and mood metadata
5. **History Display**: Recent entries retrieved and displayed with visual indicators
6. **Analytics**: Aggregated mood data presented through charts and trends

### Color Algorithm
The application uses a sophisticated mood-to-color mapping:
- **Quadrant-based hue calculation**: Different hue ranges for happy/sad and calm/energetic combinations
- **Dynamic saturation**: Based on emotional intensity
- **Adaptive lightness**: Reflects overall mood positivity

## External Dependencies

### Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **wouter**: Lightweight routing
- **date-fns**: Date formatting and manipulation
- **class-variance-authority**: Component variant management
- **tailwindcss**: Utility-first CSS framework

### Backend Libraries
- **drizzle-orm**: Type-safe SQL query builder
- **@neondatabase/serverless**: PostgreSQL serverless driver
- **zod**: Runtime type validation
- **express**: Web application framework

### Development Tools
- **vite**: Fast build tool and dev server
- **typescript**: Type safety across the stack
- **drizzle-kit**: Database schema management and migrations

## Deployment Strategy

### Development Environment
- **Vite Dev Server**: Hot module replacement for frontend development
- **Express Server**: Backend API with automatic TypeScript compilation via tsx
- **Database**: PostgreSQL with connection via DATABASE_URL environment variable

### Production Build
1. **Frontend**: Vite builds optimized static assets to `dist/public`
2. **Backend**: esbuild bundles server code to `dist/index.js`
3. **Database**: Drizzle migrations ensure schema consistency
4. **Static Serving**: Express serves built frontend assets in production

### Environment Configuration
- **NODE_ENV**: Controls development vs production behavior
- **DATABASE_URL**: PostgreSQL connection string
- **Replit Integration**: Special handling for Replit development environment

### Database Management
- **Schema Definition**: Centralized in `shared/schema.ts`
- **Migrations**: Generated and applied via Drizzle Kit
- **Connection**: Serverless-compatible PostgreSQL driver for scalability

The application follows modern web development practices with type safety, component-based architecture, and clear separation of concerns between frontend, backend, and data layers.