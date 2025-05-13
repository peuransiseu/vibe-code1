# Todo App Backend

This is the backend API for the Todo application, built with Express.js. It includes CORS configuration to ensure that the API can only be accessed from allowed origins.

## Installation

1. Ensure you have Node.js installed (version 14.x or higher recommended)

2. Install dependencies:
```bash
cd todo-app/backend
npm install
```

## Configuration

The backend uses environment variables for configuration, particularly for CORS settings. Create a `.env` file in the backend directory with the following content:

```
PORT=3000
NODE_ENV=development

# CORS Configuration
# Comma-separated list of allowed origins
ALLOWED_ORIGINS=http://localhost:5500,http://127.0.0.1:5500,http://localhost:3001
```

### CORS Configuration

The CORS middleware is configured in `server.js`. It restricts access to the API based on the origin of incoming requests. The key aspects of the CORS configuration are:

1. **Allowed Origins**: Only requests from origins listed in the `ALLOWED_ORIGINS` environment variable will be accepted. This enhances security by preventing unauthorized domains from accessing your API.

2. **Methods**: The API allows the following HTTP methods: `GET`, `POST`, `PUT`, `DELETE`, and `OPTIONS`.

3. **Headers**: The API permits `Content-Type` and `Authorization` headers in requests.

4. **Credentials**: Cross-origin requests with credentials (cookies, HTTP authentication) are allowed.

5. **Preflight Cache**: CORS preflight requests are cached for 24 hours to improve performance.

## Running the Server

Start the development server:
```bash
npm run dev
```

Or in production mode:
```bash
npm start
```

The server will start on the port specified in your `.env` file (defaults to 3000 if not specified).

## Verifying CORS Configuration

To verify that CORS is correctly configured:

1. Start the backend server
2. Open the frontend application from an allowed origin (e.g., http://localhost:5500)
3. The application should function correctly and be able to make API requests

To test that CORS restrictions are working correctly:

1. Try accessing the API from a disallowed origin:
```bash
curl -H "Origin: http://unauthorized-domain.com" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: X-Requested-With" \
  -X OPTIONS --verbose \
  http://localhost:3000/api/tasks
```

2. The response should include CORS headers that do not allow the unauthorized origin

## API Endpoints

The backend provides the following RESTful endpoints:

- `GET /api/tasks`: Get all tasks
- `GET /api/tasks/:id`: Get a single task by ID 
- `POST /api/tasks`: Create a new task
- `PUT /api/tasks/:id`: Update an existing task
- `DELETE /api/tasks/:id`: Delete a task

## Data Storage

Tasks are currently stored in a JSON file (`data/tasks.json`). For production use, consider implementing a database solution. 