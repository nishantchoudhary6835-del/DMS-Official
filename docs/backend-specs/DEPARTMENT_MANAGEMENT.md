# Department Management

## 1. Module Overview

Department Management is responsible for managing the **Department level** of the EGKMS organizational hierarchy.

The module provides APIs for:

* Creating departments
* Viewing all departments
* Viewing a department by ID
* Updating department information
* Assigning a Department Head
* Removing a Department Head
* Activating/deactivating departments
* Deleting departments
* Preventing deletion when employees are assigned to a department

The Department module is an organizational-structure module. It is not responsible for document approval, document workflow, or document lifecycle management.

---

# 2. Purpose

The purpose of Department Management is to maintain the organizational department structure used throughout EGKMS.

The FRS defines the organizational hierarchy as:

```text
Super Admin
    ↓
Governance Layer
    ↓
Executive Layer
    ↓
Departments
    ↓
Managerial Layer
    ↓
Team Lead
    ↓
Teams
    ↓
Employees
    ↓
Interns
```

Every user belongs to:

* One hierarchy level
* One Department
* One Team (optional)
* One Reporting Manager

The Department entity is therefore referenced by Employee and Team records.

---

# 3. Access and Authorization

## 3.1 FRS-Level Responsibility

According to the FRS, the Super Admin has complete platform control and can:

* Create Departments
* Create Department Heads
* Create Managers
* Create Team Leads
* Create Teams
* Create Employees
* Create Interns

The Executive Layer can:

* Create Departments
* Create Department Heads
* Create Department Documents
* Create Operational Documents
* Create Process Improvement Documents

Therefore, Department creation is required for both Super Admin and Executive responsibilities defined in the FRS.

---

## 3.2 Current Backend Authorization

The current Department routes use:

```javascript
authenticate,
authorize("SUPER_ADMIN", "EXECUTIVE")
```

Therefore the current Department Management APIs are accessible to:

```text
SUPER_ADMIN
EXECUTIVE
```

Other hierarchy levels are not currently authorized through these Department routes.

### Important

The FRS describes a future layered Access Control Engine:

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

The current Department module only represents the authorization currently implemented in the backend. It should not be treated as the final fine-grained RBAC/ACL implementation.

---

# 4. Authentication

All Department APIs require authentication.

The frontend does **not** manually send:

```http
Authorization: Bearer <ACCESS_TOKEN>
```

The access token is stored in an **HttpOnly cookie**.

The browser automatically sends the cookie with authenticated requests.

## Fetch

```javascript
fetch("http://localhost:5000/api/v1/department", {
  credentials: "include"
});
```

## Axios

```javascript
axios.get(
  "http://localhost:5000/api/v1/department",
  {
    withCredentials: true
  }
);
```

### Important Frontend Rules

* Do not read the authentication cookie using JavaScript.
* Do not use `document.cookie` to access the access token.
* Do not manually add an Authorization header.
* Use `credentials: "include"` with Fetch.
* Use `withCredentials: true` with Axios.

---

# 5. Backend URLs

## 5.1 Local Development

```text
http://localhost:5000/api/v1
```

Department base path:

```text
/department
```

Complete local base URL:

```text
http://localhost:5000/api/v1/department
```

## 5.2 Production

```text
https://dms-s32w.onrender.com/api/v1
```

Department base URL:

```text
https://dms-s32w.onrender.com/api/v1/department
```

---

# 6. Department Data Model

Current Department model:

```javascript
{
  name,
  code,
  head,
  status,
  createdBy,
  createdAt,
  updatedAt
}
```

Example:

```json
{
  "_id": "6a7484993e4bd3344585bbe2",
  "name": "Human Resources & Administration",
  "code": "HRA",
  "head": null,
  "status": "ACTIVE",
  "createdBy": "6a709395067edbac89537d0f",
  "createdAt": "2026-08-06T12:56:57.507Z",
  "updatedAt": "2026-08-06T13:02:41.250Z"
}
```

---

# 7. Department Fields

## 7.1 name

Department name.

Example:

```json
{
  "name": "Human Resources"
}
```

Rules:

* Required
* String
* Trimmed

---

## 7.2 code

Unique department code.

Example:

```json
{
  "code": "HR"
}
```

Rules:

* Required
* Unique
* Trimmed
* Stored in uppercase

Example:

```text
hr
```

becomes:

```text
HR
```

---

## 7.3 head

MongoDB reference to the Employee who is the Department Head.

Schema relationship:

```text
Department.head
       ↓
Employee._id
```

Example:

```json
{
  "head": "6a717671cfc15fe117146bce"
}
```

The frontend must send the Employee MongoDB `_id`.

Do not send:

```json
{
  "head": "Rahul Patil"
}
```

Correct:

```json
{
  "head": "EMPLOYEE_MONGODB_OBJECT_ID"
}
```

The field is nullable:

```json
{
  "head": null
}
```

A department can therefore exist without a Department Head initially.

---

## 7.4 status

Supported values:

```text
ACTIVE
INACTIVE
```

Default:

```text
ACTIVE
```

Example:

```json
{
  "status": "ACTIVE"
}
```

---

## 7.5 createdBy

MongoDB reference to the User who created the Department.

Relationship:

```text
Department.createdBy
        ↓
User._id
```

The frontend should **not manually send `createdBy`**.

The backend obtains the authenticated user's information.

---

## 7.6 createdAt

Automatically generated timestamp.

Frontend should not send this field.

---

## 7.7 updatedAt

Automatically updated timestamp.

Frontend should not send this field.

---

# 8. Department and Employee Relationship

There are two separate relationships.

## Department → Department Head

```text
Department
    |
    └── head
          ↓
       Employee
```

## Employee → Department

```text
Employee
    |
    └── department
          ↓
       Department
```

These are separate MongoDB references.

For example:

```text
Department.head
        ↓
Employee._id
```

does not automatically mean:

```text
Employee.department
        ↓
Department._id
```

The frontend should treat these relationships separately.

---

# 9. Department and Team Relationship

Team belongs to a Department.

Relationship:

```text
Department
    ↓
Team
```

The Team model uses:

```text
Team.department → Department._id
```

Therefore Department Management should be completed before Team Management.

The frontend should use the Department `_id` when creating or updating a Team.

---

# 10. API Quick Reference

| Method | Endpoint                           | Purpose                  |
| ------ | ---------------------------------- | ------------------------ |
| POST   | `/department`                      | Create Department        |
| GET    | `/department`                      | Get All Departments      |
| GET    | `/department/:departmentId`        | Get Department By ID     |
| PATCH  | `/department/:departmentId`        | Update Department        |
| PATCH  | `/department/:departmentId/status` | Update Department Status |
| DELETE | `/department/:departmentId`        | Delete Department        |

All current Department routes require:

```text
Authentication
+
SUPER_ADMIN or EXECUTIVE authorization
```

---

# 11. Create Department

## Endpoint

```http
POST /api/v1/department
```

Local:

```http
POST http://localhost:5000/api/v1/department
```

Production:

```http
POST https://dms-s32w.onrender.com/api/v1/department
```

## Request Body

```json
{
  "name": "Human Resources",
  "code": "HR"
}
```

Optional Department Head:

```json
{
  "name": "Human Resources",
  "code": "HR",
  "head": "EMPLOYEE_MONGODB_OBJECT_ID"
}
```

## Do Not Send

Do not manually send:

```text
createdBy
createdAt
updatedAt
__v
```

The backend manages these values.

---

# 12. Create Department Response

Actual tested response:

```json
{
  "success": true,
  "message": "Department created successfully.",
  "data": {
    "name": "Human Resources",
    "code": "HR",
    "head": null,
    "status": "ACTIVE",
    "createdBy": "6a709395067edbac89537d0f",
    "_id": "6a7484993e4bd3344585bbe2",
    "createdAt": "2026-08-06T12:56:57.507Z",
    "updatedAt": "2026-08-06T12:56:57.507Z",
    "__v": 0
  }
}
```

---

# 13. Get All Departments

## Endpoint

```http
GET /api/v1/department
```

Local:

```http
GET http://localhost:5000/api/v1/department
```

## Response

```json
{
  "success": true,
  "message": "Departments fetched successfully.",
  "data": [
    {
      "_id": "DEPARTMENT_OBJECT_ID",
      "name": "Human Resources",
      "code": "HR",
      "head": null,
      "status": "ACTIVE",
      "createdBy": "USER_OBJECT_ID",
      "createdAt": "DATE",
      "updatedAt": "DATE"
    }
  ]
}
```

The response contains an array because multiple departments can exist.

---

# 14. Get Department By ID

## Endpoint

```http
GET /api/v1/department/:departmentId
```

The `departmentId` must be the MongoDB Department `_id`.

Example:

```http
GET http://localhost:5000/api/v1/department/6a7484993e4bd3344585bbe2
```

## Response

```json
{
  "success": true,
  "message": "Department fetched successfully.",
  "data": {
    "_id": "6a7484993e4bd3344585bbe2",
    "name": "Human Resources & Administration",
    "code": "HRA",
    "head": null,
    "status": "ACTIVE",
    "createdBy": "6a709395067edbac89537d0f",
    "createdAt": "2026-08-06T12:56:57.507Z",
    "updatedAt": "2026-08-06T13:02:41.250Z",
    "__v": 0
  }
}
```

---

# 15. Update Department

## Endpoint

```http
PATCH /api/v1/department/:departmentId
```

Example:

```http
PATCH http://localhost:5000/api/v1/department/6a7484993e4bd3344585bbe2
```

## Request Body

```json
{
  "name": "Human Resources & Administration",
  "code": "HRA"
}
```

Only the supplied fields should be updated.

---

# 16. Assign Department Head

The Department Head is assigned using the same update endpoint.

## Endpoint

```http
PATCH /api/v1/department/:departmentId
```

## Request Body

```json
{
  "head": "6a717671cfc15fe117146bce"
}
```

The value is the MongoDB `_id` of the Employee.

## Response

The current implementation populates the Department Head in the response.

Example:

```json
{
  "success": true,
  "message": "Department updated successfully.",
  "data": {
    "_id": "6a7484993e4bd3344585bbe2",
    "name": "Human Resources & Administration",
    "code": "HRA",
    "head": {
      "_id": "6a717671cfc15fe117146bce",
      "employeeId": "EMP-001",
      "firstName": "Rahul",
      "lastName": "Patil",
      "email": "gawandekiran39@gmail.com",
      "hierarchyLevel": "EMPLOYEE",
      "status": "ACTIVE"
    },
    "status": "ACTIVE",
    "createdBy": "6a709395067edbac89537d0f",
    "createdAt": "2026-08-06T12:56:57.507Z",
    "updatedAt": "2026-08-06T13:04:57.407Z",
    "__v": 0
  }
}
```

---

# 17. Remove Department Head

To remove the current Department Head:

```http
PATCH /api/v1/department/:departmentId
```

Request:

```json
{
  "head": null
}
```

Expected:

```json
{
  "head": null
}
```

This only removes the Department's `head` reference.

It does not automatically modify the Employee's `department` field.

---

# 18. Update Department Status

## Endpoint

```http
PATCH /api/v1/department/:departmentId/status
```

## Deactivate

```json
{
  "status": "INACTIVE"
}
```

## Activate

```json
{
  "status": "ACTIVE"
}
```

Example:

```http
PATCH http://localhost:5000/api/v1/department/DEPARTMENT_OBJECT_ID/status
```

After changing status, frontend should refresh the Department data.

---

# 19. Delete Department

## Endpoint

```http
DELETE /api/v1/department/:departmentId
```

Example:

```http
DELETE http://localhost:5000/api/v1/department/DEPARTMENT_OBJECT_ID
```

## Successful Response

```json
{
  "success": true,
  "message": "Department deleted successfully."
}
```

---

# 20. Department Delete Protection

The backend prevents deletion when Employees are assigned to the Department.

Flow:

```text
Delete Department
       ↓
Check Employee.department
       ↓
Is an Employee assigned?
       ↓
   YES        NO
    ↓          ↓
 Block       Delete
```

If an Employee is using the Department:

```json
{
  "success": false,
  "errorName": "Error",
  "message": "Department cannot be deleted because employees are assigned to it.",
  "errors": []
}
```

This behavior was successfully tested.

---

# 21. Frontend Department Management Flow

## 21.1 Department List

```text
Super Admin / Executive
        ↓
Department Management
        ↓
GET /department
        ↓
Display Department List
```

Recommended columns:

```text
Department Name
Department Code
Department Head
Status
Created Date
Actions
```

---

## 21.2 Department Details

```text
Department List
        ↓
Select Department
        ↓
GET /department/:departmentId
        ↓
Display Department Details
```

---

## 21.3 Create Department

```text
Department Management
        ↓
Create Department
        ↓
Enter Name
        ↓
Enter Code
        ↓
Optional Department Head
        ↓
Submit
        ↓
POST /department
        ↓
Success
        ↓
Refresh Department List
```

---

## 21.4 Update Department

```text
Department List
        ↓
Select Department
        ↓
Edit
        ↓
PATCH /department/:departmentId
        ↓
Success
        ↓
Refresh Department Data
```

---

## 21.5 Assign Department Head

```text
Department
        ↓
Assign Department Head
        ↓
Load Employees
        ↓
Display Employee Name
        ↓
Store Employee._id
        ↓
PATCH /department/:departmentId
        ↓
Refresh Department
```

Frontend display:

```text
Rahul Patil
```

Value sent to backend:

```text
6a717671cfc15fe117146bce
```

---

## 21.6 Change Status

```text
Department List
        ↓
Change Status
        ↓
PATCH /department/:departmentId/status
        ↓
ACTIVE / INACTIVE
        ↓
Refresh Department List
```

---

## 21.7 Delete

```text
Department List
        ↓
Click Delete
        ↓
Confirmation
        ↓
DELETE /department/:departmentId
        ↓
Success
        ↓
Refresh Department List
```

If employees are assigned:

```text
DELETE
   ↓
Deletion blocked
   ↓
Display backend error
   ↓
Keep Department in UI
```

---

# 22. Frontend Rules

```text
1. Do NOT send Authorization: Bearer <ACCESS_TOKEN> manually.

2. Authentication is handled through the HttpOnly cookie.

3. Use credentials: "include" with Fetch.

4. Use withCredentials: true with Axios.

5. Do not attempt to read the HttpOnly cookie using JavaScript.

6. Use Department._id when another module requires a Department reference.

7. Use Employee._id when assigning a Department Head.

8. Do not send department names where an ObjectId is required.

9. Do not send employee names as Department Head values.

10. Do not manually send createdBy.

11. Do not manually send createdAt or updatedAt.

12. Treat Department.head as nullable.

13. Do not assume every Department has a Department Head.

14. GET responses may contain populated Department Head information.

15. Create/Update responses may contain ObjectId references.

16. Refresh Department data after update or status changes.

17. Handle HTTP 401 separately from HTTP 403.

18. Handle deletion restrictions properly.

19. Do not remove a Department from the frontend list unless the DELETE API succeeds.

20. Use the MongoDB Department._id for /department/:departmentId.
```

---

# 23. Frontend Error Handling

## 23.1 401 Unauthorized

Authentication failed or the authentication session is not valid.

Frontend should use the existing authentication/refresh flow.

Do not treat this as a Department permission error.

---

## 23.2 403 Forbidden

The authenticated user does not have permission to access the Department API.

Example:

```text
403 Forbidden
```

Frontend should display an appropriate permission message.

---

## 23.3 404 Department Not Found

If the Department does not exist:

```text
Department not found.
```

Frontend should display an appropriate not-found message.

---

## 23.4 Duplicate Department Code

If the Department code already exists:

```text
Department code already exists.
```

Frontend should show the validation/error message near the Department Code field.

---

## 23.5 Invalid Department Head

If the selected Employee does not exist or the supplied ID is invalid, display the backend error.

Frontend should not silently continue with an invalid Employee reference.

---

## 23.6 Department Cannot Be Deleted

Backend response:

```json
{
  "success": false,
  "errorName": "Error",
  "message": "Department cannot be deleted because employees are assigned to it.",
  "errors": []
}
```

Frontend should show:

```text
This department cannot be deleted because employees are assigned to it.
```

---

# 24. Department Dropdown in Employee Management

Employee Management uses Department references.

The frontend should follow:

```text
GET /department
       ↓
Receive departments
       ↓
Display department.name
       ↓
User selects department
       ↓
Store department._id
       ↓
Send department._id
```

Example UI:

```text
Information Technology
```

Backend value:

```text
6a7178421c73966a2997d72b
```

Do not send:

```json
{
  "department": "Information Technology"
}
```

Send:

```json
{
  "department": "6a7178421c73966a2997d72b"
}
```

---

# 25. Department Head Dropdown

For Department Head selection:

```text
GET Employees
       ↓
Display Employee Name
       ↓
User selects Employee
       ↓
Store Employee._id
       ↓
PATCH /department/:departmentId
```

Example:

```text
Display:
Rahul Patil

Send:
6a717671cfc15fe117146bce
```

---

# 26. Relationship With Employee Management

Department Management and Employee Management are connected.

```text
Department
      ↑
      |
Employee.department
```

Example:

```text
Department
_id:
6a7178421c73966a2997d72b

        ↑

Employee
department:
6a7178421c73966a2997d72b
```

Because of this relationship, deleting a Department that is being used by an Employee is blocked.

---

# 27. Relationship With Team Management

Team Management will use the Department reference.

```text
Department
     ↓
Team
     ↓
Employee
```

The Team model contains:

```text
department → Department._id
```

Therefore the frontend Team form should load Departments and use the selected Department `_id`.

Example:

```json
{
  "name": "Backend Development",
  "department": "DEPARTMENT_OBJECT_ID"
}
```

---

# 28. Tested APIs

The following Department APIs have been manually tested.

```text
POST /department
Create Department
        ✅ TESTED
```

```text
GET /department
Get All Departments
        ✅ TESTED
```

```text
GET /department/:departmentId
Get Department By ID
        ✅ TESTED
```

```text
PATCH /department/:departmentId
Update Department
        ✅ TESTED
```

```text
PATCH /department/:departmentId
Assign Department Head
        ✅ TESTED
```

```text
PATCH /department/:departmentId/status
Update Department Status
        ✅ TESTED
```

```text
DELETE /department/:departmentId
Delete Department
        ✅ TESTED
```

---

# 29. Delete Protection Testing

Two deletion scenarios were tested.

## Scenario 1: Department Without Assigned Employees

```text
Department
     ↓
No Employee assigned
     ↓
DELETE
     ↓
SUCCESS
```

Response:

```json
{
  "success": true,
  "message": "Department deleted successfully."
}
```

---

## Scenario 2: Department Assigned to Employee

```text
Employee
     ↓
Employee.department = Department._id
     ↓
DELETE Department
     ↓
BLOCKED
```

Response:

```json
{
  "success": false,
  "errorName": "Error",
  "message": "Department cannot be deleted because employees are assigned to it.",
  "errors": []
}
```

This confirms that the current deletion protection works.

---

# 30. Important Reference Rule

There are three important ObjectId references in the current Department/Employee structure.

```text
Department.head
        ↓
Employee._id
```

```text
Employee.department
        ↓
Department._id
```

```text
Team.department
        ↓
Department._id
```

Frontend must always send the correct MongoDB ObjectId for the relationship being updated.

---

# 31. Current Module Status

```text
Department Model
        ↓
COMPLETED ✅

Department Validator
        ↓
COMPLETED ✅

Department Service
        ↓
COMPLETED ✅

Department Controller
        ↓
COMPLETED ✅

Department Routes
        ↓
COMPLETED ✅

Create Department
        ↓
TESTED ✅

Get All Departments
        ↓
TESTED ✅

Get Department By ID
        ↓
TESTED ✅

Update Department
        ↓
TESTED ✅

Assign Department Head
        ↓
TESTED ✅

Update Department Status
        ↓
TESTED ✅

Delete Department
        ↓
TESTED ✅

Delete Protection
        ↓
TESTED ✅
```

---

# 32. FRS Alignment

The FRS defines:

```text
Level 1 → Super Admin
Level 2 → Governance Layer
Level 3 → Executive Layer
Level 4 → Departments
Level 5 → Managerial Layer
Level 6 → Team Lead
Level 7 → Teams
Level 8 → Employees
Level 9 → Interns
```

The FRS also states that every user belongs to:

```text
One Hierarchy Level
One Department
One Team (Optional)
One Reporting Manager
```

Super Admin organization-management responsibilities include:

```text
Create Departments
Create Department Heads
Create Managers
Create Team Leads
Create Teams
Create Employees
Create Interns
```

Executive Layer responsibilities include:

```text
Create Departments
Create Department Heads
Create Department Documents
Create Operational Documents
Create Process Improvement Documents
```

Therefore the current Department access configuration:

```text
SUPER_ADMIN
EXECUTIVE
```

is aligned with the Department creation responsibilities defined in the FRS.

---

# 33. What Is Not Implemented in This Module

The following should not be assumed to be part of the current Department CRUD implementation unless explicitly implemented later:

```text
Fine-grained Department ACL
Department-level document permissions
Department document workflow
Department document approval
Department document version control
Department audit dashboard
Department analytics
Automatic hierarchy escalation
```

These belong to the broader EGKMS Access Control, Document, Workflow, Version, Audit, and Analytics functionality.

The FRS requires these systems to work together through the platform architecture.

---

# 34. Developer Quick Reference

## Base URL

```text
http://localhost:5000/api/v1
```

## Production URL

```text
https://dms-s32w.onrender.com/api/v1
```

## Department Path

```text
/department
```

## Endpoints

```text
POST   /department
GET    /department
GET    /department/:departmentId
PATCH  /department/:departmentId
PATCH  /department/:departmentId/status
DELETE /department/:departmentId
```

## Authentication

```text
HttpOnly Cookie
```

Fetch:

```javascript
credentials: "include"
```

Axios:

```javascript
withCredentials: true
```

## Authorization

```text
SUPER_ADMIN
EXECUTIVE
```

## Important IDs

```text
Department routes:
Department._id

Department Head:
Employee._id

Employee Department:
Department._id

Team Department:
Department._id
```

---

# 35. Summary

Department Management provides the backend APIs required to maintain the Department level of EGKMS.

The module currently supports:

```text
Create
Read
Update
Department Head Assignment
Status Management
Delete
Delete Protection
```

Authentication is handled through an HttpOnly cookie.

The frontend must not manually send the access token.

MongoDB ObjectIds must be used for Department, Employee, and Team relationships.

The Department module has been manually tested and is currently:

```text
COMPLETED AND TESTED ✅
```

The next organizational module can be implemented on top of this Department foundation.
