# EGKMS Employee Management API Documentation

## Project

**Enterprise Governance & Knowledge Management System (EGKMS)**

## Module

**Employee Management**

## Current Status

```text
Employee Management Base: COMPLETED AND TESTED
```

The Employee Management module currently provides employee creation, retrieval, update, status management, department/team references, and company-controlled registration linkage.

> This document describes the **currently implemented and tested backend behavior**. Features that have not yet been implemented or tested are marked separately.

---

# 1. Backend Information

## Base URL

Production Backend:

```text
https://dms-s32w.onrender.com/api/v1
```

Development Backend (local):

```text
http://localhost:5000/api/v1
```

## Employee API Base Path

```text
/employee
```

Therefore:

```text
http://localhost:5000/api/v1/employee
```

---

# 2. Authentication and Authorization

Employee Management APIs are protected.

Frontend must send the JWT access token in the request header:

```http
Authorization: Bearer <ACCESS_TOKEN>
```

Example:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## Current Authorization

The current Employee routes are restricted to:

```text
SUPER_ADMIN
```

Current request flow:

```text
Frontend Request
      |
      ↓
authenticate
      |
      ↓
JWT Access Token Validation
      |
      ↓
authorize("SUPER_ADMIN")
      |
      ↓
Employee Controller
      |
      ↓
Employee Service
      |
      ↓
MongoDB
```

If authentication fails, the backend returns an authentication error.

If authorization fails, the backend returns:

```json
{
  "success": false,
  "message": "You are not authorized"
}
```

---

# 3. Employee Data Structure

Employee data is stored separately from authentication data.

The Employee collection stores organization-level employee information.

Current Employee structure:

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
  "createdBy": "USER_OBJECT_ID"
}
```

## Important

Employee does **not** store:

```text
password
refreshToken
authentication credentials
```

Authentication information belongs to the User/Auth module.

---

# 4. Organizational References

## Hierarchy

The project uses the following hierarchy:

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

Every employee has a hierarchy level.

---

## Department

Employee `department` is a MongoDB ObjectId reference to the Department model.

Example:

```json
{
  "department": "6a7178421c73966a2997d72b"
}
```

Frontend must send the Department `_id`, not the department name.

Incorrect:

```json
{
  "department": "Information Technology"
}
```

Correct:

```json
{
  "department": "DEPARTMENT_OBJECT_ID"
}
```

---

## Team

Employee `team` is a MongoDB ObjectId reference to the Team model.

Frontend must send the Team `_id`, not the team name.

Incorrect:

```json
{
  "team": "Backend Development"
}
```

Correct:

```json
{
  "team": "TEAM_OBJECT_ID"
}
```

---

## Reporting Manager

Employee `reportingManager` is a MongoDB ObjectId reference to another Employee.

Example:

```json
{
  "reportingManager": "MANAGER_EMPLOYEE_OBJECT_ID"
}
```

If no reporting manager is currently assigned:

```json
{
  "reportingManager": null
}
```

A Super Admin may also have:

```text
department       = null
team             = null
reportingManager = null
```

This is valid for the current implementation.

---

# 5. Employee Registration Relationship

Employee creation and User registration are separate operations.

Flow:

```text
Super Admin
     |
     ↓
Create Employee
     |
     ↓
Employee Record
isRegistered = false
     |
     ↓
Employee uses company-created email
     |
     ↓
OTP Verification
     |
     ↓
User Registration
     |
     ↓
User Account Created
     |
     ↓
Employee.isRegistered = true
```

The User account is linked to the Employee using:

```text
User.employeeId
       ↓
Employee._id
```

Frontend should not create the Employee/User relationship manually.

---

# 6. API Endpoints

| Method | Endpoint | Authentication | Authorization | Status |
|---|---|---|---|---|
| POST | `/employee` | Required | SUPER_ADMIN | Tested |
| GET | `/employee` | Required | SUPER_ADMIN | Tested |
| GET | `/employee/email/:email` | Required | SUPER_ADMIN | Implemented |
| GET | `/employee/:employeeId` | Required | SUPER_ADMIN | Tested |
| PATCH | `/employee/:employeeId` | Required | SUPER_ADMIN | Tested |
| PATCH | `/employee/:employeeId/status` | Required | SUPER_ADMIN | Tested |
| DELETE | `/employee/:employeeId` | HttpOnly Cookie | SUPER_ADMIN | Tested |

> `:employeeId` in the current route means the MongoDB Employee `_id`, because the backend uses `Employee.findById()`.

---

# 7. Create Employee

## Endpoint

```http
POST /employee
```

Full URL:

```text
http://localhost:5000/api/v1/employee
```

## Request Configuration

Because authentication uses HttpOnly cookies:

```js
credentials: "include"
```

For Axios:

```js
withCredentials: true
```

For JSON requests, also send:

```http
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

`reportingManager` is optional in the current create flow.

If no manager is assigned, it remains:

```json
{
  "reportingManager": null
}
```

## Backend Processing

```text
Request
   ↓
Validate request
   ↓
Check duplicate Employee ID
   ↓
Check duplicate email
   ↓
Validate reporting manager if provided
   ↓
Normalize Employee ID
   ↓
Normalize email
   ↓
Create Employee
   ↓
status = ACTIVE
   ↓
isRegistered = false
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

# 8. Get All Employees

## Endpoint

```http
GET /employee
```

## Request Configuration

Use:

```js
credentials: "include"
```

or with Axios:

```js
withCredentials: true
```

## Optional Filters

The backend currently supports:

```text
hierarchyLevel
department
team
status
```

Examples:

```http
GET /employee?hierarchyLevel=EMPLOYEE
```

```http
GET /employee?department=DEPARTMENT_OBJECT_ID
```

```http
GET /employee?team=TEAM_OBJECT_ID
```

```http
GET /employee?status=ACTIVE
```

Multiple filters can be combined:

```http
GET /employee?hierarchyLevel=EMPLOYEE&status=ACTIVE
```

## Backend Query

The backend creates a MongoDB query from the provided filters.

It then populates:

```text
department
team
reportingManager
```

and sorts employees by:

```text
createdAt DESC
```

Therefore, newest employees are returned first.

## Expected Success Response

```json
{
  "success": true,
  "message": "Employees fetched successfully.",
  "data": [
    {
      "_id": "EMPLOYEE_OBJECT_ID",
      "employeeId": "EMP-001",
      "firstName": "Rahul",
      "lastName": "Patil",
      "email": "employee@company.com",
      "hierarchyLevel": "EMPLOYEE",
      "department": {
        "_id": "DEPARTMENT_OBJECT_ID",
        "name": "Information Technology",
        "code": "IT",
        "status": "ACTIVE"
      },
      "team": {
        "_id": "TEAM_OBJECT_ID",
        "name": "Backend Development",
        "status": "ACTIVE"
      },
      "reportingManager": null,
      "status": "ACTIVE",
      "isRegistered": true,
      "createdBy": "USER_OBJECT_ID",
      "createdAt": "2026-08-04T05:19:45.246Z",
      "updatedAt": "2026-08-04T06:36:44.722Z"
    }
  ]
}
```

---

# 9. Get Employee By ID

## Endpoint

```http
GET /employee/:employeeId
```

Example:

```http
GET /employee/EMPLOYEE_MONGODB_OBJECT_ID
```

## Important

The current backend expects the MongoDB Employee `_id`.

It does **not** currently expect the business Employee ID such as:

```text
EMP-001
```

Current backend logic:

```text
Employee.findById(employeeId)
```

## Request Configuration

Use:

```js
credentials: "include"
```

or with Axios:

```js
withCredentials: true
```

## Populated Response

The API populates:

```text
department
team
reportingManager
```

Example:

```json
{
  "success": true,
  "message": "Employee fetched successfully.",
  "data": {
    "_id": "EMPLOYEE_MONGODB_OBJECT_ID",
    "employeeId": "EMP-001",
    "firstName": "Rahul",
    "lastName": "Patil",
    "email": "employee@company.com",
    "hierarchyLevel": "EMPLOYEE",
    "department": {
      "_id": "DEPARTMENT_OBJECT_ID",
      "name": "Information Technology",
      "code": "IT",
      "status": "ACTIVE"
    },
    "team": {
      "_id": "TEAM_OBJECT_ID",
      "name": "Backend Development",
      "status": "ACTIVE"
    },
    "reportingManager": null,
    "status": "ACTIVE",
    "isRegistered": true
  }
}
```

If the employee has no reporting manager:

```json
{
  "reportingManager": null
}
```

---

# 10. Get Employee By Email

## Endpoint

```http
GET /employee/email/:email
```

Example:

```http
GET /employee/email/employee@company.com
```

## Request Configuration

Use:

```js
credentials: "include"
```

or with Axios:

```js
withCredentials: true
```

The backend normalizes the email before searching:

```text
lowercase
+
trim
```

If the employee is not found, the current service returns `null`.

---

# 11. Update Employee

## Endpoint

```http
PATCH /employee/:employeeId
```

Example:

```http
PATCH /employee/EMPLOYEE_MONGODB_OBJECT_ID
```

## Request Configuration

Because authentication uses HttpOnly cookies:

```js
credentials: "include"
```

For Axios:

```js
withCredentials: true
```

For JSON requests, also send:

```http
Content-Type: application/json
```

## Request Body

Only the fields that need to be changed should be sent.

Example:

```json
{
  "firstName": "Rahul",
  "lastName": "Patil",
  "hierarchyLevel": "EMPLOYEE",
  "department": "DEPARTMENT_OBJECT_ID",
  "team": "TEAM_OBJECT_ID",
  "status": "ACTIVE"
}
```

## Update Rules

### Email

If email is updated:

```text
lowercase
+
trim
```

The backend checks for duplicate email.

### Employee ID

If Employee ID is updated:

```text
trim
+
uppercase
```

The backend checks for duplicate Employee ID.

### Reporting Manager

If a reporting manager is supplied:

```text
Employee cannot report to themselves.
```

The referenced Employee must exist.

### Registration State

The frontend cannot directly update:

```text
isRegistered
```

The backend removes this field from generic employee updates.

Therefore do not send:

```json
{
  "isRegistered": true
}
```

---

# 12. Update Employee Status

## Endpoint

```http
PATCH /employee/:employeeId/status
```

## Request Configuration

Because authentication uses HttpOnly cookies:

```js
credentials: "include"
```

For Axios:

```js
withCredentials: true
```

For JSON requests, also send:

```http
Content-Type: application/json
```

## Request Body

To deactivate:

```json
{
  "status": "INACTIVE"
}
```

To activate:

```json
{
  "status": "ACTIVE"
}
```

## Example Success Response

```json
{
  "success": true,
  "message": "Employee status updated successfully.",
  "data": {
    "_id": "EMPLOYEE_MONGODB_OBJECT_ID",
    "employeeId": "EMP-001",
    "firstName": "Rahul",
    "lastName": "Patil",
    "status": "INACTIVE",
    "isRegistered": true
  }
}
```

The status update does not remove the Employee record.

---

# 13. Delete Employee

## Endpoint

```http
DELETE /employee/:employeeId
```

## Request Configuration

Use:

```js
credentials: "include"
```

or with Axios:

```js
withCredentials: true
```

## Current Behavior

The service:

```text
Find Employee
      ↓
If not found → 404
      ↓
Delete Employee
      ↓
Return success
```

## Expected Success Response

```json
{
  "success": true,
  "message": "Employee deleted successfully."
}
```

> This endpoint is implemented but has not yet been manually tested in the current development session.

---

# 14. Department and Team Population

The Employee APIs use MongoDB references.

Employee:

```text
department → Department._id
team       → Team._id
```

When fetching an employee, the backend uses:

```text
populate("department")
populate("team")
```

Therefore the frontend receives complete basic Department/Team information in GET responses.

Example:

```json
"department": {
  "_id": "DEPARTMENT_OBJECT_ID",
  "name": "Information Technology",
  "code": "IT",
  "status": "ACTIVE"
}
```

and:

```json
"team": {
  "_id": "TEAM_OBJECT_ID",
  "name": "Backend Development",
  "status": "ACTIVE"
}
```

The update/create responses may contain the ObjectId reference rather than the populated object. The frontend should not assume every endpoint returns the same populated shape.

---

# 15. Frontend Form Requirements

For the Employee Create/Edit form, frontend should provide fields for:

```text
Employee ID
First Name
Last Name
Email
Hierarchy Level
Department
Team
Reporting Manager
Status
```

However, the currently implemented create request uses:

```text
employeeId
firstName
lastName
email
hierarchyLevel
department
team
```

Reporting Manager can remain unassigned when not available.

For dropdowns:

```text
Department dropdown
        ↓
Display Department.name
        ↓
Send Department._id
```

Team:

```text
Team dropdown
        ↓
Display Team.name
        ↓
Send Team._id
```

Reporting Manager:

```text
Employee/Manager dropdown
        ↓
Display employee name
        ↓
Send Employee._id
```

Do not send display names where ObjectIds are required.

---

# 16. Frontend Error Handling

The frontend should handle standard backend errors.

## Unauthorized

```json
{
  "success": false,
  "message": "You are not authorized"
}
```

Show an appropriate permission message.

## Employee Not Found

```text
HTTP 404
```

Show:

```text
Employee not found.
```

## Duplicate Employee ID

```text
HTTP 409
```

Message:

```text
Employee ID already exists.
```

## Duplicate Email

```text
HTTP 409
```

Message:

```text
Employee email already exists.
```

## Invalid Reporting Manager

```text
HTTP 404
```

Message:

```text
Reporting manager not found.
```

## Self Reporting

```text
HTTP 400
```

Message:

```text
Employee cannot report to themselves.
```

---

# 17. Frontend Employee Management Flow

## Create Employee

```text
Super Admin opens Employee Management
        ↓
Click Create Employee
        ↓
Load Department list
        ↓
Load Team list
        ↓
Fill Employee information
        ↓
Select Department
        ↓
Select Team
        ↓
Submit
        ↓
POST /employee
        ↓
Employee created
        ↓
isRegistered = false
```

## Employee Registration

```text
Employee record already exists
        ↓
Employee receives/uses company email
        ↓
Send OTP
        ↓
Verify OTP
        ↓
Register User account
        ↓
Employee.isRegistered = true
```

## Edit Employee

```text
Employee List
      ↓
Select Employee
      ↓
GET /employee/:employeeId
      ↓
Display populated Department/Team
      ↓
Edit fields
      ↓
PATCH /employee/:employeeId
      ↓
Refresh employee details
```

## Activate/Deactivate

```text
Employee List
      ↓
Toggle status
      ↓
PATCH /employee/:employeeId/status
      ↓
ACTIVE / INACTIVE
```

---

# 18. Current Tested Employee Scenario

The Employee Management module has been tested with:

```text
Employee ID:
EMP-001

Hierarchy:
EMPLOYEE

Department:
Information Technology

Department Code:
IT

Team:
Backend Development

Reporting Manager:
null

Status:
ACTIVE / INACTIVE tested

Registration:
isRegistered = true
```

The following were successfully tested:

```text
Create Employee             ✅
Get All Employees           ✅
Get Employee By ID          ✅
Department Populate         ✅
Team Populate               ✅
Update Employee             ✅
Update Employee Status      ✅
```

Reporting Manager population has not yet been tested with an actual manager relationship.

Delete Employee has not yet been manually tested.

---

# 19. FRS Alignment

The FRS defines an organizational hierarchy:

```text
Super Admin
↓
Governance
↓
Executive
↓
Department
↓
Manager
↓
Team Lead
↓
Team
↓
Employee
↓
Intern
```

It also defines that users belong to a hierarchy level, department, optional team, and reporting manager.

The Employee Management module provides the backend foundation for these organizational relationships.

The FRS also states that Super Admin is responsible for organization management, including creating employees, departments, teams, assigning reporting managers, and managing users.

The access-control design in the FRS is layered:

```text
Authentication
↓
Hierarchy Validation
↓
Role Validation
↓
Department Validation
↓
Manager Validation
↓
Team Validation
↓
ACL Validation
↓
Permission Validation
↓
Allow / Deny
```

The current Employee routes currently enforce authentication and SUPER_ADMIN authorization. More granular hierarchy/department/team/manager-level authorization will be part of the later access-control implementation.

---

# 20. Important Frontend Rules

```text
1. Do NOT send Authorization: Bearer <ACCESS_TOKEN> manually.
2. Authentication tokens are stored in HttpOnly cookies.
3. The browser automatically sends the authentication cookie with authenticated requests.
4. Use credentials: "include" with fetch.
5. Use withCredentials: true with Axios.
6. Do not send department names; send Department._id.
7. Do not send team names; send Team._id.
8. Do not manually set isRegistered.
9. Do not manually set User authentication fields.
10. Treat reportingManager as nullable.
11. Use MongoDB Employee._id for the current :employeeId route.
12. GET endpoints may return populated Department/Team objects.
13. Create/Update endpoints may return ObjectId references.
14. Handle 401 and 403 responses properly.
15. Refresh employee data after update/status changes.
16. Do not assume reportingManager exists for every employee.
17. Never try to read the authentication token using document.cookie because it is HttpOnly.
```

---

# 21. Current Module Status

```text
Employee Model
        ↓
COMPLETED ✅

Employee Validator
        ↓
COMPLETED ✅

Employee Service
        ↓
COMPLETED ✅

Employee Controller
        ↓
COMPLETED ✅

Employee Routes
        ↓
COMPLETED ✅

Department Reference
        ↓
TESTED ✅

Team Reference
        ↓
TESTED ✅

Employee CRUD Base
        ↓
TESTED ✅

Delete Employee
        ↓
TESTED ✅

Reporting Manager Relationship
        ↓
NOT YET FULLY TESTED ⏳

Fine-grained RBAC / ACL
        ↓
NOT YET IMPLEMENTED ⏳
```

---

# 22. Next Backend Work

After the Employee Management base is stable, the next work should be planned according to the FRS and existing architecture.

Potential next areas include:

```text
Reporting Manager / hierarchy relationship testing
        ↓
Department Management
        ↓
Team Management
        ↓
Fine-grained Access Control / Permissions
        ↓
Document Management
        ↓
Workflow / Approval
        ↓
Version Control
        ↓
Audit Logging
```

These should be implemented incrementally and verified against the FRS before major architectural changes.
