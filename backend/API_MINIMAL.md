# Visitor Platform API - Quick Reference

**Base URL**: `https://visitor-platform.onrender.com`

---

## User Management APIs

### POST /api/users/register
**Input:**
```json
{
  "full_name": "John Doe",
  "email": "john@company.com",
  "phone": "+1234567890",
  "password": "password123",
  "company_code": "TEST123",
  "role": "employee"
}
```

**Output (201):**
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
    "company_name": "Test Company",
    "created_at": "2024-01-27T10:00:00.000Z"
  }
}
```

**Error (400):**
```json
{
  "error": "Invalid company code"
}
```

---

### POST /api/users/login
**Input:**
```json
{
  "email": "john@company.com",
  "password": "password123"
}
```

**Output (200):**
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

**Error (401):**
```json
{
  "error": "Invalid email or password"
}
```

---

### GET /api/users/:id
**Input:** URL parameter `id` (user ID)

**Output (200):**
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

---

## Visitor Management APIs

### POST /api/visitors
**Input:**
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

**Output (201):**
```json
{
  "message": "Visitor registered successfully",
  "visitor_id": 1
}
```

---

### GET /api/visitors/check-phone/:phone
**Input:** URL parameter `phone` (visitor's phone)

**Output (200) - Visitor Found:**
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

**Output (200) - Not Found:**
```json
{
  "visitor": null,
  "exists": false
}
```

---

## System APIs

### GET /companies
**Input:** None

**Output (200):**
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

### GET /health
**Input:** None

**Output (200):**
```json
{
  "status": "OK"
}
```

---

### GET /
**Input:** None

**Output (200):**
```
╔══════════════════════════════════════════════════════════════╗
║                    VISITOR PLATFORM API                      ║
╠══════════════════════════════════════════════════════════════╣
║  🚀 Welcome to Visitor Platform Backend API                  ║
║  📋 Version: 1.0.0                                           ║
║  ✅ Status: Active                                           ║
║                                                              ║
║  📚 Available Endpoints:                                     ║
║     • /health - Health check                                ║
║     • /api/users - User management                          ║
║     • /api/visitors - Visitor registration                  ║
║     • /companies - Company information                      ║
║                                                              ║
║  📖 Full API Documentation: See API_DOCUMENTATION.md        ║
╚══════════════════════════════════════════════════════════════╝
```

---

## HTTP Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error
