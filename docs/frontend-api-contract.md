# Frontend API Contract

This document defines the frontend-to-backend contract expected by SkillMap.

## Runtime flags

- `VITE_USE_MOCK_API=true`: frontend uses in-memory mock adapter
- `VITE_USE_MOCK_API=false`: frontend uses HTTP client and `VITE_API_BASE_URL`

## Error shape

All non-2xx API responses should follow this shape:

```json
{
  "code": "BAD_REQUEST",
  "message": "Human-readable message",
  "status": 400,
  "fieldErrors": [
    { "field": "topic", "message": "Topic is required" }
  ]
}
```

## Endpoints

### GET `/skills`

Returns dashboard skill overviews.

Response:

```json
[
  {
    "id": "react",
    "name": "React",
    "subtopics": [
      { "id": "jsx", "name": "JSX", "status": "completed" }
    ]
  }
]
```

### PATCH `/skills/:skillId/complete`

Marks all subtopics for a skill as completed.

Response: updated `SkillOverview`.

### GET `/learning-plans/:planId`

Returns a learning plan.

Response:

```json
{
  "id": "journey-1",
  "courseName": "Machine Learning Fundamentals",
  "dateCreated": "2026-01-15",
  "totalTopics": 12,
  "completedTopics": 3,
  "estimatedTotalHours": 40,
  "subtopics": [
    {
      "id": "subtopic-1",
      "title": "Introduction",
      "description": "...",
      "isCompleted": true,
      "estimatedHours": 2
    }
  ]
}
```

### POST `/learning-plans/generate`

Creates a generated plan from user intent.

Request:

```json
{
  "topic": "Machine Learning",
  "currentLevel": "beginner",
  "weeklyHours": 6,
  "targetWeeks": 8
}
```

Response: `LearningPlan`

### PATCH `/learning-plans/:planId/subtopics/:subtopicId/toggle`

Toggles completion for one subtopic.

Request:

```json
{ "isCompleted": true }
```

Response: updated `LearningPlan`

### GET `/users/me`

Returns current user profile linked to auth session.

Response:

```json
{
  "id": "user-1",
  "email": "learner@example.com",
  "displayName": "Learner"
}
```
