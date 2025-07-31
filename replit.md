# MoodTune 2.0 - Mood Tracking Application

## Overview

MoodTune 2.0 is a comprehensive mood tracking web application with social features, built with React frontend, Express backend, and PostgreSQL database. The application combines personal mood tracking with community interaction, offering dual-axis mood tracking, music recommendations, real-time global emotion sharing, anonymous messaging system, and community statistics. Users can track emotions, discover music based on mood, connect with others globally, and access mood analytics with color therapy visualization.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- July 31, 2025: Successfully completed migration from Replit Agent to Replit environment
- Created PostgreSQL database with proper connection and schema setup
- Implemented full Chinese (Traditional) interface with healing philosophy
- Added therapeutic welcome page with MoodTune's healing philosophy
- Integrated sage, lavender, beige, and dusty-rose color themes for calming UI
- Added sample data including Chinese mood entries, emotion messages, and music recommendations
- Updated navigation and component text to Chinese with focus on emotional comfort
- Enhanced therapy-focused design following "comfort without comparison" philosophy
- Fixed music recommendation functionality with real YouTube and Spotify URLs for authentic streaming
- Enhanced music recommendation UI layout to prevent text overflow and improve readability
- Added integrated music playback functionality to color therapy sessions with mood-based recommendations
- Implemented smart music type mapping for therapy sessions (calm, energetic, peaceful)
- All core features fully functional: mood tracking, analytics, music recommendations, global emotion wall, color therapy with music
- Application successfully running on port 5000 with complete Chinese localization and working music streaming

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
2. **QuickMoodButtons**: Preset mood buttons with emoji representations and anonymous sharing option
3. **ColorDisplay**: Dynamic color visualization based on mood with breathing animation
4. **MoodHistory**: Recent mood entries display with timestamps
5. **Analytics**: Mood trend visualization and statistics
6. **MusicRecommendations**: Mood-based music suggestions with Spotify/YouTube links
7. **GlobalEmotionWall**: Real-time global mood sharing and community interaction
8. **EmotionStatistics**: Community engagement metrics and connection statistics

### Backend Services
1. **Storage Layer**: PostgreSQL database with Drizzle ORM for persistent data storage
2. **Mood Entry Management**: CRUD operations for mood tracking data with anonymous sharing
3. **Music Recommendation System**: Mood-based song suggestions with external music platform links
4. **Global Emotion Wall**: Community mood sharing and interaction features
5. **Anonymous Messaging**: Support message system with engagement tracking
6. **API Routes**: RESTful endpoints for all application operations

### Data Models
- **User**: Basic user information with username/password
- **MoodEntry**: Comprehensive mood data including:
  - Happiness and calmness levels (0-100)
  - Color representation (hex, HSL, HSL components)
  - Optional quick mood selection
  - Notes and timestamps
  - Anonymous sharing capability
  - Geographic location (country/city)
- **EmotionMessage**: Anonymous support messages with:
  - Message content and timestamps
  - Support/like count tracking
  - Mood entry associations
- **MusicRecommendation**: Music suggestions with:
  - Track and artist information
  - Genre and mood type classification
  - External platform links (Spotify, YouTube)

## Data Flow

1. **Mood Input**: Users interact with sliders or quick mood buttons
2. **Color Calculation**: Real-time color generation based on mood coordinates using HSL color space
3. **Visual Feedback**: Immediate color display with breathing animation
4. **Data Persistence**: Mood entries saved to database with full color and mood metadata
5. **History Display**: Recent entries retrieved and displayed with visual indicators
6. **Analytics**: Aggregated mood data presented through charts and trends
7. **Music Discovery**: Mood-based music recommendations with external links
8. **Community Sharing**: Anonymous mood sharing to global emotion wall
9. **Support System**: Anonymous messaging with community engagement tracking

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