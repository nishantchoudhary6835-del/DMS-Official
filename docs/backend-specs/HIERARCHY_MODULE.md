# HIERARCHY MODULE DOCUMENTATION

## 1. Module Overview

The **Hierarchy Module** manages the predefined organizational hierarchy levels used by the EGKMS system.

For the current implementation, this module is being used as a **read-only configuration module**.

The main purpose is to provide hierarchy levels to the frontend when creating an Employee.

### Current Scope

The module currently supports:

- Fetching all active hierarchy levels
- Returning hierarchy levels in the correct order
- Providing only the fields required by the Employee Create form

### Current Runtime Usage

```text
Super Admin
    ↓
Create Employee
    ↓
Fetch Hierarchy Levels
    ↓
GET /hierarchy
    ↓
Show Hierarchy Dropdown
```

---

# 2. Hierarchy Levels

The system uses the following hierarchy levels:

| Level | Hierarchy |
|---:|---|
| 1 | SUPER_ADMIN |
| 2 | GOVERNANCE |
| 3 | EXECUTIVE |
| 4 | DEPARTMENT |
| 5 | MANAGER |
| 6 | TEAM_LEAD |
| 7 | TEAM |
| 8 | EMPLOYEE |
| 9 | INTERN |

These values are consistent with the `hierarchyLevel` enum used by the Employee model.

---

# 3. Current Database Structure

The Hierarchy document contains the following fields:

```js
{
  hierarchyLevel,
  level,
  parentId,
  description,
  status,
  createdBy
}
```

For the current GET functionality, the frontend only needs:

```text
_id
hierarchyLevel
level
```

The other fields are not required for the Employee Create hierarchy dropdown.

---

# 4. GET All Hierarchy

## Endpoint

```http
GET /hierarchy
```

### Authentication

Authentication is required.

```text
authenticate
```

Only an authenticated user can access the hierarchy list.

---

## Purpose

This API returns the active hierarchy levels from the database.

The result is sorted according to the hierarchy level order.

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

---

# 5. Service Implementation

The current service implementation intentionally returns only the required fields.

```js
const getAllHierarchy = async () => {

  const hierarchy = await Hierarchy.find(
    { status: "active" },
    {
      hierarchyLevel: 1,
      level: 1
    }
  )
    .sort({ level: 1 });

  return hierarchy;
};
```

### Why only these fields?

The Employee Create form only needs:

```text
_id
hierarchyLevel
level
```

Therefore, there is no need to populate:

```text
parentId
createdBy
```

or return unnecessary metadata.

This keeps the API response smaller and simpler for the frontend.

---

# 6. Expected Response

Example:

```json
{
  "success": true,
  "data": [
    {
      "_id": "6a...",
      "hierarchyLevel": "SUPER_ADMIN",
      "level": 1
    },
    {
      "_id": "6b...",
      "hierarchyLevel": "GOVERNANCE",
      "level": 2
    },
    {
      "_id": "6c...",
      "hierarchyLevel": "EXECUTIVE",
      "level": 3
    }
  ]
}
```

The complete response will contain all active hierarchy levels.

---

# 7. Why `status: "active"` Is Used

The database contains:

```text
active
inactive
```

hierarchy statuses.

The GET API filters only:

```js
{ status: "active" }
```

This means inactive hierarchy levels will not appear in the Employee Create form.

This prevents the frontend from showing hierarchy levels that are not currently active.

---

# 8. Sorting

The API uses:

```js
.sort({ level: 1 })
```

This sorts the hierarchy from the lowest numeric level to the highest.

Example:

```text
1 → SUPER_ADMIN
2 → GOVERNANCE
3 → EXECUTIVE
4 → DEPARTMENT
5 → MANAGER
6 → TEAM_LEAD
7 → TEAM
8 → EMPLOYEE
9 → INTERN
```

This ensures that the frontend receives the hierarchy in the correct organizational order.

---

# 9. Route

Current route:

```js
router.get(
  "/",
  authenticate,
  hierarchyController.getAllHierarchy
);
```

### Flow

```text
GET /hierarchy
      ↓
authenticate
      ↓
getAllHierarchy Controller
      ↓
getAllHierarchy Service
      ↓
Hierarchy.find()
      ↓
Filter active records
      ↓
Select required fields
      ↓
Sort by level
      ↓
Response
```

---

# 10. Controller

The controller calls the hierarchy service:

```js
exports.getAllHierarchy = async (req, res, next) => {

  try {

    const hierarchy =
      await hierarchyService.getAllHierarchy();

    res.status(200).json({
      success: true,
      data: hierarchy
    });

  } catch (error) {
    next(error);
  }
};
```

The controller does not contain database logic.

The database query remains inside the service layer.

---

# 11. Frontend Usage

The frontend can call:

```http
GET /hierarchy
```

and use the response to populate the Employee Create hierarchy dropdown.

Example dropdown:

```text
SUPER_ADMIN
GOVERNANCE
EXECUTIVE
DEPARTMENT
MANAGER
TEAM_LEAD
TEAM
EMPLOYEE
INTERN
```

When the user selects a hierarchy, the frontend can use the returned `hierarchyLevel` value according to the Employee API requirements.

---

# 12. Fields Used by Frontend

| Field | Required | Purpose |
|---|---|---|
| `_id` | Yes | Database reference |
| `hierarchyLevel` | Yes | Actual hierarchy value |
| `level` | Yes | Display/order hierarchy |
| `parentId` | No | Not required for current dropdown |
| `description` | No | Not required |
| `status` | No | Used internally for filtering |
| `createdBy` | No | Not required |
| `createdAt` | No | Not required |
| `updatedAt` | No | Not required |

---

# 13. Current Module Scope

### Currently Used

```text
GET /hierarchy
```

This is the only hierarchy operation currently used by the application.

### Currently Not Used

The following operations exist in the module code but are **not part of the current runtime requirement**:

```text
POST   /hierarchy
PATCH  /hierarchy/:id
DELETE /hierarchy/:id
GET    /hierarchy/:id
```

These operations are currently commented out / disabled and should **not be considered active application functionality**.

The hierarchy data is treated as predefined configuration data.

---

# 14. Important Implementation Rule

Do not add unnecessary CRUD functionality to the current Employee workflow.

The current requirement is:

```text
Hierarchy Database
       ↓
GET active hierarchy levels
       ↓
Employee Create Form
       ↓
Hierarchy Dropdown
```

The frontend should not maintain a hardcoded hierarchy list if the list is already available from the database.

---

# 15. Testing in Postman

### Request

```http
GET http://localhost:5000/<your-base-path>/hierarchy
```

Authentication:

```text
Required
```

### Verify

The response should:

- Return `success: true`
- Return only active hierarchy records
- Return `_id`
- Return `hierarchyLevel`
- Return `level`
- Return records sorted by `level`
- Not populate unnecessary `parentId` or `createdBy` data

---

# 16. Module Status

```text
Hierarchy Module
│
├── Database Configuration       ✅
├── Hierarchy Records             ✅
├── GET All Hierarchy             ✅ ACTIVE
│
├── GET Single Hierarchy          ⏸ NOT USED
├── Create Hierarchy              ⏸ NOT USED
├── Update Hierarchy              ⏸ NOT USED
└── Delete Hierarchy              ⏸ NOT USED
```

### Current Purpose

**Provide active hierarchy levels to the Employee Create form through a GET API.**