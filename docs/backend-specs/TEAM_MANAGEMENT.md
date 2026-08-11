# EGKMS -- Team Management Module Documentation

## 1. Module Overview

The Team Management module manages organizational teams within a
Department.

According to the EGKMS FRS, a Team is a working group inside a
Department. Teams can collaborate, prepare documents, and submit
documents to the Team Lead. Team permissions are assigned by the Team
Lead. The FRS defines the Team Lead as responsible for managing Teams
and explicitly lists **Create Teams** as a Team Lead responsibility.
Super Admin also has organization-management responsibility that
includes creating Teams.

## 2. Purpose

The current backend Team module provides:

-   Create Team
-   Get all Teams
-   Get Team by ID
-   Update Team
-   Activate/deactivate Team
-   Delete Team
-   Department association
-   Team Lead association
-   Protection against deleting a Team that still has Employees assigned

## 3. FRS Alignment

### Super Admin

The FRS states that Super Admin has complete platform control and can
create Departments, Department Heads, Managers, Team Leads, Teams,
Employees, and Interns.

### Manager

The FRS states that the Managerial Layer manages operational teams, can
create Team Leads, and assigns Team Lead permissions through the
Department Head.

### Team Lead

The FRS defines Team Lead as responsible for managing Teams and
explicitly lists:

-   Create Teams
-   Review Employee Documents
-   Review Intern Documents
-   Submit Documents to Manager
-   Assign Team Tasks

The FRS also states that Team Lead permissions are assigned by the
Manager.

### Teams

The FRS defines Teams as working groups inside a Department. Teams can
collaborate, prepare documents, and submit documents to the Team Lead.
Their permissions are assigned by the Team Lead.

## 4. Organizational Relationships

``` text
Department
    ↓
Team
    ↓
Employee
```

The Team model uses:

``` text
Team.department → Department._id
Team.teamLead   → Employee._id
Team.createdBy  → User._id
```

The Employee model also uses:

``` text
Employee.department       → Department._id
Employee.team             → Team._id
Employee.reportingManager → Employee._id
```

The Team Lead is an Employee whose hierarchy level is `TEAM_LEAD`.

## 5. Technology

``` text
Backend: Node.js + Express.js
Database: MongoDB + Mongoose
Authentication: JWT + Refresh Token + HttpOnly Cookie
Validation: Joi
Frontend: React.js + Material UI
```

## 6. File Structure

``` text
src/
└── modules/
    └── team/
        ├── team.model.js
        ├── team.validator.js
        ├── team.service.js
        ├── team.controller.js
        └── team.routes.js
```

  File                   Responsibility
  ---------------------- --------------------------------
  `team.model.js`        MongoDB Team schema
  `team.validator.js`    Request validation
  `team.service.js`      Team business logic
  `team.controller.js`   HTTP request/response handling
  `team.routes.js`       Routes and authorization

## 7. Team Model

``` js
{
  name: String,
  department: ObjectId -> Department,
  teamLead: ObjectId -> Employee,
  status: "ACTIVE" | "INACTIVE",
  createdBy: ObjectId -> User,
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

-   `name` --- required Team name.
-   `department` --- required Department reference.
-   `teamLead` --- optional Employee reference; when supplied, the
    current service requires an active `TEAM_LEAD`.
-   `status` --- `ACTIVE` or `INACTIVE`; defaults to `ACTIVE`.
-   `createdBy` --- User reference for the creator.

## 8. API Base URL

Local base URL:

``` text
http://localhost:5000/api/v1
```

Team base route:

``` text
/team
```

## 9. API Endpoints

  Method   Endpoint                 Current Access
  -------- ------------------------ ------------------------
  POST     `/team`                  SUPER_ADMIN, TEAM_LEAD
  GET      `/team`                  SUPER_ADMIN, TEAM_LEAD
  GET      `/team/:teamId`          SUPER_ADMIN, TEAM_LEAD
  PATCH    `/team/:teamId`          SUPER_ADMIN, TEAM_LEAD
  PATCH    `/team/:teamId/status`   SUPER_ADMIN, TEAM_LEAD
  DELETE   `/team/:teamId`          SUPER_ADMIN

## 10. Create Team

### Request

``` http
POST /team
```

``` json
{
  "name": "Backend Development",
  "department": "DEPARTMENT_OBJECT_ID",
  "teamLead": "TEAM_LEAD_EMPLOYEE_OBJECT_ID"
}
```

The frontend must send ObjectIds, not department/team-lead display
names.

### Success

``` json
{
  "success": true,
  "message": "Team created successfully.",
  "data": {
    "_id": "TEAM_OBJECT_ID",
    "name": "Backend Development",
    "department": {
      "_id": "DEPARTMENT_OBJECT_ID",
      "name": "Information Technology",
      "code": "IT",
      "status": "ACTIVE"
    },
    "teamLead": {
      "_id": "EMPLOYEE_OBJECT_ID",
      "employeeId": "EMP-TL-001",
      "firstName": "Amit",
      "lastName": "Shinde",
      "email": "amit.tl@company.com",
      "hierarchyLevel": "TEAM_LEAD",
      "status": "ACTIVE"
    },
    "status": "ACTIVE",
    "createdBy": "USER_OBJECT_ID"
  }
}
```

## 11. Get All Teams

``` http
GET /team
```

Optional filters:

``` http
GET /team?department=DEPARTMENT_OBJECT_ID
GET /team?teamLead=EMPLOYEE_OBJECT_ID
GET /team?status=ACTIVE
```

The current GET response populates Department and Team Lead information.

## 12. Get Team By ID

``` http
GET /team/:teamId
```

Returns the Team with populated Department and Team Lead information.

## 13. Update Team

``` http
PATCH /team/:teamId
```

Example:

``` json
{
  "name": "Backend Engineering"
}
```

Other supported update fields include Department, Team Lead, and status.

## 14. Update Team Status

``` http
PATCH /team/:teamId/status
```

Deactivate:

``` json
{
  "status": "INACTIVE"
}
```

Activate:

``` json
{
  "status": "ACTIVE"
}
```

## 15. Delete Team

``` http
DELETE /team/:teamId
```

Current behavior:

``` text
TEAM_LEAD   → 403 Forbidden
SUPER_ADMIN → Allowed
```

The current service also blocks deletion when Employees are assigned to
the Team.

## 16. Authentication

Authentication uses JWT with HttpOnly cookies.

Frontend requests should include credentials.

Fetch:

``` js
fetch(url, {
  credentials: "include"
});
```

Axios:

``` js
axios.get(url, {
  withCredentials: true
});
```

The frontend must not read the JWT from JavaScript or `document.cookie`.

## 17. Validation and Business Rules

### Team name

-   Required
-   2--100 characters

### Department

-   Required when creating
-   Must be a valid MongoDB ObjectId
-   Referenced Department must exist

### Team Lead

If supplied:

-   Must be a valid MongoDB ObjectId
-   Employee must exist
-   Employee must be `ACTIVE`
-   Employee hierarchy must be `TEAM_LEAD`

### Status

Allowed values:

``` text
ACTIVE
INACTIVE
```

### Duplicate Team name

The current service prevents duplicate Team names within the same
Department.

### Employee assignment protection

A Team cannot currently be deleted if Employees are assigned to it.

## 18. Authorization Architecture

Current Team request flow:

``` text
Request
   ↓
authenticate
   ↓
authorize(...)
   ↓
Team Controller
   ↓
Team Service
   ↓
MongoDB
```

Current route behavior:

  Operation     SUPER_ADMIN   TEAM_LEAD
  ----------- ------------- -----------
  Create                Yes         Yes
  View                  Yes         Yes
  Update                Yes         Yes
  Status                Yes         Yes
  Delete                Yes          No

The FRS describes a broader layered access-control architecture:

``` text
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

The current Team module uses the existing authentication and role
middleware. The complete fine-grained ACL/permission engine is broader
platform work and is not implemented as part of this Team CRUD module.

## 19. Frontend Rules

Use Department and Employee ObjectIds:

``` json
{
  "department": "DEPARTMENT_OBJECT_ID",
  "teamLead": "EMPLOYEE_OBJECT_ID"
}
```

Do not send:

``` json
{
  "department": "Information Technology",
  "teamLead": "Amit Shinde"
}
```

Handle:

``` text
401 → authentication problem
403 → authorization problem
404 → resource not found
409 → business conflict
```

Refresh Team data after successful update/status operations.

## 20. Testing Completed

The following Team APIs were manually tested:

``` text
Create Team              ✅
Get All Teams            ✅
Get Team By ID           ✅
Update Team              ✅
Update Team Status       ✅
Team Lead DELETE         ✅ 403 Forbidden
Super Admin DELETE       ✅
```

Tested organizational setup:

``` text
Department
Information Technology
        ↓
Manager
        ↓
Team Lead
Amit Shinde
        ↓
Team
Backend Engineering
```

The Team Lead Employee was registered as a User, logged in, and
successfully created a Team.

## 21. FRS vs Current Implementation

  -----------------------------------------------------------------------
  Area                    FRS                     Current Status
  ----------------------- ----------------------- -----------------------
  Team is a working group Yes                     Implemented
  inside Department                               

  Team Lead manages Teams Yes                     Current role
                                                  authorization supports
                                                  Team management

  Team Lead can create    Yes                     Implemented
  Teams                                           

  Team Lead permissions   Yes                     Fine-grained permission
  assigned by Manager                             engine not yet
                                                  implemented

  Super Admin can create  Yes                     Implemented
  Teams                                           

  Department relationship Project structure       Implemented

  Team Lead relationship  Project structure       Implemented

  Fine-grained ACL        Broader FRS             Not yet implemented
                          architecture            

  Team document workflow  FRS                     Separate future module

  Team task management    FRS                     Separate future module

  Audit/analytics         Broader FRS             Separate future work
                          architecture            
  -----------------------------------------------------------------------

## 22. Current Module Status

``` text
Team Model
        ↓
COMPLETED ✅

Team Validator
        ↓
COMPLETED ✅

Team Service
        ↓
COMPLETED ✅

Team Controller
        ↓
COMPLETED ✅

Team Routes
        ↓
COMPLETED ✅

Create Team
        ↓
TESTED ✅

Get All Teams
        ↓
TESTED ✅

Get Team By ID
        ↓
TESTED ✅

Update Team
        ↓
TESTED ✅

Update Team Status
        ↓
TESTED ✅

Team Lead Delete Restriction
        ↓
TESTED ✅

Super Admin Delete
        ↓
TESTED ✅
```

## 23. Important Limitation

This module currently covers Team CRUD and organizational relationships.

It does not yet implement:

``` text
Team document management
Team document approval workflow
Team task management
Fine-grained ACL
Manager-assigned permission engine
Team audit logging
Team analytics
```

Those features should be implemented separately and verified against the
FRS before major changes.

## 24. FRS References

Team-related requirements used for this documentation:

-   FRS 5.1 --- Super Admin
-   FRS 5.5 --- Managerial Layer
-   FRS 5.6 --- Team Lead
-   FRS 5.7 --- Teams
-   FRS access-control architecture

The FRS specifically states that Super Admin can create Teams, Team Lead
can create and manage Teams, Team Lead permissions are assigned by
Manager, and Teams are working groups inside Departments.
