# Backend Integration Checklist

Use this when switching from mock APIs to real backend services.

## 1) Environment and feature flags

- [ ] Set `VITE_USE_MOCK_API=false`
- [ ] Set `VITE_API_BASE_URL=https://<api-domain>`
- [ ] Keep `VITE_ENABLE_INSIGHTS` and `VITE_ENABLE_EXPORT` as desired
- [ ] Verify `VITE_CLERK_PUBLISHABLE_KEY` is valid for the target env

## 2) Auth token forwarding

- [ ] Read Clerk session token on each request
- [ ] Attach `Authorization: Bearer <token>` in `httpClient`
- [ ] Validate token server-side and map Clerk user id -> application user id

## 3) Endpoint parity

- [ ] Implement all endpoints listed in `docs/frontend-api-contract.md`
- [ ] Keep payload keys and enum values exactly aligned
- [ ] Return typed error shape for all non-2xx responses

## 4) Data integrity and optimistic updates

- [ ] Enforce idempotency for toggle operations
- [ ] Return updated server truth after each mutation
- [ ] Handle race conditions for rapid user actions
- [ ] Confirm rollback paths are triggered on 4xx/5xx errors

## 5) Pagination and scale readiness

- [ ] Add pagination to skills and plans if counts grow
- [ ] Include `page`, `limit`, `total` metadata when paginated
- [ ] Keep existing sort/filter parameters backend-compatible

## 6) Observability and operations

- [ ] Add API request logging and correlation ids
- [ ] Add error monitoring for failed generation/toggle/save flows
- [ ] Track latency budgets for plan generation and dashboard load

## 7) Verification steps

- [ ] `npm run build` passes in frontend with mock mode off
- [ ] Happy path: login -> dashboard -> generate plan -> journey edits -> save
- [ ] Failure path: backend error returns user-friendly toast and retry actions
- [ ] Export toggles still function with feature flags enabled
