# EGKMS User Management API Documentation

## Project

**Enterprise Governance & Knowledge Management System (EGKMS)**

## Module

**User Management**

## Current Status

``` text
User Management: COMPLETED AND TESTED
```

This document describes the current User Management backend
implementation and the API behavior for the frontend developer.

------------------------------------------------------------------------

# 1. Purpose

User Management manages the **system account** of an employee. It is
different from Employee Management.

``` text
Employee Management
  → Employee organizational record
  → Employee ID, department, team, hierarchy, reporting manager, employee status

User Management
  → System account
  → Account status, email, verification, password/login security, last login
```

The existing `User` model is part of the Auth module. A separate
`user.model.js` is not required.

Relationship:

``` text
User.employeeId
       ↓
Employee._id
```

------------------------------------------------------------------------

# 2. FRS Alignment

The FRS lists the following Super Admin User Management
responsibilities:

``` text
Create Users
Update Users
Disable Users
Remove Users
Reset Password
Transfer Users
Assign Reporting Manager
```

The current implementation provides the account-management APIs defined
by the current backend design.

The registration flow already creates the User account after:

``` text
Employee exists
    ↓
Email OTP verification
    ↓
Employee registration
    ↓
User account creation
```

Therefore, User Management does not duplicate the public registration
API.

------------------------------------------------------------------------

# 3. Who Manages Users?

Current User Management routes are restricted to:

``` text
SUPER_ADMIN
```

Request flow:

``` text
Frontend
   ↓
authenticate
   ↓
authorize("SUPER_ADMIN")
   ↓
User Controller
   ↓
User Service
   ↓
User Model
   ↓
MongoDB
```

Employees do not access these administration APIs.

------------------------------------------------------------------------

# 4. Backend Information

## Production Base URL

``` text
https://dms-s32w.onrender.com/api/v1
```

## Development Base URL

``` text
http://localhost:5000/api/v1
```

## User API Base Path

``` text
/user
```

Example:

``` text
https://dms-s32w.onrender.com/api/v1/user
```

------------------------------------------------------------------------

# 5. Authentication

The current frontend integration uses an HttpOnly-cookie authentication
setup.

The frontend must not read the HttpOnly authentication cookie with
JavaScript.

For `fetch`:

``` javascript
fetch(url, {
  credentials: "include"
});
```

For Axios:

``` javascript
axios.get(url, {
  withCredentials: true
});
```

For POST/PATCH/DELETE:

``` javascript
axios.patch(
  url,
  body,
  {
    withCredentials: true
  }
);
```

Do not put authentication tokens in the request body, URL, or query
parameters.

------------------------------------------------------------------------

# 6. User Data Model

The User model already exists in the Auth module.

Important fields:

``` json
{
  "_id": "USER_MONGODB_ID",
  "employeeId": "EMPLOYEE_MONGODB_ID",
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

Refresh-token data is stored securely and must not be exposed to the
frontend.

------------------------------------------------------------------------

# 7. User ID vs Employee ID

For:

``` text
/user/:userId
```

`:userId` means:

``` text
User._id
```

It does not mean `Employee.employeeId` and does not mean `Employee._id`.

For reporting-manager assignment, however:

``` text
reportingManager = Employee._id
```

because the reporting-manager relationship belongs to the Employee
record.

------------------------------------------------------------------------

# 8. API List

  -------------------------------------------------------------------------------------------------
  Method         Endpoint                            Purpose         Authorization   Status
  -------------- ----------------------------------- --------------- --------------- --------------
  GET            `/user`                             Get all users   SUPER_ADMIN     Tested

  GET            `/user/:userId`                     Get one user    SUPER_ADMIN     Tested

  PATCH          `/user/:userId`                     Update user     SUPER_ADMIN     Tested
                                                     account fields                  

  PATCH          `/user/:userId/status`              Change account  SUPER_ADMIN     Tested
                                                     status                          

  POST           `/user/:userId/reset-password`      Reset password  SUPER_ADMIN     Tested

  PATCH          `/user/:userId/reporting-manager`   Assign/remove   SUPER_ADMIN     Tested
                                                     reporting                       
                                                     manager                         

  DELETE         `/user/:userId`                     Remove user     SUPER_ADMIN     Tested
                                                     account                         
  -------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

# 9. GET All Users

## Endpoint

``` http
GET /user
```

Full URL:

``` text
https://dms-s32w.onrender.com/api/v1/user
```

Frontend:

``` javascript
fetch(
  "https://dms-s32w.onrender.com/api/v1/user",
  {
    method: "GET",
    credentials: "include"
  }
);
```

Success:

``` json
{
  "success": true,
  "message": "Users fetched successfully.",
  "data": []
}
```

The backend may populate `employeeId` with basic employee information.

Sensitive authentication data must not be displayed.

------------------------------------------------------------------------

# 10. GET User By ID

## Endpoint

``` http
GET /user/:userId
```

Example:

``` text
GET /user/USER_MONGODB_ID
```

The ID is `User._id`.

Success:

``` json
{
  "success": true,
  "message": "User fetched successfully.",
  "data": {
    "_id": "USER_MONGODB_ID",
    "employeeId": {
      "_id": "EMPLOYEE_MONGODB_ID",
      "employeeId": "EMP-001",
      "firstName": "Rahul",
      "lastName": "Patil",
      "email": "employee@company.com",
      "hierarchyLevel": "EMPLOYEE",
      "department": "DEPARTMENT_OBJECT_ID",
      "team": "TEAM_OBJECT_ID",
      "reportingManager": null,
      "status": "ACTIVE",
      "isRegistered": true
    },
    "email": "employee@company.com",
    "accountStatus": "ACTIVE",
    "isEmailVerified": true,
    "failedLoginAttempts": 0,
    "lockUntil": null,
    "passwordChangedAt": null,
    "lastLogin": null
  }
}
```

------------------------------------------------------------------------

# 11. Update User

## Endpoint

``` http
PATCH /user/:userId
```

Current account-level fields:

``` text
email
accountStatus
```

Example:

``` json
{
  "email": "newemail@company.com"
}
```

or:

``` json
{
  "accountStatus": "ACTIVE"
}
```

Do not send through this generic endpoint:

``` text
password
refreshTokenHash
failedLoginAttempts
lockUntil
passwordChangedAt
lastLogin
employeeId
```

Password changes use the dedicated reset-password endpoint.

Success:

``` json
{
  "success": true,
  "message": "User updated successfully.",
  "data": {}
}
```

Refresh user data after the update.

------------------------------------------------------------------------

# 12. Update User Account Status

## Endpoint

``` http
PATCH /user/:userId/status
```

Allowed values:

``` text
ACTIVE
INACTIVE
SUSPENDED
```

Example:

``` json
{
  "accountStatus": "INACTIVE"
}
```

Activate:

``` json
{
  "accountStatus": "ACTIVE"
}
```

Suspend:

``` json
{
  "accountStatus": "SUSPENDED"
}
```

Success:

``` json
{
  "success": true,
  "message": "User account status updated successfully.",
  "data": {}
}
```

Important difference:

``` text
Employee.status
    ↓
Organization-level employee status

User.accountStatus
    ↓
System account/login status
```

Do not treat them as the same field.

------------------------------------------------------------------------

# 13. Reset User Password

## Endpoint

``` http
POST /user/:userId/reset-password
```

Request:

``` json
{
  "newPassword": "NewPassword@123"
}
```

Minimum password length:

``` text
8 characters
```

Backend processing:

``` text
Super Admin
    ↓
Find User
    ↓
Hash new password
    ↓
Update passwordChangedAt
    ↓
Reset failed login attempts
    ↓
Clear account lock
    ↓
Invalidate existing refresh-token hash
    ↓
Save User
```

Success:

``` json
{
  "success": true,
  "message": "User password reset successfully.",
  "data": {}
}
```

Password must never be returned in the response.

------------------------------------------------------------------------

# 14. Assign Reporting Manager

## Endpoint

``` http
PATCH /user/:userId/reporting-manager
```

Request:

``` json
{
  "reportingManager": "MANAGER_EMPLOYEE_MONGODB_ID"
}
```

Important:

`reportingManager` is an **Employee.\_id**, not a User.\_id.

Remove manager:

``` json
{
  "reportingManager": null
}
```

Self-reporting is rejected:

``` text
Employee A
   ↓
Reporting Manager
   ↓
Employee A
```

Error:

``` json
{
  "success": false,
  "errorName": "ApiError",
  "message": "Employee cannot report to themselves.",
  "errors": []
}
```

Success:

``` json
{
  "success": true,
  "message": "Reporting manager assigned successfully.",
  "data": {}
}
```

------------------------------------------------------------------------

# 15. Remove User Account

## Endpoint

``` http
DELETE /user/:userId
```

Success:

``` json
{
  "success": true,
  "message": "User removed successfully."
}
```

This removes the **User account**.

It is different from:

``` text
DELETE /employee/:employeeId
```

Deleting a User does not mean the linked Employee record is
automatically deleted unless that behavior is explicitly implemented.

------------------------------------------------------------------------

# 16. Error Handling

## 401 Unauthorized

Authentication is missing, invalid, or expired.

Frontend should handle the existing authentication/refresh flow.

## 403 Forbidden

Example:

``` json
{
  "success": false,
  "message": "You are not authorized"
}
```

The user is authenticated but does not have permission.

Current User Management authorization:

``` text
SUPER_ADMIN
```

## 404 User Not Found

``` json
{
  "success": false,
  "errorName": "ApiError",
  "message": "User not found.",
  "errors": []
}
```

## 409 Duplicate Email

``` text
User email already exists.
```

## 400 Self Reporting

``` text
Employee cannot report to themselves.
```

------------------------------------------------------------------------

# 17. Frontend User Management Flow

## User List

``` text
Super Admin
     ↓
Open User Management
     ↓
GET /user
     ↓
Display users
```

Recommended visible information:

``` text
Employee Name
Employee ID
Email
Hierarchy Level
Department
Team
Account Status
Email Verification
Last Login
```

Never display:

``` text
Password
Refresh Token Hash
Other secret authentication data
```

## User Details

``` text
User List
    ↓
Select User
    ↓
GET /user/:userId
    ↓
Display details
```

## Disable Account

``` text
PATCH /user/:userId/status

{
  "accountStatus": "INACTIVE"
}
```

Then refresh user data.

## Activate Account

``` text
PATCH /user/:userId/status

{
  "accountStatus": "ACTIVE"
}
```

Then refresh user data.

## Suspend Account

``` text
PATCH /user/:userId/status

{
  "accountStatus": "SUSPENDED"
}
```

Then refresh user data.

## Reset Password

``` text
User Details
    ↓
Reset Password
    ↓
Enter new password
    ↓
POST /user/:userId/reset-password
```

## Reporting Manager

``` text
User Details
    ↓
Select reporting manager
    ↓
Send Employee._id
    ↓
PATCH /user/:userId/reporting-manager
    ↓
Refresh user data
```

------------------------------------------------------------------------

# 18. Frontend Rules

``` text
1. Use User._id for /user/:userId routes.

2. Do not use Employee._id as :userId.

3. For reportingManager, send Employee._id.

4. Do not send department/team names when an ObjectId reference is required.

5. Do not manually modify authentication fields.

6. Do not send passwords through generic PATCH /user/:userId.

7. Use reset-password for password changes.

8. Treat reportingManager as nullable.

9. Do not assume every employee has a reporting manager.

10. Refresh user data after update/status/password/manager changes.

11. Handle HTTP 401 separately from HTTP 403.

12. Do not expose password or refresh-token data.

13. Use HttpOnly-cookie credentials for browser requests.

14. Do not read authentication cookies using JavaScript.
```

------------------------------------------------------------------------

# 19. User Management vs Employee Management

  Employee Management   User Management
  --------------------- ---------------------------
  Employee record       System account
  Employee ID           User `_id`
  First name            Email/account information
  Last name             Account status
  Hierarchy             Email verification
  Department            Login security
  Team                  Last login
  Reporting manager     Password reset
  Employee status       Account disable/suspend
  Registration status   User removal

Relationship:

``` text
Employee
   ↑
   |
User.employeeId
   |
User
```

Do not duplicate Employee CRUD inside the User Management UI.

------------------------------------------------------------------------

# 20. Current Tested Status

``` text
GET All Users
    ✅

GET User By ID
    ✅

UPDATE User
    ✅

UPDATE User Account Status
    ✅

RESET Password
    ✅

ASSIGN Reporting Manager
    ✅

REMOVE User
    ✅
```

The reporting-manager API was tested for the self-reporting validation.
The backend correctly rejected assigning an employee as their own
manager. The operation succeeded after using a different Employee as the
manager.

------------------------------------------------------------------------

# 21. Current Architecture

``` text
                    EGKMS
                      |
          +-----------+-----------+
          |                       |
          ↓                       ↓
Employee Management        User Management
          |                       |
          ↓                       ↓
Employee Model               User Model
          |                       |
          |                    Auth Model
          |                       |
          +-----------+-----------+
                      |
                      ↓
                   MongoDB
```

User and Employee are related, but they are separate records.

------------------------------------------------------------------------

# 22. Transfer User

The FRS mentions:

``` text
Transfer Users
```

but the exact API contract, request fields, and detailed transfer rules
are not specified in the current FRS.

Therefore, the current backend does not invent a transfer API.

It should be defined when the organization/hierarchy transfer design is
implemented.

------------------------------------------------------------------------

# 23. Next Module

User Management is complete.

Next planned backend work:

``` text
Department Management
        ↓
Team Management
```

These are important because Employee records reference:

``` text
Employee.department → Department._id
Employee.team       → Team._id
```

------------------------------------------------------------------------

# 24. Frontend Quick Reference

``` text
BASE URL
https://dms-s32w.onrender.com/api/v1

USER BASE PATH
/user

GET ALL
GET /user

GET ONE
GET /user/:userId

UPDATE
PATCH /user/:userId

STATUS
PATCH /user/:userId/status

RESET PASSWORD
POST /user/:userId/reset-password

REPORTING MANAGER
PATCH /user/:userId/reporting-manager

DELETE USER
DELETE /user/:userId
```

Authentication for browser requests:

``` text
credentials: "include"
```

or Axios:

``` text
withCredentials: true
```

Authorization:

``` text
SUPER_ADMIN
```
