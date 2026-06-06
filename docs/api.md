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

## Messages (`/messages`)

| Method | Route                                    | Description                                                                 | Auth |
| ------ | ---------------------------------------- | --------------------------------------------------------------------------- | ---- |
| GET    | `/messages/conversations`                | List conversations (accepted matches) with last message and unread count  | Yes  |
| GET    | `/messages/conversations/:otherUserId`   | Get message history with that user                                         | Yes  |
| PUT    | `/messages/conversations/:otherUserId/read` | Mark all messages from that user to current user as read                 | Yes  |
| DELETE | `/messages/conversations/:otherUserId`       | Clear chat: delete all messages in this conversation (both users)      | Yes  |

## Socket.io

Connect with `auth: { token: "<accessToken>" }`. Events:

| Direction   | Event            | Payload / Description                                                                 |
| ----------- | ----------------- | ------------------------------------------------------------------------------------- |
| Client → Server | `send_message`    | `{ receiverId, content }` — send a message (only to accepted matches).                |
| Server → Client | `message_sent`    | Saved message `{ id, content, senderId, receiverId, createdAt, readAt }` (to sender). |
| Server → Client | `new_message`     | Same payload (to receiver).                                                            |
| Client → Server | `typing_start`    | `{ otherUserId }`.                                                                    |
| Client → Server | `typing_stop`     | `{ otherUserId }`.                                                                    |
| Server → Client | `user_typing`     | `{ userId }` — other user started typing.                                              |
| Server → Client | `user_stopped_typing` | `{ userId }` — other user stopped.                                                 |
| Client → Server | `mark_read`      | `{ otherUserId }` — mark all messages from that user as read; server emits `message_read` to sender. |
| Server → Client | `message_read`   | `{ readerId, conversationPartnerId }` — messages were read by the other user.          |

## Other

| Method | Route    | Description                 | Auth |
| ------ | -------- | --------------------------- | ---- |
| GET    | `/`      | API info                    | No   |
| GET    | `/health`| Liveness (process alive)    | No   |
| GET    | `/ready` | Readiness (DB check); 503 if DB down | No   |
| GET    | `/metrics` | Prometheus metrics         | No   |
| GET    | `/users` | List all users with profiles| Yes  |
