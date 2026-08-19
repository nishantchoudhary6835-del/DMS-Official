# EGKMS Authentication — Forgot Password & Change Password

## Module

Authentication Module

### Technology

Node.js + Express.js + MongoDB + Mongoose + JWT + Bcrypt

---

## Purpose

Two new password-management flows, on top of the existing login/OTP/register
flow documented in `AUTH_FLOW.md`:

1. **Forgot Password** — the user doesn't know their old password. They get
   an OTP on their registered email and set a new password after verifying it.
2. **Change Password** — the user is already logged in and knows their old
   password. They verify the old one and set a new one in a single call.

---

## Endpoints

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/forgot-password` | Public | Sends a password-reset OTP to the registered email |
| POST | `/auth/verify-forgot-password-otp` | Public | Verifies the OTP and sets the new password in one call |
| POST | `/auth/change-password` | Required (cookie session, per the `AUTH_FLOW.md` update) | Changes the logged-in user's password |

---

## 1. Forgot Password — send OTP

```http
POST /auth/forgot-password
```

Request body:

```json
{ "email": "registered-user@example.com" }
```

Flow: normalize email → find user → check account status → generate OTP →
hash it (bcrypt) → delete any previous `PASSWORD_RESET` OTP for this email →
store the new one → email it.

Success response:

```json
{ "success": true, "message": "Password reset OTP sent successfully." }
```

---

## 2. Verify Forgot Password OTP (sets the new password)

```http
POST /auth/verify-forgot-password-otp
```

Request body — **OTP and the new password are sent together, in one call**;
there is no separate "verify OTP" step before this like there is for
registration:

```json
{
  "email": "registered-user@example.com",
  "otp": "123456",
  "newPassword": "NewPassword@123"
}
```

Flow: normalize email → find the `PASSWORD_RESET`-purpose OTP → check expiry
→ check attempt count → compare OTP hash → on match, hash the new password,
update the user, invalidate the existing refresh token
(`user.refreshTokenHash = null`), mark OTP verified, delete it.

Success response:

```json
{ "success": true, "message": "Password reset successfully." }
```

Invalid OTP response (attempts increment on each miss, max 5, then the OTP
is deleted and the user must request a new one):

```json
{ "success": false, "message": "Invalid OTP." }
```

---

## 3. Change Password

```http
POST /auth/change-password
```

Auth: the doc says `Authorization: Bearer <ACCESS_TOKEN>`, but per the
`AUTH_FLOW.md` 2026-08-18 update the access token is actually carried as an
HttpOnly cookie now, not a header this app sends manually — same as every
other authenticated call in this app (`withCredentials: true`, no explicit
header).

Request body:

```json
{
  "oldPassword": "OldPassword@123",
  "newPassword": "NewPassword@123"
}
```

Flow: authenticate → look up user → check account status → verify
`oldPassword` against the stored hash → reject if wrong → reject if
`newPassword === oldPassword` → hash and store the new password → invalidate
the existing refresh token.

Wrong old password:

```text
Old password is incorrect.
```

Same old/new password:

```text
New password must be different from old password.
```

---

## OTP model reuse

The existing OTP model (already used for registration's
`send-email-otp`/`verify-email-otp`) gained a `purpose` field so the same
collection can serve both flows without collision:

```javascript
purpose: {
  type: String,
  enum: ["EMAIL_VERIFICATION", "PASSWORD_RESET"],
  required: true,
}
```

Registration OTPs use `EMAIL_VERIFICATION`; forgot-password OTPs use
`PASSWORD_RESET`. Same 6-digit / 5-minute / 5-attempt rules as registration
(`OTP_LENGTH`/`OTP_VALIDITY_SECONDS` in `src/validation/auth.js` already
match this).

---

## Security notes (as documented)

* Passwords and OTPs are both bcrypt-hashed before storage — never plain text.
* Both password flows invalidate the existing refresh token on success, so a
  password reset/change kills any other active session immediately, not just
  the one that made the request.
* `change-password` requires authentication; `forgot-password` and
  `verify-forgot-password-otp` are public (that's the whole point — the user
  doesn't have a session to prove who they are otherwise).

## Testing status (per the doc)

Backend team reports all three endpoints (forgot-password, verify + invalid
OTP, change-password) manually tested via Postman and passing. Not yet
exercised from this app — see `docs/backend-specs/README.md`'s "Client-side
state" section once this is wired up.
