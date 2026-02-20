# Testing

- **Backend:** Jest is configured (`backend/package.json`). Run with `npm run test` from the `backend/` directory. Test files are excluded from version control via `.gitignore` (e.g. `*.test.ts`, `*.spec.ts`, `test-results/`, `coverage/`).
- **Frontend:** No test runner or test files are committed. Linting is available via `npm run lint` in `frontend/`.
- **E2E / manual:** Use the deployment guide to run backend and frontend locally, then verify auth, discovery, matches, and real-time messaging (Socket.io) with two users.
