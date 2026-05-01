# SkillMap - Technical Architecture

## Overview

SkillMap is an AI-powered, personalized learning path generator and tracker. It creates custom curricula based on user goals and tracks progress through a modern, intuitive interface. The system uses local LLM inference (via Ollama) for curriculum generation and provides a rich, interactive study experience with contextual focus sessions.

---

## System Architecture

### High-Level Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React + Vite)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│  │   Clerk     │  │   Redux     │  │   Router    │  │   Tailwind CSS  │   │
│  │  Auth       │  │   Store     │  │   DOM       │  │   Styling       │   │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘  └─────────────────┘   │
│         │                │                                                    │
│         └────────────────┴─────────────────────────────────┐                │
│                          │                                  │                │
│                    ┌─────▼────────┐                    ┌───▼──────────┐    │
│                    │  API Client  │                    │ Global Timer │    │
│                    │  (REST)      │                    │   Widget     │    │
│                    └─────┬────────┘                    └──────────────┘    │
└──────────────────────────┼──────────────────────────────────────────────────┘
                           │
                           │ HTTPS (Authenticated)
                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (Express + Node.js)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│  │   Clerk     │  │  Express    │  │  MongoDB    │  │   Ollama         │   │
│  │  Middleware │  │  Routes     │  │  (Mongoose) │  │   (Local LLM)    │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|-------------|---------|---------|
| React | 19.x | UI Framework |
| Vite | 7.x | Build tool & dev server |
| React Router DOM | 7.x | Client-side routing |
| Redux Toolkit | 2.x | Global state management (Timer) |
| React Redux | 9.x | React bindings for Redux |
| Tailwind CSS | 4.x | Utility-first CSS framework |
| Clerk | 5.x | Authentication (OAuth) |
| Lucide React | 0.5.x | Icon library |
| Canvas Confetti | 1.x | Celebration animations |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | LTS | Runtime |
| Express | 5.x | Web framework |
| Mongoose | 9.x | MongoDB ODM |
| Clerk Express | 1.x | Auth middleware |
| Ollama | Latest | Local LLM inference |
| Qwen3:8b | Latest | LLM Model (replaced DeepSeek-R1) |

### Database

- **MongoDB**: Document store for learning plans, subtopics, and user progress
- **Collections**: `learningplans`, `users` (optional sync)

---

## Frontend Architecture

### Directory Structure

```
src/
├── api/                  # API client layer
│   ├── client.ts         # API interface definitions
│   ├── httpClient.ts     # HTTP implementation
│   ├── mockClient.ts     # Dev/mock implementation
│   ├── index.ts          # Export of configured client
│   ├── progress.ts       # Progress/completion API
│   ├── journey.ts       # Journey save/update API
│   └── learningPlans.ts  # Plan CRUD API
├── components/           # Reusable UI components
│   ├── ui/               # Generic UI (Buttons, Modals, etc.)
│   ├── dashboard/        # Dashboard-specific components
│   ├── journey/          # Journey editor components
│   ├── insights/         # Analytics charts
│   ├── social/           # Social features
│   └── auth/             # Auth components
├── screens/              # Page-level components
│   ├── SkillDashboard.tsx   # Home/dashboard
│   ├── ViewJourney.tsx      # Journey editor
│   ├── SessionMode.tsx      # Standalone timer page (legacy)
│   └── LoginScreen.tsx      # Auth entry
├── state/                # State management
│   ├── store.ts          # Redux store configuration
│   ├── timerSlice.ts     # Timer state slice
│   └── AppDataProvider.tsx  # Context for app data (toasts, plans)
├── hooks/               # Custom React hooks
├── config/              # Environment configs
├── types/               # TypeScript type definitions
└── utils/               # Helper functions
```

### State Management

**1. Redux (Global Timer State)**

The timer state is managed via Redux Toolkit to ensure the timer persists across route changes and remains accessible globally.

```typescript
// State Shape
interface TimerState {
  isActive: boolean;
  isExpanded: boolean;
  timeRemaining: number;
  initialDuration: number;
  activePlanId: string | null;
  activeSubtopicId: string | null;
  activeTopicData: PlanSubtopic | null;
}

// Actions
- startFocus: Initiates a focus session with plan/topic context
- tick: Decrements timer every second
- pauseFocus / resumeFocus: Toggle timer state
- stopFocus: Ends session and clears state
- toggleExpanded: Shows/hides the expanded timer widget
```

**2. React Context (AppDataProvider)**

For UI state like active plan ID, progress snapshots, toast notifications, and user preferences.

### Key Features Implementation

**1. Global Timer Widget**

A floating "Dynamic Island" style widget that persists across the entire app. Located at the bottom-center of the screen.

- **Mini State**: Shows countdown, topic name, progress ring
- **Expanded State**: Shows full timer, resources list, Play/Pause/Complete controls
- **Auto-Save Completion**: When "Complete" is clicked, fires API call and dispatches `plan-updated` event to refresh UI
- **Confetti**: Canvas confetti celebration on completion

**2. Auto-Save System**

Implemented on the Journey screen for structural edits (renaming, reordering, changing hours).

- **Debounce**: 1.5s delay after last keystroke before triggering save
- **Status Indicator**: Shows "Unsaved changes..." → "Saving..." → "Saved" → "Failed to save"
- **API Integration**: PUT `/api/v1/learning-plans/:planId` to persist full plan
- **Safety**: Browser `beforeunload` event warns if unsaved changes are syncing

**3. Command Palette**

Accessible via `Cmd/Ctrl + K`. Provides quick navigation and actions.

### API Client Architecture

The API client follows the Adapter pattern with pluggable implementations:

```typescript
interface ApiClient {
  get<TResponse>(path: string, options?: ApiRequestOptions): Promise<TResponse>;
  post<TBody, TResponse>(path: string, body: TBody, options?: ApiRequestOptions): Promise<TResponse>;
  put<TBody, TResponse>(path: string, body: TBody, options?: ApiRequestOptions): Promise<TResponse>;
  patch<TBody, TResponse>(path: string, body: TBody, options?: ApiRequestOptions): Promise<TResponse>;
}
```

- **Feature Flags**: `useMockApi` flag in config switches between HTTP and Mock clients for development
- **Auth**: Automatically attaches Clerk JWT tokens to requests

---

## Backend Architecture

### Directory Structure

```
server/src/
├── index.ts           # Entry point, server setup
├── app.ts             # Express app configuration
├── config/            # Environment & DB config
├── controllers/       # Request handlers
│   └── learningPlanController.ts
├── routes/            # Express route definitions
│   └── learningPlanRoutes.ts
├── services/          # Business logic
│   ├── learningPlanService.ts
│   └── aiService.ts   # Ollama integration
├── models/            # Mongoose schemas
│   └── LearningPlan.ts
└── utils/             # Helpers (prompt engineering, etc.)
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/learning-plans/generate` | Generate new curriculum via LLM |
| GET | `/api/v1/learning-plans` | List all user plans |
| GET | `/api/v1/learning-plans/:planId` | Get single plan |
| PUT | `/api/v1/learning-plans/:planId` | Update plan (save edits) |
| PATCH | `/api/v1/learning-plans/:planId/subtopics/:topicId/toggle` | Toggle topic completion |

### LLM Integration

The backend communicates with a local Ollama instance for curriculum generation.

- **Model**: Qwen3:8b (replaced DeepSeek-R1 for faster response)
- **Endpoint**: `http://localhost:11434/api/generate`
- **JSON Enforcement**: Uses Ollama's `format: 'json'` parameter
- **System Prompt**: Carefully crafted prompt instructs the LLM to output a specific JSON structure with course name and subtopics array

**Response Schema:**
```json
{
  "courseName": "string",
  "subtopics": [
    {
      "title": "string",
      "description": "string",
      "estimatedHours": number,
      "resources": [{ "title": "string", "type": "video|article|documentation|course", "url": "string" }]
    }
  ]
}
```

---

## Data Models

### MongoDB Schema: LearningPlan

```typescript
{
  _id: ObjectId,
  userId: string,          // Clerk User ID
  courseName: string,
  subtopics: [{
    id: string (UUID),
    title: string,
    description: string,
    isCompleted: boolean,
    estimatedHours: number,
    resources: [{
      title: string,
      type: string,
      url: string
    }]
  }],
  totalTopics: number,
  completedTopics: number,
  estimatedTotalHours: number,
  createdAt: Date,
  updatedAt: Date
}
```

### Frontend Types

```typescript
interface LearningPlan {
  id: string;
  courseName: string;
  dateCreated: string;
  totalTopics: number;
  completedTopics: number;
  estimatedTotalHours: number;
  subtopics: PlanSubtopic[];
}

interface PlanSubtopic {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  estimatedHours: number;
  resources?: LearningResource[];
}
```

---

## Security & Authentication

### Authentication Flow

1. **Frontend**: Clerk SDK handles OAuth sign-in (Google, GitHub, etc.)
2. **Token Management**: Clerk session tokens are retrieved via `Clerk.session.getToken()`
3. **Backend Middleware**: `@clerk/express` middleware validates JWT on every request
4. **Data Isolation**: All queries filter by `userId` from the authenticated token

### Environment Variables

**Frontend (.env):**
```
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

**Backend (.env):**
```
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/skillmap
OLLAMA_API_URL=http://localhost:11434
CLERK_SECRET_KEY=sk_test_...
```

---

## User Flows

### 1. Generate a Learning Plan
1. User clicks "Add Goal" (FAB) on Dashboard
2. Modal opens with topic input
3. User enters topic (e.g., "React Native")
4. Backend calls Ollama → Qwen3:8b generates curriculum
5. Plan saved to MongoDB, user redirected to Journey screen

### 2. Start a Focus Session
1. User clicks "Start 25-min session" on Dashboard or Journey
2. Redux action `startFocus` dispatched with planId, subtopicId, topicData
3. Global Timer Widget appears at bottom-center
4. Timer counts down, progress ring animates
5. User can click widget to expand and see resources

### 3. Complete a Topic (from Timer)
1. User studies via resources in expanded timer
2. Clicks "Complete" button
3. API call to toggle subtopic completion
4. Confetti animation fires
5. `plan-updated` event dispatched
6. Dashboard and Journey screens auto-refresh
7. Timer widget closes

### 4. Edit Journey (Auto-Save)
1. User renames/changes hours/reorders topics in Journey
2. UI shows "Unsaved changes..." indicator
3. After 1.5s of inactivity, auto-save triggers
4. PUT request to `/learning-plans/:id` with updated plan
5. Status updates to "Saved" with checkmark

---

## Design System

### Color Palette (CSS Variables)

```css
--color-bg: #f2f1ec;              /* Background */
--color-surface: #ffffff;         /* Cards */
--color-text: #181d1a;             /* Primary text */
--color-text-muted: #596362;       /* Secondary text */
--color-accent: #1f3b2c;          /* Brand green */
--color-success: #2d6a4f;          /* Completion green */
--color-success-hover: #1b4332;   /* Success hover state */
--color-warning: #bc6c25;          /* Warnings */
--color-error: #9b2c2c;           /* Errors */
```

### Typography

- **Font**: Inter (with SF Pro fallback)
- **Scale**: Display → Heading → Subheading → Body → Caption → Overline

### Component Patterns

- **Glass Cards**: Used for content containers with backdrop blur
- **Buttons**: Primary (accent), Secondary (outline), Ghost (text-only)
- **Loading**: Skeleton shimmer animations
- **Empty States**: Illustrated with call-to-action

---

## Performance & Optimizations

1. **Debounced Auto-Save**: Prevents excessive API calls during editing
2. **Optimistic Updates**: UI updates immediately, then syncs to server
3. **Global Timer**: Timer state in Redux prevents re-renders on navigation
4. **Lazy Loading**: Vite handles code splitting automatically
5. **Redis/Cache**: Not currently used (future enhancement for LLM caching)

---

## Future Enhancements

1. **LLM Response Caching**: Cache generated plans to avoid redundant Ollama calls
2. **Offline Support**: Service worker for offline journey editing
3. **Analytics Dashboard**: Detailed time-tracking insights per topic
4. **Spaced Repetition**: Algorithm to suggest review topics
5. **Collaboration**: Share learning plans with peers
6. **Mobile App**: React Native wrapper for mobile experience

---

## Known Limitations

1. **Single Plan Focus**: Currently defaults to first plan on dashboard
2. **Local LLM Dependency**: Requires Ollama running locally; no cloud fallback
3. **No Versioning**: Edits overwrite previous state (no undo/redo)
4. **Mock API**: Frontend can run with mock data for development without backend

---

## Development Commands

**Frontend:**
```bash
npm run dev      # Start Vite dev server
npm run build    # Production build
npm run lint     # ESLint checks
```

**Backend:**
```bash
cd server
npm run dev      # Start Express + nodemon
npm run build    # TypeScript compilation
```

**Ollama:**
```bash
ollama run qwen3:8b    # Ensure model is loaded
```

---

*Last Updated: May 2026*