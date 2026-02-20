# Frontend Routes

| Route                | Page           | Description                                                        |
| -------------------- | -------------- | ------------------------------------------------------------------ |
| `/`                  | Landing       | Marketing landing page (when not authenticated)                    |
| `/login`             | Login         | Sign in                                                            |
| `/register`         | Register      | Create account and profile                                         |
| `/discovery`        | Discovery     | Browse and discover study partners (protected)                    |
| `/matches`          | Matches       | View and manage match requests (protected)                        |
| `/messages`         | Messages      | Conversations list; empty state with “Go to Matches” if none (protected) |
| `/messages/:chatId` | Chat          | Individual chat thread; `chatId` is the **other user’s ID** (protected) |
| `/profile`           | Profile       | View and edit your profile (protected)                            |

The app also includes a Landing Page component with hero section, feature cards, social proof, stats, and a call-to-action footer. Real-time messaging uses Socket.io (see [API](api.md#socketio)).
