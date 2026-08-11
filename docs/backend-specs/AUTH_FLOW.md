# EGKMS Backend API Documentation

## Project

**Enterprise Governance & Knowledge Management System (EGKMS)**

Backend Stack:

* Node.js
* Express.js
* MongoDB
* Mongoose
* Passport.js
* JWT
* bcrypt
* Joi
* HttpOnly Cookies
* Email OTP
* express-rate-limit

---

# Current Status

```text
Authentication Module: COMPLETED AND TESTED

Employee Management Module: BASE COMPLETED AND TESTED
```

The Authentication module has been implemented and tested end-to-end.

---

# Base URL

Development:

```text
http://localhost:5000/api/v1
```

---

# Backend Architecture

The backend follows a modular architecture:

```text
Request
   |
   ↓
Route
   |
   ↓
Middleware
   |
   ↓
Validator
   |
   ↓
Controller
   |
   ↓
Service
   |
   ↓
Model
   |
   ↓
MongoDB
```

---

# Authentication Architecture

Authentication uses:

* Passport.js Local Strategy
* Passport.js JWT Strategy
* JWT Access Token
* JWT Refresh Token
* HttpOnly Cookie
* Email OTP Verification
* bcrypt Password Hashing
* Joi Validation
* express-rate-limit

---

# Authentication Flow

The system uses a company-controlled registration process.

An employee cannot directly create an account without an approved Employee record.

```text
Super Admin / Authorized User
        |
        ↓
Create Employee
        |
        ↓
Employee Record Created
        |
        ↓
Employee Email Exists in System
        |
        ↓
Employee Requests OTP
        |
        ↓
Email OTP Verification
        |
        ↓
Employee Registration
        |
        ↓
User Account Created
        |
        ↓
Login
        |
        ↓
Access Token + Refresh Token
```

---

# Employee Collection vs User Collection

## Employee Collection

The Employee collection stores company-level employee information.

Employee records can exist before the employee creates a login account.

Example:

```json
{
    "employeeId": "EMP-001",
    "firstName": "Test",
    "lastName": "Employee",
    "email": "employee@company.com",
    "hierarchyLevel": "EMPLOYEE",
    "department": "DEPARTMENT_OBJECT_ID",
    "team": "TEAM_OBJECT_ID",
    "reportingManager": null,
    "status": "ACTIVE",
    "isRegistered": false
}
```

Contains:

* Employee ID
* First name
* Last name
* Email
* Hierarchy level
* Department reference
* Team reference
* Reporting manager reference
* Employee status
* Registration status

Does not contain:

* Password
* Refresh token
* Authentication credentials

---

## User Collection

The User collection stores authentication-related information.

Example:

```json
{
    "employeeId": "EMPLOYEE_OBJECT_ID",
    "email": "employee@company.com",
    "accountStatus": "ACTIVE",
    "isEmailVerified": true,
    "failedLoginAttempts": 0,
    "lockUntil": null,
    "passwordChangedAt": null,
    "lastLogin": null
}
```

Password is stored as a bcrypt hash.

The refresh token is **not stored as plain text**.

Only the hashed refresh token is stored in MongoDB.

---

# Authentication Endpoints

| Method | Endpoint                 | Authentication |
| ------ | ------------------------ | -------------- |
| POST   | `/auth/send-email-otp`   | Public         |
| POST   | `/auth/verify-email-otp` | Public         |
| POST   | `/auth/register`         | Public         |
| POST   | `/auth/login`            | Public         |
| POST   | `/auth/refresh`          | Refresh Cookie |
| POST   | `/auth/logout`           | Access Token   |

---

# 1. Send Email OTP

## Endpoint

```http
POST /auth/send-email-otp
```

Full URL:

```text
http://localhost:5000/api/v1/auth/send-email-otp
```

Authentication:

```text
Not required
```

## Request Body

```json
{
    "email": "employee@company.com"
}
```


## Flow



```text
Request
   |
   ↓
Validate Email
   |
   ↓
Find Employee
   |
   ↓
Check Employee Status
   |
   ↓
Check Registration Status
   |
   ↓
Generate OTP
   |
   ↓
Hash OTP
   |
   ↓
Store OTP
   |
   ↓
Send OTP Email
```

## Expected Success Response

```json
{
    "success": true,
    "message": "OTP sent successfully."
}
```

## Important Conditions

The email must:

* Exist in Employee collection
* Belong to an ACTIVE employee
* Not already be registered

---

# 2. Verify Email OTP

## Endpoint

```http
POST /auth/verify-email-otp
```

Full URL:

```text
http://localhost:5000/api/v1/auth/verify-email-otp
```

Authentication:

```text
Not required
```

## Request Body

```json
{
    "email": "employee@company.com",
    "otp": "123456"
}
```

## Flow

```text
Request
   |
   ↓
Find OTP
   |
   ↓
Check Expiry
   |
   ↓
Check Attempts
   |
   ↓
Compare OTP Hash
   |
   ↓
Mark OTP Verified
```

## Expected Success Response

```json
{
    "success": true,
    "message": "Email verified successfully."
}
```

## OTP Security

* OTP is hashed before storage.
* OTP expires after 5 minutes.
* Maximum invalid attempts: 5.
* Previous OTP is removed when a new OTP is generated.

---

# 3. Register User

## Endpoint

```http
POST /auth/register
```

Full URL:

```text
http://localhost:5000/api/v1/auth/register
```

Authentication:

```text
Not required
```

## Request Body

The current registration validator requires:

```json
{
    "email": "employee@company.com",
    "password": "Employee@123",
    "confirmPassword": "Employee@123"
}
```

`password` and `confirmPassword` must match.

## Flow

```text
Register Request
        |
        ↓
Find Employee by Email
        |
        ↓
Check Employee Status
        |
        ↓
Check isRegistered
        |
        ↓
Check Verified OTP
        |
        ↓
Check Existing User
        |
        ↓
Hash Password
        |
        ↓
Create User
        |
        ↓
Set Employee isRegistered = true
        |
        ↓
Delete Verified OTP
```

## Expected Success Response

```json
{
    "success": true,
    "message": "Registration successful.",
    "data": {
        "user": {
            "employeeId": "EMPLOYEE_OBJECT_ID",
            "email": "employee@company.com",
            "accountStatus": "ACTIVE",
            "isEmailVerified": true,
            "failedLoginAttempts": 0,
            "lockUntil": null,
            "passwordChangedAt": null,
            "lastLogin": null
        }
    }
}
```

## Important

Frontend must **not send**:

```text
role
hierarchyLevel
accountStatus
isEmailVerified
employeeId
refreshToken
```

These are controlled by the backend.

---

# 4. Login

## Endpoint

```http
POST /auth/login
```

Full URL:

```text
http://localhost:5000/api/v1/auth/login
```

Authentication:

```text
Not required
```

## Request Body

```json
{
    "email": "employee@company.com",
    "password": "Employee@123"
}
```

## Flow

```text
Login Request
        |
        ↓
Passport Local Strategy
        |
        ↓
Find User
        |
        ↓
Check Account Status
        |
        ↓
Find Employee
        |
        ↓
Check Employee Status
        |
        ↓
Check Email Verification
        |
        ↓
Compare Password
        |
        ↓
Generate Access Token
        |
        ↓
Generate Refresh Token
        |
        ↓
Hash Refresh Token
        |
        ↓
Save Refresh Token Hash in MongoDB
        |
        ↓
Set Refresh Token HttpOnly Cookie
        |
        ↓
Return Access Token
```

## Expected Success Response

```json
{
    "success": true,
    "message": "Login successful.",
    "data": {
        "accessToken": "JWT_ACCESS_TOKEN",
        "user": {
            "_id": "USER_OBJECT_ID",
            "employeeId": "EMPLOYEE_OBJECT_ID",
            "email": "employee@company.com",
            "accountStatus": "ACTIVE",
            "isEmailVerified": true,
            "failedLoginAttempts": 0,
            "lockUntil": null,
            "passwordChangedAt": null,
            "lastLogin": "2026-08-02T18:30:48.779Z"
        }
    }
}
```

---

# Access Token

## Purpose

The access token is used to access protected APIs.

Frontend sends it through:

```http
Authorization: Bearer <ACCESS_TOKEN>
```

Example:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## Important

The current backend returns the access token in the **login response body**.

The access token is **NOT stored in the HttpOnly refresh-token cookie**.

Frontend is responsible for handling the access token according to the frontend application's authentication strategy.

---

# Access Token JWT Payload

Current token generation includes user identification information.

Example:

```json
{
    "id": "USER_OBJECT_ID",
    "employeeId": "EMPLOYEE_OBJECT_ID",
    "iat": 1785692314,
    "exp": 1785693214
}
```

The JWT is verified using:

```text
JWT_ACCESS_SECRET
```

Algorithm:

```text
HS256
```

---

# Refresh Token

## Purpose

The refresh token is used to generate a new access token.

The refresh token is:

```text
HttpOnly Cookie
+
Hashed value in MongoDB
```

Cookie name:

```text
refreshToken
```

The plain refresh token is never stored in MongoDB.

MongoDB stores:

```text
refreshTokenHash
```

---

# Refresh Token Cookie

Current configuration:

```text
httpOnly: true

secure:
true in production
false in development

sameSite:
strict

maxAge:
7 days
```

Frontend JavaScript cannot directly read the HttpOnly refresh token cookie.

---

# 5. Refresh Access Token

## Endpoint

```http
POST /auth/refresh
```

Full URL:

```text
http://localhost:5000/api/v1/auth/refresh
```

Authentication:

```text
Refresh Token Cookie required
```

## Request Body

No request body is required.

```json
{}
```

The backend reads:

```text
req.cookies.refreshToken
```

## Flow

```text
Refresh Request
        |
        ↓
Read refreshToken Cookie
        |
        ↓
Verify JWT Refresh Token
        |
        ↓
Find User
        |
        ↓
Check Account Status
        |
        ↓
Get refreshTokenHash
        |
        ↓
Compare Refresh Token
        |
        ↓
Generate New Access Token
        |
        ↓
Generate New Refresh Token
        |
        ↓
Hash New Refresh Token
        |
        ↓
Update MongoDB
        |
        ↓
Replace HttpOnly Cookie
```

## Expected Success Response

```json
{
    "success": true,
    "message": "Access token refreshed successfully.",
    "data": {
        "accessToken": "NEW_ACCESS_TOKEN"
    }
}
```

A new refresh token is placed in the HttpOnly cookie.

---

# Refresh Token Rotation

The backend uses refresh-token rotation.

Every successful refresh:

```text
Old Refresh Token
        |
        ↓
Verified
        |
        ↓
New Access Token
        |
        ↓
New Refresh Token
        |
        ↓
New Refresh Token Hash
        |
        ↓
MongoDB Updated
```

Therefore, the old refresh token should not be reused after successful rotation.

---

# 6. Logout

## Endpoint

```http
POST /auth/logout
```

Full URL:

```text
http://localhost:5000/api/v1/auth/logout
```

Authentication:

```http
Authorization: Bearer <ACCESS_TOKEN>
```

## Request Body

No body required.

```json
{}
```

## Headers

```http
Authorization: Bearer <ACCESS_TOKEN>
```

## Flow

```text
Logout Request
        |
        ↓
Verify Access Token
        |
        ↓
Find User
        |
        ↓
Set refreshTokenHash = null
        |
        ↓
Clear refreshToken Cookie
        |
        ↓
Logout Success
```

## Expected Response

```json
{
    "success": true,
    "message": "Logout successful."
}
```

---

# Authentication Middleware

Protected APIs use the JWT authentication middleware.

Frontend must send:

```http
Authorization: Bearer <ACCESS_TOKEN>
```

Example:

```http
GET /employee

Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

If authentication fails:

```json
{
    "success": false,
    "message": "Authentication required."
}
```

---

# Authorization

Authorization is handled separately from authentication.

```text
Authentication
      |
      ↓
Who is the user?

      +

Authorization
      |
      ↓
What is the user allowed to do?
```

The current project uses hierarchy-based access control.

Current hierarchy:

```text
SUPER_ADMIN
     ↓
GOVERNANCE
     ↓
EXECUTIVE
     ↓
DEPARTMENT
     ↓
MANAGER
     ↓
TEAM_LEAD
     ↓
TEAM
     ↓
EMPLOYEE
     ↓
INTERN
```

Authorization rules must follow the project's hierarchy and permission requirements.

---

# Employee Management Module

## Current Status

```text
BASE COMPLETED AND TESTED
```

---

# Employee Model Structure

Current Employee fields:

```json
{
    "employeeId": "EMP-001",
    "firstName": "Test",
    "lastName": "Employee",
    "email": "employee@company.com",
    "hierarchyLevel": "EMPLOYEE",
    "department": "DEPARTMENT_OBJECT_ID",
    "team": "TEAM_OBJECT_ID",
    "reportingManager": null,
    "status": "ACTIVE",
    "isRegistered": false,
    "createdBy": null
}
```

---

# Department and Team References

`department` is a MongoDB ObjectId reference to:

```text
Department
```

`team` is a MongoDB ObjectId reference to:

```text
Team
```

Therefore frontend must send actual MongoDB IDs.

Incorrect:

```json
{
    "department": "IT",
    "team": "Development"
}
```

Correct:

```json
{
    "department": "6a6f8a30d31f0f37ad7613b4",
    "team": "6a6f8a5cd31f0f37ad7613b7"
}
```

---

# Create Employee

## Endpoint

```http
POST /employee
```

Full URL:

```text
http://localhost:5000/api/v1/employee
```

Authentication:

```text
Required
```

Authorization:

```text
Authorized hierarchy level required
```

Current tested scenario:

```text
SUPER_ADMIN
     ↓
Create Employee
     ↓
201 Created
```

## Headers

```http
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
```

## Request Body

```json
{
    "employeeId": "EMP-001",
    "firstName": "Test",
    "lastName": "Employee",
    "email": "employee@company.com",
    "hierarchyLevel": "EMPLOYEE",
    "department": "DEPARTMENT_OBJECT_ID",
    "team": "TEAM_OBJECT_ID"
}
```

## Expected Success Response

```json
{
    "success": true,
    "message": "Employee created successfully",
    "data": {
        "employeeId": "EMP-001",
        "firstName": "Test",
        "lastName": "Employee",
        "email": "employee@company.com",
        "hierarchyLevel": "EMPLOYEE",
        "department": "DEPARTMENT_OBJECT_ID",
        "team": "TEAM_OBJECT_ID",
        "reportingManager": null,
        "status": "ACTIVE",
        "isRegistered": false
    }
}
```

---

# Employee Registration Relationship

After an employee is created:

```text
Employee
isRegistered = false
```

After successful registration:

```text
Employee
isRegistered = true
```

The User account is linked to the Employee using:

```text
User.employeeId
        ↓
Employee._id
```

---

# Department Model

Department currently contains:

```json
{
    "name": "Information Technology",
    "code": "IT",
    "head": null,
    "status": "ACTIVE",
    "createdBy": null
}
```

Department `_id` is referenced by Employee and Team.

---

# Team Model

Team currently contains:

```json
{
    "name": "Development",
    "department": "DEPARTMENT_OBJECT_ID",
    "teamLead": null,
    "status": "ACTIVE",
    "createdBy": null
}
```

Team belongs to a Department through:

```text
Team.department
        ↓
Department._id
```

---

# Validation

Request validation is handled through Joi.

Validation middleware:

```text
src/middleware/validate.middleware.js
```

Invalid requests return:

```json
{
    "success": false,
    "message": "Validation failed.",
    "errors": [
        {
            "field": "fieldName",
            "message": "Validation message"
        }
    ]
}
```

Example:

```json
{
    "success": false,
    "message": "Validation failed.",
    "errors": [
        {
            "field": "confirmPassword",
            "message": "Confirm password is required"
        }
    ]
}
```

---

# Common Authentication Errors

## Invalid Login

```json
{
    "success": false,
    "message": "Invalid email or password."
}
```

## Account Not Active

```json
{
    "success": false,
    "message": "Account is not active."
}
```

## Email Not Verified

```json
{
    "success": false,
    "message": "Please verify your email first."
}
```

## Invalid Access Token

```json
{
    "success": false,
    "message": "Authentication required."
}
```

## Missing Refresh Token

```json
{
    "success": false,
    "errorName": "ApiError",
    "message": "Refresh token is required.",
    "errors": []
}
```

## Invalid Refresh Token

The refresh endpoint rejects an invalid or mismatched refresh token.

---

# Common Authorization Error

If an authenticated user does not have permission for an API:

```json
{
    "success": false,
    "message": "You are not authorized"
}
```

---

# Cookie Handling for Frontend

The backend uses an HttpOnly cookie for:

```text
refreshToken
```

Frontend should allow cookies to be sent with authentication requests.

For browser requests using `fetch`:

```javascript
fetch("/api/v1/auth/refresh", {
    method: "POST",
    credentials: "include"
});
```

For Axios:

```javascript
axios.post(
    "/api/v1/auth/refresh",
    {},
    {
        withCredentials: true
    }
);
```

The frontend should **not attempt to read the `refreshToken` cookie using JavaScript** because it is HttpOnly.

---

# Recommended Frontend Authentication Flow

```text
LOGIN
  |
  ↓
Receive accessToken
  |
  ↓
Store accessToken according to frontend auth strategy
  |
  ↓
Send accessToken in Authorization header
  |
  ↓
Access Protected APIs
  |
  ↓
Access Token Expired
  |
  ↓
POST /auth/refresh
  |
  ↓
Browser sends refreshToken cookie
  |
  ↓
Receive new accessToken
  |
  ↓
Continue API requests
```

Logout:

```text
POST /auth/logout
        |
        ↓
Backend clears refreshToken cookie
        |
        ↓
Backend invalidates refreshTokenHash
        |
        ↓
Frontend removes active accessToken
```

---

# Rate Limiting

Authentication endpoints use rate limiting.

Current configured limits should be treated as backend-controlled security settings.

Frontend should handle `429 Too Many Requests` responses gracefully and should not continuously retry failed OTP/login requests.

---

# Tested Authentication Flow

The following flow has been manually tested successfully:

```text
1. Super Admin Seed
        ↓
2. Super Admin Login
        ↓
3. JWT Authentication
        ↓
4. Hierarchy Authorization
        ↓
5. Employee Creation
        ↓
6. Send Email OTP
        ↓
7. Verify Email OTP
        ↓
8. Employee Registration
        ↓
9. Employee Login
        ↓
10. Refresh Token
        ↓
11. Logout
```

---

# Tested Employee Example

Test employee successfully created:

```json
{
    "employeeId": "EMP-001",
    "firstName": "Test",
    "lastName": "Employee",
    "email": "employee@company.com",
    "hierarchyLevel": "EMPLOYEE",
    "status": "ACTIVE",
    "isRegistered": true
}
```

---

# Backend Project Structure

```text
src
│
├── config
│   ├── db.js
│   ├── mail.js
│   └── passport.js
│
├── middleware
│   ├── validate.middleware.js
│   ├── error.middleware.js
│   ├── auth.middleware.js
│   ├── role.middleware.js
│   └── rateLimiter.middleware.js
│
├── modules
│   │
│   ├── auth
│   │   ├── auth.routes.js
│   │   ├── auth.controller.js
│   │   ├── auth.service.js
│   │   ├── auth.validator.js
│   │   ├── auth.model.js
│   │   └── otp.model.js
│   │
│   ├── employee
│   │   ├── employee.routes.js
│   │   ├── employee.controller.js
│   │   ├── employee.service.js
│   │   ├── employee.validator.js
│   │   └── employee.model.js
│   │
│   ├── department
│   │   └── department.model.js
│   │
│   └── team
│       └── team.model.js
│
├── services
│   └── email
│       ├── email.service.js
│       ├── email.template.js
│       └── index.js
│
├── utils
│   ├── jwt.js
│   ├── hash.js
│   ├── otp.js
│   └── ApiError.js
│
├── routes
│   └── index.js
│
├── app.js
└── server.js
```

---

# Completed Features

## Backend Setup

* ✅ Express Server
* ✅ MongoDB Connection
* ✅ Environment Configuration
* ✅ Modular Architecture
* ✅ Global Error Middleware
* ✅ Validation Middleware
* ✅ Authentication Middleware
* ✅ Authorization Middleware

---

## Authentication Module

* ✅ User Model
* ✅ OTP Model
* ✅ Joi Validation
* ✅ Validation Middleware
* ✅ Passport Local Strategy
* ✅ Passport JWT Strategy
* ✅ Password Hashing
* ✅ Email OTP Verification
* ✅ Register API
* ✅ Login API
* ✅ JWT Access Token
* ✅ JWT Refresh Token
* ✅ HttpOnly Refresh Token Cookie
* ✅ Refresh Token Hash Storage
* ✅ Refresh Token Rotation
* ✅ Refresh API
* ✅ Logout API
* ✅ Refresh Token Invalidation
* ✅ Rate Limiting
* ✅ Email Service

---

## Employee Management Module

* ✅ Employee Model
* ✅ Employee Validator
* ✅ Employee Service
* ✅ Employee Controller
* ✅ Employee Routes
* ✅ Department Reference
* ✅ Team Reference
* ✅ Company-controlled Employee Registration
* ✅ Hierarchy-based authorization structure
* ✅ Employee Creation Tested

---

# Frontend Integration Checklist

Frontend developer should implement:

```text
[ ] Login API integration

[ ] Store/access accessToken according to frontend strategy

[ ] Send Authorization header for protected APIs

[ ] Enable credentials for refresh/logout requests

[ ] Handle refreshToken as HttpOnly cookie

[ ] Implement automatic access-token refresh

[ ] Handle 401 responses

[ ] Handle 403 authorization responses

[ ] Implement logout

[ ] Implement Send OTP screen

[ ] Implement OTP verification screen

[ ] Implement Registration screen

[ ] Implement Employee creation form

[ ] Use Department _id in employee request

[ ] Use Team _id in employee request

[ ] Display backend validation errors
```

---

# Important Frontend Notes

### Do not send plain department names

Incorrect:

```json
{
    "department": "IT"
}
```

Correct:

```json
{
    "department": "DEPARTMENT_OBJECT_ID"
}
```

### Do not send plain team names

Incorrect:

```json
{
    "team": "Development"
}
```

Correct:

```json
{
    "team": "TEAM_OBJECT_ID"
}
```

### Do not send passwords in URL/query parameters

Use JSON request body:

```json
{
    "email": "employee@company.com",
    "password": "Employee@123"
}
```

### Do not access refreshToken from JavaScript

The refresh token is:

```text
HttpOnly Cookie
```

The browser manages it.

---

# Current Project Status

```text
Backend Setup
    ↓
COMPLETED

Authentication Module
    ↓
COMPLETED + TESTED

Employee Management Base
    ↓
COMPLETED + TESTED

Department/Team Models
    ↓
AVAILABLE

Document Management
    ↓
NEXT

Permission Management
    ↓
NEXT

Workflow / Approval
    ↓
NEXT

Audit Logs
    ↓
NEXT

Analytics
    ↓
PLANNED
```

---

# Important

This document describes the **currently implemented backend behavior**.

Frontend implementation must follow the actual API request/response structure above.

New modules should be added to this documentation after their backend implementation and API testing are completed.
