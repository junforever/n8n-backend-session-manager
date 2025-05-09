# JWT Backend Session Manager

This project provides a backend service built with Node.js and Express.js, designed to handle authentication, authorization, rate limiting, timeouts, logging, and security. It can serve as a gateway or middleware layer for n8n workflows. The backend is intended to integrate with a chat-based agent (via Telegram and/or WhatsApp) used in n8n.

To avoid maintaining separate agents for business clients and staff members, this backend was created to manage both roles within a single system. When a message is received through the chat, the user’s unique chat ID is sent to this backend to determine whether the user is a staff member or a business client, and the appropriate flow is triggered.

If the user is a staff member, the backend checks their authentication status and routes them accordingly. If the user is a business client, authentication is not required, and the request is routed directly. Staff members are granted role-based permissions to perform specific actions within the n8n workflows.

---

## Features

- **JWT Authentication/Authorization:** Secures endpoints using JSON Web Tokens.
- **Rate Limiting:** Protects the application from excessive requests using `express-rate-limit`.
- **Request Timeouts:** Implements request timeouts using `connect-timeout` to prevent hanging requests.
- **Request Sanitization:** Includes middleware likely using `validator` to sanitize incoming request data.
- **Logging:** Comprehensive logging implemented using `winston` with daily log rotation.
- **Language Detection:** Capable of detecting request language using `cld3-asm`.
- **Internationalization (i18n):** Supports multiple languages for responses.
- **Caching:** Utilizes `redis` for caching.
- **Environment Configuration:** Uses `.env` files for managing environment variables.

---

## Key Technologies

- Node.js
- Express.js
- jsonwebtoken
- express-rate-limit
- connect-timeout
- validator
- winston
- cld3-asm
- dotenv
- node-cache
- redis
- zod
- argon2

---

## Required Headers

All API requests **must** include the following headers:

- **`x-unique-id`**: A unique identifier for the user making the request. This value is crucial for the correct functioning of **Rate Limiting**, as it allows tracking requests per user.
- **`x-client-id`**: A unique identifier for the client making the request. This value is crucial for the correct functioning of **Rate Limiting**, as it allows tracking requests per client.
- **`accept-language`**: The preferred language code for responses (e.g., `es-ES` for Spanish, `en-US` for English). This ensures that error messages and other responses are returned in the appropriate language.

The absence of these headers will result in an error.

---

## Project Structure

```
/
├── constants/         # Constant values
├── controllers/       # Request handlers
├── i18n/              # Internationalization files
├── logs/              # Application logs
├── middleware/        # Express middleware (auth, rate limit, sanitize, etc.)
|-- redis/             # Redis client implementation
├── routes/            # API route definitions
├── utils/             # Utility functions
├── .env.example       # Example environment variables
├── .env               # Environment variables (ignored by git)
├── .gitignore         # Git ignore file
├── eslint.config.js   # ESLint configuration
├── index.js           # Application entry point
├── package.json       # Project metadata and dependencies
├── Procfile           # Deployment configuration (e.g., Heroku)
├── requests.http      # HTTP requests for testing (use rest client vsc extension)
├── LICENSE            # License file
└── README.md          # Project documentation
```

---

## Constants Actions

Represents the action to be taken in n8n flow according to the response of the backend.

- ACTIONS_DO_NOTHING: Do nothing.
- ACTIONS_CONTINUE: Continue to the next step.
- ACTIONS_CHAT_ALERT_NOTIFICATION: Send an error message in chat as well as an alert notification to the manager about an error in backend.
- ACTIONS_ALERT_NOTIFICATION: Send an alert notification to the manager about an error in backend.
- ACTIONS_CHAT_NOTIFICATION: Send an error message in chat, this error is not related to backend.
- ACTIONS_INVALID_PASSWORD_NOTIFICATION: This action is used to notify the user that the password is invalid.
- ACTIONS_BLOCKED_USER_NOTIFICATION: This action is used to notify the user that he is blocked.

--

## How it works

- The keys of redis are generated using the following format: `clientId:uniqueId:login` and `clientId:uniqueId:block`, one for staff login and one for register blocked staff/users.
- All the staff members must be registered in redis.
- The staff members data must be stored in redis using a hash type with the following fields: `name`, `lastName`, `isOwner`, `phone`, `role`, `email`, `password` and `isActive`, feel free to change the structure according to your requirements.
- This project use passwords encrypted with argon2.
- A user or staff member can be automatically blocked for some minutes (BLOCK_EXPIRATION_MINUTES) after exceeding a certain number of request (RATE_LIMIT_MAX) in a certain time window (RATE_LIMIT_WINDOW_MS).
- Only staff members can login to the system, business clients can't login.
- When a staff member logs in, a session is created and a token is generated. This token is used to authenticate the staff member in the system.
- When a staff member logs out, the token that was assigned to them is temporarily stored in Redis as revoked token with the same value as key and a TTL set to 5 minutes beyond its original expiration time (e.g., if the token was set to expire at 8:00, the TTL will be set to 8:05). This serves as a security measure to prevent the reuse of that token for logging in.

--

## Available Routes

This section provides a brief overview of all the available API routes in this application.

### Root Routes

- `GET /`: Base endpoint of the application.

### Auth Routes (`/auth`)

- `POST /auth/login`: Authenticates a user and returns a session token.
- `POST /auth/login-ma`: Authenticates a user and returns a session token, also increments the login attempts counter for validation purposes.
- `POST /auth/verify-token`: Verifies an existing session token.
- `POST /auth/logout`: Invalidates a user's session token.
- `GET /auth/validate`: Validates the current request's session (implementation specific).
- `POST /auth/block-user`: Blocks a user (implementation specific).

### Sanitize Routes (`/sanitize`)

- `POST /sanitize/`: Endpoint for input sanitization (implementation specific).

--

## Getting Started

### Prerequisites

- Node.js (Refer to `package.json` for potential version requirements)
- npm
- Redis (database) 7.4 or higher

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd jwt-n8n-backend-session
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Environment Variables

1.  Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
2.  Edit the `.env` file and fill in the necessary configuration values:
    - **PORT:** Port on which the application will run.
    - **JWT Secret:** Secret key used for signing JWT tokens.
    - **JWT_EXPIRATION_MINUTES:** JWT expiration time in minutes (e.g., `15` for 15 minutes).
    - **REQUEST_TIMEOUT:** Maximum time allowed for a request to complete before timing out (e.g., `15s`).
    - **REQUEST_MAX_BODY_SIZE:** Maximum allowed size for the request body (e.g., `10kb`, `1mb`, `10mb`).
    - **RATE_LIMIT_WINDOW_MS:** Time window in seconds for rate limiting (e.g., `60` for 1 minute).
    - **RATE_LIMIT_MAX:** Maximum number of requests allowed per IP address within the defined time window.
    - **BLOCK_EXPIRATION_MINUTES:** Time window in minutes for blocking a user (e.g., `60` for 1 hour).
    - **LOGIN_ATTEMPTS:** Maximum number of login attempts allowed per user within the defined time window.
    - **LOGIN_ATTEMPTS_EXPIRATION_MINUTES:** Time window in minutes for login attempts (e.g., `60` for 1 hour).
    - **SESSION_SECRET:** A security token required for authenticating requests. Define this token in the `.env` file. Each incoming request must include this token in the `Authorization` header as a Bearer token (e.g., `Authorization: Bearer <your_token>`) to be processed. This ensures that only authorized clients or processes can interact with the backend.
    - **REDIS_USERNAME:** Redis username.
    - **REDIS_PASSWORD:** Redis password.
    - **REDIS_HOST:** Redis host.
    - **REDIS_PORT:** Redis port.

### Running the Application

- **Development Mode (with auto-reload):**
  ```bash
  npm run dev
  ```
- **Production Mode:**
  ```bash
  npm start
  ```

The application will typically run on the port specified in your `.env` file or a default port.

---

## License

This project is licensed under the ISC License. See the `LICENCE` file for details.

---

## Contributing

Contributions, issues and feature requests are welcome!
Feel free to open an issue or submit a pull request.

---

Created by [junforever](https://github.com/junforever)
