# API Endpoints

## Authentication (`/auth`)

| Method | Route              | Description                                       | Auth |
| ------ | ------------------ | ------------------------------------------------- | ---- |
| POST   | `/auth/register`   | Register a new user with email, password, and name | No   |
| POST   | `/auth/login`      | Login and receive a JWT token                      | No   |

## Profile (`/profile`)

| Method | Route       | Description                                  | Auth |
| ------ | ----------- | -------------------------------------------- | ---- |
| PUT    | `/profile`  | Update major, bio, and study habits          | Yes  |

## Discovery (`/discovery`)

| Method | Route         | Description                                                    | Auth |
| ------ | ------------- | -------------------------------------------------------------- | ---- |
| GET    | `/discovery`  | List all users excluding self and anyone already matched with  | Yes  |

## Matches (`/matches`)

| Method | Route                | Description                                    | Auth |
| ------ | -------------------- | ---------------------------------------------- | ---- |
| POST   | `/matches`           | Initiate a match request with another user     | Yes  |
| GET    | `/matches`           | Get all matches (sent and received)            | Yes  |
| PUT    | `/matches/:id/accept`| Accept a pending match (receiver only)         | Yes  |
| PUT    | `/matches/:id/reject`| Reject a pending match (receiver only)         | Yes  |

## Other

| Method | Route    | Description                 | Auth |
| ------ | -------- | --------------------------- | ---- |
| GET    | `/`      | API info                    | No   |
| GET    | `/health`| Liveness (process alive)    | No   |
| GET    | `/ready` | Readiness (DB check); 503 if DB down | No   |
| GET    | `/metrics` | Prometheus metrics         | No   |
| GET    | `/users` | List all users with profiles| Yes  |
