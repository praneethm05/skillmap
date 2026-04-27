# SkillMap Backend Architecture & Implementation Guide

## 1. Executive Summary
SkillMap is a highly personalized, AI-driven learning tracker that generates structured learning paths. The backend serves as the core orchestration layer, managing user data, learning plans, and the intelligent generation of curriculum via a locally hosted Large Language Model (LLM).

This document outlines the architectural decisions, design patterns, and technical specifications required to build the backend as a robust, scalable, and maintainable enterprise-grade Node.js application.

---

## 2. Core Architectural Principles
Our implementation adheres to the following principles, standard in high-performing engineering teams:

*   **Separation of Concerns (N-Tier Layered Architecture):** We decouple the HTTP routing (Controllers) from the core business logic (Services) and database operations (Data Access/Repositories).
*   **Strong Typing & Contracts:** TypeScript is strictly enforced. Frontend domain types dictate backend responses to ensure end-to-end type safety.
*   **Predictable AI Integration:** LLM outputs are inherently non-deterministic. We enforce strict JSON schema outputs via the Ollama API and implement runtime validation (using Zod or equivalent) before persisting AI-generated data.
*   **Security by Design:** All routes containing PII or proprietary user data are secured via Clerk authentication. We adhere to the Principle of Least Privilege.
*   **Fail-Gracefully (Resilience):** When integrating with local LLMs, we implement timeout configurations and retry mechanisms.

---

## 3. Technology Stack
*   **Runtime:** Node.js (LTS)
*   **Framework:** Express.js
*   **Language:** TypeScript
*   **Database:** MongoDB (using Mongoose ODM for schema validation and lifecycle hooks)
*   **Authentication:** Clerk Backend SDK (`@clerk/express`)
*   **AI Inference:** Local Ollama Server running `deepseek-r1:8b`

---

## 4. System Architecture & Directory Structure
The `server/src` directory is organized by technical concern rather than feature domain, to prevent circular dependencies in a monolithic Node.js app:

```text
server/src/
├── config/         # Environment variables, DB connection, third-party client configs
├── controllers/    # Express route handlers (Extracting req/res, passing to Services)
├── services/       # Core business logic (e.g., AiGenerationService, PlanService)
├── models/         # Mongoose Schemas (Data Layer definitions)
├── routes/         # API endpoint definitions and middleware attachment
├── middleware/     # Auth checks, global error handling, payload validation
├── types/          # Shared interfaces (mirrored from frontend)
└── utils/          # Helper functions, logger, prompt engineering templates
```

### The Request Lifecycle
1.  **Route (`routes/`)**: Receives the HTTP request.
2.  **Middleware (`middleware/`)**: Validates the Clerk JWT; attaches `userId` to the request.
3.  **Controller (`controllers/`)**: Parses the `req.body`, calls the appropriate Service.
4.  **Service (`services/`)**: Executes the heavy lifting (e.g., talks to Ollama, formats data).
5.  **Model (`models/`)**: Interacts with MongoDB.
6.  **Controller**: Formats the final response and sends the HTTP status.

---

## 5. Database Design (MongoDB)
We optimize for read-heavy operations, as users view their dashboard far more often than they generate new plans.

### Collection 1: `Users` (Optional sync from Clerk webhooks)
*   `_id`: String (Clerk User ID)
*   `email`: String
*   `createdAt`: Date

### Collection 2: `LearningPlans`
*   `_id`: ObjectId
*   `userId`: String (Indexed)
*   `courseName`: String
*   `estimatedTotalHours`: Number
*   `dateCreated`: Date
*   `topics`: Array of `Topics` (Embedded Documents to avoid expensive JOINs/populate calls)
    *   `id`: String (UUID)
    *   `title`: String
    *   `description`: String
    *   `isCompleted`: Boolean
    *   `estimatedHours`: Number
    *   `resources`: Array of `LearningResource` (Embedded)
        *   `title`: String
        *   `type`: String (Enum: 'video', 'article', 'documentation', 'course')
        *   `url`: String

*Design Decision:* Embedding topics within the `LearningPlan` document is highly performant because the maximum size of a plan (e.g., 20-30 topics) will easily fit within MongoDB's 16MB document limit. This allows a single DB query to fetch the entire dashboard state.

---

## 6. API Specification
All endpoints are prefixed with `/api/v1`.

### `POST /api/v1/learning-plans/generate`
*   **Purpose:** Triggers the AI pipeline to generate a new curriculum.
*   **Auth Required:** Yes
*   **Payload (`LearningGoalInput`):**
    ```json
    { "topic": "React Native", "currentLevel": "beginner", "weeklyHours": 10 }
    ```
*   **Response (`201 Created`):** Returns the fully constructed `LearningPlan` object (as defined in frontend domain types).

### `GET /api/v1/learning-plans`
*   **Purpose:** Fetches all active plans for the authenticated user.
*   **Auth Required:** Yes
*   **Response (`200 OK`):** Array of `LearningPlan` objects.

### `PATCH /api/v1/learning-plans/:planId/topics/:topicId/complete`
*   **Purpose:** Toggles the completion status of a specific subtopic.
*   **Auth Required:** Yes
*   **Response (`200 OK`):** Returns the updated `LearningPlan`.

---

## 7. AI Integration Strategy (Ollama + Deepseek-R1)

Integrating with LLMs requires defensive engineering.

1.  **The Local LLM Client:** We use the native `fetch` API to communicate with `http://localhost:11434/api/generate`.
2.  **Structured Output Enforcement:** We utilize Ollama's `format: "json"` parameter. We inject a highly specific, minimal JSON schema into the system prompt to guarantee structural integrity.
3.  **Reasoning Model Handling:** `deepseek-r1:8b` is a reasoning model that often outputs its thought process wrapped in `<think>...</think>` tags before outputting the final JSON. Our `AiService` must include a regex utility to sanitize the raw response string, stripping out the reasoning block before parsing the JSON.
4.  **Resource Link Integrity:** The prompt instructs the LLM to output accurate, generic search queries for the resource URLs (e.g., `https://www.youtube.com/results?search_query=react+native+setup`) rather than hallucinating specific video IDs that might 404.

---

## 8. Local Setup & Execution Guide

### Prerequisites
1.  **MongoDB:** Install MongoDB locally (via Homebrew/Docker) or use MongoDB Atlas (Free Tier).
2.  **Ollama:** Ensure the Ollama app is running locally.
3.  **Model:** Run `ollama run deepseek-r1:8b` in your terminal to ensure the model is loaded.

### Environment Setup
Create a `.env` file in the `server/` directory:
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/skillmap
OLLAMA_API_URL=http://localhost:11434
CLERK_SECRET_KEY=sk_test_...
```

### Running the Server
```bash
cd server
npm install
npm run dev
```

---

## 9. Next Steps for Implementation
1.  Initialize database connection utility (`config/database.ts`).
2.  Create the Mongoose Schema (`models/LearningPlan.ts`).
3.  Build the robust `AiGenerationService` with DeepSeek parsing logic.
4.  Expose the Express Controllers and Routes.
5.  Wire up global error handling middleware to catch unhandled Promise rejections.