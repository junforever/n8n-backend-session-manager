# JWT Backend Session Manager

This project provides a backend service built with Node.js and Express.js, designed to manage authentication, authorization, rate limiting, timeouts, logging, and security features, potentially acting as a gateway or middleware for another service like n8n.

## Features

*   **JWT Authentication/Authorization:** Secures endpoints using JSON Web Tokens.
*   **Rate Limiting:** Protects the application from excessive requests using `express-rate-limit`.
*   **Request Timeouts:** Implements request timeouts using `connect-timeout` to prevent hanging requests.
*   **Request Sanitization:** Includes middleware likely using `validator` to sanitize incoming request data.
*   **Logging:** Comprehensive logging implemented using `winston` with daily log rotation.
*   **Language Detection:** Capable of detecting request language using `cld3-asm`.
*   **Internationalization (i18n):** Supports multiple languages for responses.
*   **Caching:** Utilizes `node-cache` for in-memory caching.
*   **Environment Configuration:** Uses `.env` files for managing environment variables.

## Key Technologies

*   Node.js
*   Express.js
*   jsonwebtoken
*   express-rate-limit
*   connect-timeout
*   validator
*   winston
*   cld3-asm
*   dotenv
*   node-cache

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
└── README.md          # This file
```

## Getting Started

### Prerequisites

*   Node.js (Refer to `package.json` for potential version requirements)
*   npm

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
2.  Edit the `.env` file and fill in the necessary configuration values (e.g., JWT secret, n8n URL if applicable, port).

### Running the Application

*   **Development Mode (with auto-reload):**
    ```bash
    npm run dev
    ```
*   **Production Mode:**
    ```bash
    npm start
    ```

The application will typically run on the port specified in your `.env` file or a default port.

## License

This project is licensed under the ISC License. See the `LICENCE` file for details.

---

Created by [junforever](https://github.com/junforever)
