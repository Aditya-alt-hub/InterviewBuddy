# Authentication & Authorization Documentation

## Overview

This application implements JWT-based authentication with role-based access control (RBAC).

## Authentication Flow

### 1. User Registration

**Endpoint:** `POST /api/users/register`

```json
Request:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### 2. User Login

**Endpoint:** `POST /api/users/login`

```json
Request:
{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### 3. Token Refresh

**Endpoint:** `POST /api/users/refresh-token`

- Requires refresh token in httpOnly cookie
- Returns new access token

```json
Response:
{
  "success": true,
  "token": "new-access-token"
}
```

### 4. User Logout

**Endpoint:** `POST /api/users/logout`

- Clears refresh token cookie
- Invalidates session

```json
Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Authorization Levels

### Public Routes (No Authentication Required)

- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `POST /api/users/refresh-token` - Token refresh

### Protected Routes (User Authentication Required)

All routes require JWT token in Authorization header:

```
Authorization: Bearer {token}
```

#### Interview Routes

- `POST /api/interviews/create` - Create new interview
- `POST /api/interviews/generate-questions` - Generate AI questions
- `POST /api/interviews/start` - Start interview session
- `GET /api/interviews/:interviewId/questions` - Get questions
- `POST /api/interviews/submit-answer` - Submit answer
- `POST /api/interviews/:interviewId/complete` - Complete interview
- `GET /api/interviews/:interviewId/results` - Get results
- `GET /api/interviews/user/:userId` - Get user interviews

#### Resume Routes

- `POST /api/resumes/upload` - Upload resume
- `GET /api/resumes/user/:userId` - Get user resumes
- `GET /api/resumes/:resumeId` - Get specific resume
- `PUT /api/resumes/:resumeId/target-role` - Update target role
- `DELETE /api/resumes/:resumeId` - Delete resume

#### Chat Routes

- `POST /api/chats/send-message` - Send text message
- `GET /api/chats/:sessionId/history` - Get chat history
- `POST /api/chats/send-voice` - Send voice message
- `POST /api/chats/transcribe` - Transcribe audio
- `POST /api/chats/generate-voice` - Generate voice response

#### User Profile Routes

- `GET /api/users/me` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/change-password` - Change password

### Admin Routes (Admin Role Required)

- `GET /api/users/all-users` - Get all users (admin only)

## JWT Token Structure

### Access Token Payload

```json
{
  "id": "user_id",
  "iat": 1234567890,
  "exp": 1234654290
}
```

### Token Storage

- **Access Token:** Stored in memory or localStorage (not httpOnly for frontend access)
- **Refresh Token:** Stored in httpOnly cookie (cannot be accessed via JavaScript)

## Security Features

### 1. Password Security

- Passwords are hashed using bcryptjs (10 salt rounds)
- Passwords are never returned in API responses
- Original passwords are not stored in database

### 2. Token Security

- JWT tokens are signed with a secret key
- Token expiration is set to 7 days for access tokens
- Refresh tokens expire after 30 days
- Tokens cannot be reused after logout

### 3. Authorization

- Role-based access control (RBAC) is implemented
- Admin users have access to special routes
- Users can only access their own resources

### 4. Middleware Protection

- `verifyToken` - Verifies JWT token validity
- `isAuthenticated` - Checks if user is authenticated
- `authorize(...roles)` - Checks if user has required role
- `checkOwnership` - Ensures user owns the resource

## Middleware Usage

### Apply verifyToken to protect a route

```javascript
router.get("/protected-route", verifyToken, controller);
```

### Apply role-based authorization

```javascript
router.post("/admin-route", verifyToken, authorize("admin"), controller);
```

### Check resource ownership

```javascript
router.get("/:userId/data", verifyToken, checkOwnership("userId"), controller);
```

## Error Responses

### 401 Unauthorized

```json
{
  "message": "No token provided, authorization denied"
}
```

### 403 Forbidden

```json
{
  "message": "User role 'user' is not authorized to access this resource"
}
```

### 400 Bad Request

```json
{
  "message": "Please provide email and password"
}
```

## Frontend Integration

### Store Token

```javascript
localStorage.setItem("token", response.data.token);
```

### Send Token in Requests

```javascript
const config = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
};
axios.get("/api/protected-route", config);
```

### Handle Token Expiration

- Implement token refresh logic before token expires
- Or refresh token when receiving 401 response
- Redirect to login page if refresh fails

## Best Practices

1. **Never store sensitive data in localStorage** - Use httpOnly cookies for refresh tokens
2. **Always use HTTPS** - Especially in production
3. **Rotate refresh tokens** - Implement token rotation for added security
4. **Monitor failed login attempts** - Implement rate limiting
5. **Use environment variables** - Never hardcode secrets
6. **Implement CORS properly** - Restrict to allowed origins
7. **Add rate limiting** - Prevent brute force attacks
8. **Implement logout** - Invalidate tokens on server side if possible

## Testing Authentication

### Using cURL

```bash
# Register
curl -X POST http://localhost:4000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"pass123"}'

# Login
curl -X POST http://localhost:4000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# Protected Route
curl -X GET http://localhost:4000/api/users/me \
  -H "Authorization: Bearer {token}"
```

### Using Postman

1. Get token from login response
2. Add to Headers: `Authorization: Bearer {token}`
3. Send request to protected routes
