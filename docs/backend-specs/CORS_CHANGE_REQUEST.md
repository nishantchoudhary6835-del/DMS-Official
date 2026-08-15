# CORS and cookie changes needed for direct (proxy-less) frontend access

**Status:** Requested, not yet made. Backend-side change — nothing here can be
fixed from the frontend repo.

**Audience:** Backend team (`kirangawande39/DMS`).

**Production domains (confirmed):**

```
Frontend: https://dms-official.onrender.com
Backend:  https://dms-s32w.onrender.com
```

**Why this document exists:** the frontend is dropping its local dev proxy
(previously every browser request went to the same origin as the page itself,
and a Node.js proxy quietly forwarded it server-side to the real API). Once
that proxy is gone, the browser talks to the API directly, and two things
that never mattered before — because the proxy hid them — now do: CORS and
cookie `SameSite` policy. Both need a change, and — this is the important
correction from an earlier draft of this document — **the cookie change is
not a "someday, if domains differ" concern. The domains are already known,
and they already differ in the way that matters.**

---

## 0. `onrender.com` is on the Public Suffix List — frontend and backend are different *sites*, not just different origins

This single fact drives most of what follows, so it's worth stating first
and separately.

Verified directly against the authoritative list
(`https://publicsuffix.org/list/public_suffix_list.dat`, grepped for an exact
line match, not summarized):

```
onrender.com
```

is present as its own entry. Render registers it there deliberately, for the
same reason `github.io`, `vercel.app`, `netlify.app`, and `herokuapp.com` are
all on the same list: so that two unrelated customers' apps sharing that
domain (`*.onrender.com`) are never treated as "the same site" by a browser.

The practical consequence: `dms-official.onrender.com` and
`dms-s32w.onrender.com` are **cross-site**, in exactly the same sense as two
completely unrelated domains would be — not "cross-origin but same-site"
(which is what two `localhost` ports are). Anything that depends on
same-site cookie behavior between them will not work as-is.

---

## 1. CORS is a single hardcoded origin, not an allow-list

### What was found

A direct probe against the deployed API confirms the CORS response is fixed,
not origin-aware:

```
OPTIONS /api/v1/auth/send-email-otp
Origin: http://localhost:4400
Access-Control-Request-Method: POST

→ 204
  access-control-allow-origin: http://localhost:4400
  access-control-allow-credentials: true
  vary: Origin, Access-Control-Request-Headers
```

Sending a **different, unrelated `Origin`** on the same request (twice, from
two different values, with a cache-busting query param to rule out edge
caching) still returned the exact same header:

```
OPTIONS /api/v1/auth/send-email-otp
Origin: https://some-other-domain.example

→ 204
  access-control-allow-origin: http://localhost:4400   ← unchanged
  access-control-allow-credentials: true
```

The response was confirmed non-cached (`cf-cache-status: DYNAMIC`), so this
is the live Express server responding, not a CDN artifact.

### Why this is a problem

`Access-Control-Allow-Origin` only allows a request through when it exactly
matches the browser's real origin. Today it's hardcoded to
`http://localhost:4400`, which happens to work for local frontend dev (by
coincidence — that's the frontend's dev port), but:

- **No other origin can ever succeed**, credentialed or not. Not a different
  dev port, not a teammate's machine, and — now that it's confirmed —
  **not `https://dms-official.onrender.com`, the actual production
  frontend.** Direct, proxy-less production access is blocked by the browser
  today, unconditionally.
- The `vary: Origin` header on the response implies the intent was to vary
  the allowed origin per request (the standard pattern for a dynamic
  allow-list), but the actual value returned doesn't vary — suggesting the
  origin-matching logic is either disabled, misconfigured, or the origin list
  itself contains only this one entry.

### How to fix it

Use a real allow-list instead of one static string:

```js
const ALLOWED_ORIGINS = [
  'http://localhost:4400',              // frontend local dev
  'https://dms-official.onrender.com',  // production frontend
];

app.use(cors({
  origin(origin, callback) {
    // `origin` is undefined for same-origin/non-browser requests (curl, server-to-server) — allow those through.
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
```

Ideally `ALLOWED_ORIGINS` comes from an environment variable
(comma-separated list) so each environment (local, staging, production) can
declare its own allowed origins without a code change or redeploy.

### What to verify once fixed

Re-run the same probe with `http://localhost:4400` as `Origin` and confirm it
still returns that origin back (regression check), then with
`https://dms-official.onrender.com` and confirm *that* comes back correctly
too, then repeat with a bogus origin and confirm the header is **absent**
rather than still returning a fixed value — that's the signal the allow-list
is actually being evaluated per-request rather than hardcoded.

---

## 2. `refreshToken` cookie is `SameSite=Strict` — this breaks production today, not hypothetically

### Current configuration

Per `AUTH_FLOW.md` (this repo, lines 656–672):

```
httpOnly: true
secure: true in production, false in development
sameSite: strict
maxAge: 7 days
```

### Local dev: not an issue

`http://localhost:4400` (frontend) and `http://localhost:5000` (local
backend) are different origins but the *same site* — `localhost` isn't on
the public suffix list, so port is the only difference, and port doesn't
factor into the site boundary. Browsers still send `Strict` cookies between
same-site origins, so local dev works correctly without any change here.

### Production: this is already broken

`dms-official.onrender.com` and `dms-s32w.onrender.com` are different sites
(§0). `SameSite=Strict` — and `SameSite=Lax` too, for anything that isn't a
top-level navigation, which a fetch/XHR call never is — is **never sent by
the browser on a cross-site request.** Concretely, once the frontend calls
the backend directly instead of through a proxy: `POST /auth/refresh` will
never receive the `refreshToken` cookie at all. The endpoint has nothing to
validate, and every user gets silently signed out the moment their access
token expires (currently 15 minutes, per the open question already logged in
this folder's `README.md`). This will present as "sessions keep dying," not
as a CORS error — the request itself will complete fine, it'll just be
carrying no cookie.

### How to fix it

```
sameSite: none
secure: true   (SameSite=None requires Secure — the browser silently drops the cookie otherwise)
```

`secure: true` is already the production setting, so this is a one-line
change: `sameSite: strict` → `sameSite: none`, alongside the CORS fix in §1.
Both are needed for the same underlying reason — production is genuinely
cross-site — so there's no benefit to sequencing them separately.

---

## Summary — what to do

| Change | Why | When |
| --- | --- | --- |
| CORS: replace the hardcoded origin with an environment-driven allow-list containing `http://localhost:4400` and `https://dms-official.onrender.com` | Blocks all proxy-less access otherwise, local dev included | **Now** |
| Cookie: `sameSite: none` on `refreshToken` (keep `secure: true`) | Frontend and backend are confirmed different sites (`onrender.com` is a public suffix) — `Strict` never sends the cookie cross-site | **Now** — same rollout as the CORS fix, not later |

The frontend side of this (pointing directly at a backend URL instead of
going through a local proxy) is already done. Both changes above are
required together before proxy-less production access will actually work —
fixing CORS alone will get requests through but leave sessions unable to
refresh; fixing only the cookie without CORS won't get requests through the
browser in the first place.
