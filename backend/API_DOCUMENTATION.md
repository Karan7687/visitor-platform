# Visitor Platform API Documentation

## Base URL
```
https://visitor-platform.onrender.com
```

## Overview
The Visitor Platform API provides endpoints for user management, visitor registration, and company management. All requests and responses are in JSON format.

---

## Authentication
Currently, the API uses basic email/password authentication. JWT tokens will be implemented in future versions.

---

## Response Format

### Success Response
```json
{
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error description"
}
```

---

## User Management APIs

### 1. User Registration
**POST** `/api/users/register`

Registers a new user with company code validation.

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john@company.com",
  "phone": "+1234567890",
  "password": "securePassword123",
  "company_code": "COMP123",
  "role": "employee"
}
```

**Required Fields:** `full_name`, `email`, `password`, `company_code`
**Optional Fields:** `phone`, `role` (defaults to "employee")

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "full_name": "John Doe",
    "email": "john@company.com",
    "phone": "+1234567890",
    "role": "employee",
    "is_active": true,
    "company_id": 1,
    "company_name": "Company Name",
    "created_at": "2024-01-27T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Missing required fields
- `400` - User with this email already exists
- `400` - Invalid company code
- `500` - Internal server error

---

### 2. User Login
**POST** `/api/users/login`

Authenticates a user and returns user information.

**Request Body:**
```json
{
  "email": "john@company.com",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "full_name": "John Doe",
    "email": "john@company.com",
    "phone": "+1234567890",
    "role": "employee",
    "is_active": true,
    "company_id": 1,
    "created_at": "2024-01-27T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Missing required fields
- `401` - Invalid email or password
- `500` - Internal server error

---

### 3. Get User by ID
**GET** `/api/users/:id`

Retrieves user information by user ID.

**Path Parameters:**
- `id` (integer) - User ID

**Success Response (200):**
```json
{
  "user": {
    "id": 1,
    "full_name": "John Doe",
    "email": "john@company.com",
    "phone": "+1234567890",
    "role": "employee",
    "is_active": true,
    "company_id": 1,
    "created_at": "2024-01-27T10:00:00.000Z",
    "updated_at": "2024-01-27T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `404` - User not found
- `500` - Internal server error

---

## Visitor Management APIs

### 1. Register Visitor
**POST** `/api/visitors`

Registers a new visitor or updates an existing visitor and creates a visitor lead.

**Request Body:**
```json
{
  "full_name": "Jane Smith",
  "email": "jane@visitor.com",
  "phone": "+1234567890",
  "organization": "Visitor Company",
  "designation": "Manager",
  "city": "New York",
  "country": "USA",
  "interests": "Technology, Innovation",
  "notes": "Interested in partnership",
  "employee_id": 1
}
```

**Required Fields:** `full_name`, `phone`, `employee_id`
**Optional Fields:** `email`, `organization`, `designation`, `city`, `country`, `interests`, `notes`

**Success Response (201):**
```json
{
  "message": "Visitor registered successfully",
  "visitor_id": 1
}
```

**Error Responses:**
- `500` - Internal server error

---

### 2. Check Visitor by Phone
**GET** `/api/visitors/check-phone/:phone`

Checks if a visitor exists by phone number and returns their information.

**Path Parameters:**
- `phone` (string) - Visitor's phone number

**Success Response (200):**
```json
{
  "visitor": {
    "id": 1,
    "full_name": "Jane Smith",
    "email": "jane@visitor.com",
    "phone": "+1234567890",
    "organization": "Visitor Company",
    "designation": "Manager",
    "city": "New York",
    "country": "USA"
  },
  "exists": true
}
```

**If visitor not found:**
```json
{
  "visitor": null,
  "exists": false
}
```

**Error Responses:**
- `400` - Phone number is required
- `500` - Internal server error

---

## System APIs

### 1. Health Check
**GET** `/health`

Checks if the API server is running.

**Response:**
```json
{
  "status": "OK"
}
```

---

### 2. Connectivity Test
**GET** `/ping`

Tests connectivity to the API server.

**Response:**
```json
{
  "message": "Pong! Backend is accessible from mobile app",
  "timestamp": "2024-01-27T10:00:00.000Z"
}
```

---

### 3. Backend Test
**GET** `/test`

Basic backend functionality test.

**Response:**
```json
{
  "message": "Backend is working!"
}
```

---

### 4. Get Companies
**GET** `/companies`

Retrieves list of all companies with their codes.

**Response:**
```json
{
  "companies": [
    {
      "id": 1,
      "name": "Test Company",
      "company_code": "TEST123",
      "status": "active"
    }
  ]
}
```

---

### 5. Create Test Company
**POST** `/create-test-company`

Creates a test company for development/testing purposes.

**Response:**
```json
{
  "company": {
    "id": 1,
    "name": "Test Company",
    "company_code": "TEST123",
    "status": "active"
  }
}
```

---

## HTTP Status Codes

- `200` - OK: Request successful
- `201` - Created: Resource created successfully
- `400` - Bad Request: Invalid request data
- `401` - Unauthorized: Authentication failed
- `404` - Not Found: Resource not found
- `500` - Internal Server Error: Server error

---

## Testing Examples

### 1. Health Check
```bash
curl https://visitor-platform.onrender.com/health
```

**Output:**
```json
{
  "status": "OK"
}
```

### 2. Ping Test
```bash
curl https://visitor-platform.onrender.com/ping
```

**Output:**
```json
{
  "message": "Pong! Backend is accessible from mobile app",
  "timestamp": "2024-01-27T10:00:00.000Z"
}
```

### 3. Backend Test
```bash
curl https://visitor-platform.onrender.com/test
```

**Output:**
```json
{
  "message": "Backend is working!"
}
```

### 4. Get Companies
```bash
curl https://visitor-platform.onrender.com/companies
```

**Output:**
```json
{
  "companies": [
    {
      "id": 1,
      "name": "Test Company",
      "company_code": "TEST123",
      "status": "active"
    }
  ]
}
```

### 5. Create Test Company
```bash
curl -X POST https://visitor-platform.onrender.com/create-test-company
```

**Output:**
```json
{
  "company": {
    "id": 2,
    "name": "Test Company",
    "company_code": "TEST123",
    "status": "active"
  }
}
```

### 6. User Registration
```bash
curl -X POST https://visitor-platform.onrender.com/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Karan Kamble",
    "email": "karan.kamble@test.com",
    "password": "password123",
    "company_code": "TEST123"
  }'
```

**Output (Success - 201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "full_name": "Karan Kamble",
    "email": "karan.kamble@test.com",
    "phone": null,
    "role": "employee",
    "is_active": true,
    "company_id": 1,
    "company_name": "Test Company",
    "created_at": "2024-01-27T10:00:00.000Z"
  }
}
```

**Output (Error - 400 - Invalid Company Code):**
```json
{
  "error": "Invalid company code"
}
```

**Output (Error - 400 - Email Already Exists):**
```json
{
  "error": "User with this email already exists"
}
```

### 7. User Login
```bash
curl -X POST https://visitor-platform.onrender.com/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "karan.kamble@test.com",
    "password": "password123"
  }'
```

**Output (Success - 200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "full_name": "Karan Kamble",
    "email": "karan.kamble@test.com",
    "phone": null,
    "role": "employee",
    "is_active": true,
    "company_id": 1,
    "created_at": "2024-01-27T10:00:00.000Z"
  }
}
```

**Output (Error - 401 - Invalid Credentials):**
```json
{
  "error": "Invalid email or password"
}
```

### 8. Get User by ID
```bash
curl https://visitor-platform.onrender.com/api/users/1
```

**Output (Success - 200):**
```json
{
  "user": {
    "id": 1,
    "full_name": "Karan Kamble",
    "email": "karan.kamble@test.com",
    "phone": null,
    "role": "employee",
    "is_active": true,
    "company_id": 1,
    "created_at": "2024-01-27T10:00:00.000Z",
    "updated_at": "2024-01-27T10:00:00.000Z"
  }
}
```

**Output (Error - 404 - User Not Found):**
```json
{
  "error": "User not found"
}
```

### 9. Register Visitor
```bash
curl -X POST https://visitor-platform.onrender.com/api/visitors \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Visitor Test",
    "phone": "9876543210",
    "email": "visitor@test.com",
    "organization": "Test Org",
    "designation": "Manager",
    "city": "Pune",
    "country": "India",
    "interests": "Technology, Innovation",
    "notes": "Interested in partnership",
    "employee_id": 1
  }'
```

**Output (Success - 201):**
```json
{
  "message": "Visitor registered successfully",
  "visitor_id": 1
}
```

### 10. Check Visitor by Phone
```bash
curl https://visitor-platform.onrender.com/api/visitors/check-phone/9876543210
```

**Output (Visitor Found - 200):**
```json
{
  "visitor": {
    "id": 1,
    "full_name": "Visitor Test",
    "email": "visitor@test.com",
    "phone": "9876543210",
    "organization": "Test Org",
    "designation": "Manager",
    "city": "Pune",
    "country": "USA"
  },
  "exists": true
}
```

**Output (Visitor Not Found - 200):**
```json
{
  "visitor": null,
  "exists": false
}
```

**Output (Test Phone - 1234567890):**
```json
{
  "visitor": {
    "id": "test-id",
    "full_name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "organization": "Test Company",
    "designation": "Test Manager",
    "city": "Test City",
    "country": "Test Country"
  },
  "exists": true
}
```

### 11. Error Test Cases

#### Invalid Company Code
```bash
curl -X POST https://visitor-platform.onrender.com/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@invalid.com",
    "password": "password123",
    "company_code": "WRONGCODE"
  }'
```

**Output:**
```json
{
  "error": "Invalid company code"
}
```

#### Wrong Login Password
```bash
curl -X POST https://visitor-platform.onrender.com/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "karan.kamble@test.com",
    "password": "wrongpassword"
  }'
```

**Output:**
```json
{
  "error": "Invalid email or password"
}
```

#### Missing Required Fields
```bash
curl -X POST https://visitor-platform.onrender.com/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@test.com"
  }'
```

**Output:**
```json
{
  "error": "Full name, email, password, and company code are required"
}
```

---

## Mobile App Integration

The React Native mobile app is already configured to use these APIs:
- User registration and login flows
- Visitor registration with phone number lookup
- Real-time data synchronization

---

## Database Schema

### Users Table
- `id` (Primary Key)
- `full_name` (Text)
- `email` (Unique)
- `phone` (Text, Optional)
- `password_hash` (Text)
- `role` (Text)
- `is_active` (Boolean)
- `company_id` (Foreign Key)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Visitors Table
- `id` (Primary Key)
- `full_name` (Text)
- `email` (Text, Optional)
- `phone` (Text)
- `organization` (Text, Optional)
- `designation` (Text, Optional)
- `city` (Text, Optional)
- `country` (Text, Optional)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Companies Table
- `id` (Primary Key)
- `name` (Text)
- `company_code` (Unique)
- `contact_email` (Text)
- `contact_phone` (Text)
- `status` (Text)

---

## Security Features

- Password hashing with bcrypt
- Company code validation for user registration
- Input validation and sanitization
- CORS enabled for mobile app access
- SSL/TLS encryption (HTTPS)

---

## Deployment Information

- **Platform**: Render
- **Environment**: Production
- **Database**: PostgreSQL (Render)
- **Node.js Version**: Latest LTS
- **Framework**: Express.js

---

## Support

For technical support or questions about the API, please contact the development team.

---

*Last Updated: January 27, 2026*
