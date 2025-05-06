# JWT Backend Session Manager

This project provides a backend service built with Node.js and Express.js, designed to manage authentication, authorization, rate limiting, timeouts, logging, and security features, potentially acting as a gateway or middleware for another service like n8n.

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

---

## Required Headers

All API requests **must** include the following headers:

- **`x-unique-id`**: A unique identifier for the user making the request. This value is crucial for the correct functioning of **Rate Limiting**, as it allows tracking requests per user.
- **`x-client-id`**: A unique identifier for the client making the request. This value is crucial for the correct functioning of **Rate Limiting**, as it allows tracking requests per client.
- **`x-lang`**: The preferred language code for responses (e.g., `es` for Spanish, `en` for English). This ensures that error messages and other responses are returned in the appropriate language.

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
├── routes/            # API route definitions
├── utils/             # Utility functions
├── .env.example       # Example environment variables
├── .env               # Environment variables (ignored by git)
├── index.js           # Application entry point
├── package.json       # Project metadata and dependencies
├── Procfile           # Deployment configuration (e.g., Heroku)
├── requests.http      # HTTP requests for testing (use rest client vsc extension)
├── LICENSE            # License file
└── README.md          # Project documentation
```

---

## Getting Started

### Prerequisites

- Node.js (Refer to `package.json` for potential version requirements)
- npm

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
    - **JWT Secret:** Secret key used for signing JWT tokens.
    - **PORT:** Port on which the application will run.
    - **SESSION_SECRET:** A security token required for authenticating requests. Define this token in the `.env` file. Each incoming request must include this token in the `Authorization` header as a Bearer token (e.g., `Authorization: Bearer <your_token>`) to be processed. This ensures that only authorized clients or processes can interact with the backend.
    - **JWT_EXPIRATION_MINUTES:** JWT expiration time in minutes (e.g., `15` for 15 minutes).
    - **REQUEST_TIMEOUT:** Maximum time allowed for a request to complete before timing out (e.g., `15s`).
    - **REQUEST_MAX_BODY_SIZE:** Maximum allowed size for the request body (e.g., `10kb`).
    - **RATE_LIMIT_WINDOW_MS:** Time window in seconds for rate limiting (e.g., `60` for 1 minute).
    - **RATE_LIMIT_MAX:** Maximum number of requests allowed per IP address within the defined time window.

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
