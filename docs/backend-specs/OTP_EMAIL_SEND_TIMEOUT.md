# `POST /auth/send-email-otp` fails on every call — IPv6 SMTP connection issue

**Status:** Confirmed, root-caused against your own repo source. Two fix
options attached below — neither is runtime-tested, since that needs real
credentials and a deploy. Not fixable from the frontend.

**Audience:** Backend team (`kirangawande39/DMS`).

**Why this document exists:** registration is completely blocked right now
— every OTP email send fails, so no new employee can ever get past `POST
/auth/register`'s OTP-verification step. This was found while trying to set
up test accounts for the workflow approval chain (Manager, Department Head,
Executive, Governance) and turned out to block that work entirely, so it
was worth tracing to the actual line of code rather than just reporting the
symptom.

---

## What was found

Every `POST /api/v1/auth/send-email-otp` call against the live deployment
fails, in one of two ways:

```
POST /api/v1/auth/send-email-otp
→ 500 (~122000ms, reproduced 5+ times)
{
  "success": false,
  "errorName": "Error",
  "message": "Connection timeout",
  "errors": []
}
```

```
POST /api/v1/auth/send-email-otp
→ 500 (reproduced once, faster failure)
{
  "success": false,
  "errorName": "Error",
  "message": "connect ENETUNREACH 2607:f8b0:400e:c00::6d:587 - Local (:::0)",
  "errors": []
}
```

The ~122-second duration on the timeout cases is not a coincidence — it
matches nodemailer's default SMTP connection timeout almost exactly. The
`ENETUNREACH` case shows the actual address it was trying to reach:
`2607:f8b0:400e:c00::6d:587` — an IPv6 address in Google's range, on port
587 (SMTP submission).

## Why this happens

`src/config/mail.js` creates the transporter like this:

```js
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});
```

No `family` is specified, so Node's default DNS resolution for
`smtp.gmail.com` is free to return an IPv6 address (Gmail's SMTP endpoint is
dual-stack). On Render, outbound IPv6 to that address isn't routable, so the
connection either hangs until nodemailer's connection timeout (the
`Connection timeout` case) or the OS fails it immediately once it recognizes
there's no route (`ENETUNREACH`). This is a well-known class of issue on
Render/Heroku-style hosts with partial or no outbound IPv6 support, and
`family: 4` on the transport config is the standard, minimal fix — it forces
the SMTP connection over IPv4 instead of leaving DNS resolution to chance.

Worth noting: `src/services/email/email.service.js` already has
`console.log`/`console.error` instrumentation around the `sendMail()` call
(from a commit titled "add console in email service file for debug"), so
this was already suspected as broken — this document just traces it to the
actual line.

## Impact

Every flow that depends on emailing an OTP is blocked:

- `POST /auth/register` — new employees can never get past OTP
  verification, so no new account can ever start using the app.
- Presumably any other OTP-gated flow (password reset, etc., if one exists)
  that goes through the same transporter.

This is currently blocking creation of test accounts for the workflow
approval chain (Manager, Department Head, Executive, Governance levels),
since none of those can be exercised without a real, logged-in account at
each level.

## Two fix options

Neither has been runtime-tested beyond reading against your own source —
both need a real deploy with real credentials, which the frontend doesn't
have access to.

### Option A — minimal: force IPv4, keep nodemailer/Gmail

One line in `src/config/mail.js`:

```diff
 const transporter = nodemailer.createTransport({
     host: "smtp.gmail.com",
     port: 587,
     secure: false,
 
+    // Render (and several other hosts) resolve smtp.gmail.com to an IPv6
+    // address by default, but don't route outbound IPv6 — the connection
+    // then hangs until nodemailer's ~2 minute connection timeout instead of
+    // failing fast, which is exactly the "Connection timeout" / "connect
+    // ENETUNREACH 2607:f8b0:..." errors seen on every OTP email send.
+    // Forcing IPv4 here is the standard fix for this class of issue.
+    family: 4,
+
     auth: {
         user: process.env.EMAIL_USER,
         pass: process.env.EMAIL_PASS
     }
 });
```

If `family: 4` alone doesn't fully resolve it, the next thing to try is
forcing IPv4 at the DNS-resolution level globally, e.g. calling
`require('dns').setDefaultResultOrder('ipv4first')` once at process startup
(Node 18+) — a broader fix worth considering anyway if other outbound calls
in this service hit the same class of issue.

### Option B — switch to Brevo's HTTP API, drop nodemailer entirely

Rather than patch around the SMTP/IPv6 interaction, this removes SMTP from
the picture completely: Brevo's transactional email API is a plain HTTPS
POST on port 443, which doesn't have this class of routing problem on
Render or anywhere else. It also means one less outbound-network failure
mode to debug next time (SMTP auth, greeting timeouts, TLS negotiation,
etc. all stop being relevant).

`src/config/mail.js`, replacing the nodemailer transporter:

```js
// Brevo's transactional email API — plain HTTPS, not SMTP. Sidesteps this
// whole class of bug: no SMTP port/IPv6 resolution involved, just a normal
// HTTPS POST on 443.
const BREVO_SEND_EMAIL_URL = "https://api.brevo.com/v3/smtp/email";
const BREVO_API_KEY = process.env.BREVO_API_KEY;

module.exports = {
    BREVO_SEND_EMAIL_URL,
    BREVO_API_KEY
};
```

`src/services/email/email.service.js`, replacing the `sendMail()` call —
same `sendEmail({ to, subject, html })` signature and same
`console.log`/`console.time` instrumentation, so nothing calling this
service needs to change:

```js
const { BREVO_SEND_EMAIL_URL, BREVO_API_KEY } = require("../../config/mail");

const sendEmail = async ({ to, subject, html }) => {
    console.log("📧 EMAIL SEND START");
    console.log("📧 To:", to);
    console.log("📧 Subject:", subject);

    console.time("📧 SMTP SEND TIME");

    try {
        console.log("📧 Calling Brevo API...");

        const response = await fetch(BREVO_SEND_EMAIL_URL, {
            method: "POST",
            headers: {
                "api-key": BREVO_API_KEY,
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                sender: { email: process.env.EMAIL_FROM },
                to: [{ email: to }],
                subject,
                htmlContent: html
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || `Brevo email send failed (${response.status})`);
        }

        console.timeEnd("📧 SMTP SEND TIME");

        console.log("✅ EMAIL SEND SUCCESS");
        console.log("📧 Message ID:", result.messageId);

        return result;
    } catch (error) {
        console.timeEnd("📧 SMTP SEND TIME");

        console.error("❌ EMAIL SEND FAILED");
        console.error("❌ Error:", error.message);

        throw error;
    }
};

module.exports = {
    sendEmail
};
```

Uses the global `fetch` built into Node 18+ — no new dependency. Your
`package.json` has no `engines` pin, so this assumes Render's default Node
is 18 or newer (true of Render's current default runtime); worth a quick
check if that's not the case. If an older Node is pinned, swap `fetch` for
`axios` or `node-fetch` instead — same request shape either way.

**Setup required, not just code:**
- New env var `BREVO_API_KEY`, from the Brevo dashboard (Settings → SMTP &
  API → API Keys).
- `EMAIL_FROM` must be a **verified sender** in that Brevo account (single
  sender or authenticated domain) — Brevo rejects sends from an unverified
  address, this isn't optional.
- `EMAIL_USER` / `EMAIL_PASS` (the Gmail app-password creds) become unused
  and can be removed once this is live.
- Optional cleanup: `npm uninstall nodemailer` — left untouched here since
  hand-editing `package-lock.json` isn't safe to do blind; `npm install`
  after removing it from `package.json` will reconcile the lockfile.

Either option fixes the bug. B is more work up front (new account setup,
domain/sender verification) but removes an entire class of infrastructure
flakiness; A is a one-line change if you'd rather ship the smallest possible
fix first and revisit later.
