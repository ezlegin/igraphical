# Security Audit — igraphical (apps/app, apps/admin, apps/tutor)

Audit date: 2026-06-04 · Scope: whole monorepo (student app, admin app, tutor app, shared `packages/auth`, `packages/database`, `packages/utils`, Docker/deployment config)
Method: full source review + verification against the production build's server-action manifest and the shipped client JS bundles. **No production system was attacked; every attack below is derived from the code and from the build artifacts in the repo.**

---

## 0. Bottom line (read this first)

**Yes — there is a real leak, and there are at least four independent ways to watch paid course videos without permission or payment.**

The single worst issue is this:

> **Your login does not check any credential. Typing someone's phone number logs you in as them.**

The password / OTP check is real code, but it lives in a *separate* function that the browser calls *before* login. Because of how Next.js "Server Actions" work, an attacker can simply skip that function and call the login function directly.

Consequences, in order of severity:

| # | What an attacker gets | Effort |
|---|---|---|
| 1 | **Login as ANY student** (phone/email is enough) → open their classroom → watch every purchased video | 1 request |
| 2 | **Free enrollment in any paid course** → then watch all its videos | 1 request |
| 3 | **Full ADMIN control of the platform** (or tutor) | 1 request |
| 4 | **Dump the entire user database** — national IDs, phone numbers, emails, wallet balances | 1 request, loopable |
| 5 | **All admin password hashes**, all tutor records, plaintext OTP codes | 1 request each |

There is also a **live MySQL root password sitting in your git history, pushed to two GitHub remotes** (section 6). Rotate it today regardless of anything else.

---

## 1. Why all of this is possible (the one technical idea you need)

In Next.js (App Router), any file whose first line is `"use server"` turns **every exported async function into a public HTTP endpoint**. The browser calls it by POSTing to the page URL with a `Next-Action: <id>` header.

Two consequences that this codebase does not account for:

1. **Arguments are attacker-controlled.** The UI sending `authenticator(phone)` after OTP entry does *not* stop someone from sending `authenticator(phone)` without OTP entry. The server cannot tell the difference.
2. **The endpoints are public.** They are not behind your `middleware.ts` auth logic in any meaningful way, and they are discoverable — the action IDs are literally embedded in the JavaScript your server sends to every visitor. (Verified: 20 action IDs are present in `apps/app/.next/static/**`.)

Files that should **never** have `"use server"` at the top are the `data/*.ts` files — they are read helpers, not mutations. That single directive is responsible for a large share of the findings below.

Two more patterns that repeat everywhere:

* **`userId` is passed as a function argument instead of being read from the session.** The legitimate UI "helpfully" passes the logged-in user's own id, which hides the hole. An attacker passes anyone's id.
* **Captcha and attempt limits are optional or client-side only.** `if (recaptchaToken)` means "omit the token to skip the captcha". Attempt counters live in React state and reset on refresh.

---

## 2. CRITICAL — the four ways in

### C1. Total authentication bypass — login with only a phone number or email

**Files**

* `packages/auth/app.config.ts:26-46` (students), `packages/auth/admin.config.ts:26-47` (admins), `packages/auth/tutor.config.ts:26-47` (tutors)
* `apps/app/actions/login/authenticator.ts:1-13`, `apps/admin/actions/login/authenticator.ts:1-15`, `apps/tutor/actions/login/authenticator.ts:1-15`

```ts
// packages/auth/admin.config.ts:32-45
authorize: async (credentials) => {
  const { identifier } = credentials as { identifier: string };
  if (!identifier) throw new Error("Invalid Credentials");
  const user = await getAdminByIdentifier(identifier);
  if (!user) throw new Error("User Not Found");
  return { id: user.id.toString() };      // <-- session issued. No password. No OTP.
},
```

```ts
// apps/admin/actions/login/authenticator.ts:6-14
export const authenticator = async (identifier: string) => {
  const res = await signIn("admin-login", { identifier, redirect: false });
  if (res.error) return { error: "Invalid Credentials" };
  redirect("/");
};
```

The `Admin` table has a `password` column (`schema.prisma:47`) and `apps/admin/actions/login/verify-login.ts:19-26` does a correct `bcrypt.compare`, and `verify-otp.ts` checks the SMS code — **but none of that is part of issuing the session.** The browser calls `verifyLogin` → `verifyOtp` → `authenticator` in sequence; the attacker calls only the last one.

**Attack (student app)** — POST the `authenticator` action with one argument:

```
POST /login  HTTP/1.1
Host: igraphical.ir
Next-Action: 7f6164c6123d12e9f0eab7ec31fe501530f9044c1e
Content-Type: application/json

["09121234567"]
```

Response sets a valid `__Secure-authjs.session-token` for that user. (Action ids are build-specific — the one above was verified present in the shipped client bundle for this build. In DevTools you can also just replay the login form's own second network request, which is exactly this call, with the OTP step skipped.)

**Attack (admin app)** — same call against `admin.igraphical.ir` with an admin identifier. The admin's phone/email is even published in the student bundle: `apps/app/data/adminData.ts:1-4`

```ts
export const adminData = { email: "igraphical.ir@gmail.com", phone: "09127452859" };
```

**Impact:** complete account takeover of any student, tutor, or admin. For your question specifically: log in as any student who bought a course → `/panel/courses` → "ورود به کلاس درس" → every video.

**Fix.** The session must only be issued by a function that has itself verified a credential. Move the proof *into* `authorize`, e.g.:

```ts
// after verifyOtp succeeds server-side, mint a short-lived signed token:
const loginToken = signHmac({ identifier, exp: Date.now() + 120_000 }, process.env.AUTH_SECRET);

Credentials({
  credentials: { identifier: {}, loginToken: {} },
  authorize: async ({ identifier, loginToken }) => {
    if (!verifyHmacAndExpiry(loginToken, identifier)) throw new Error("Invalid");
    const user = await getUserByIdentifier(identifier);
    return user ? { id: String(user.id) } : null;
  },
});
```

…and have `verifyOtp` / `verifyLogin` be the only things that can produce `loginToken`. An identifier alone must never be sufficient. Do this for **all three apps** — they share the same flaw.

---

### C2. Free enrollment in any paid course (one request, no payment at all)

**File:** `apps/app/actions/payment.ts:35-119`

```ts
export const createPayment = async (data: PaymentDataType) => {
  const { amount, coursesIds, user, prices, useWallet, useWalletAmount, ... } = data;
  ...
  const newPayment = await database.payment.create({
    data: {
      status: amount > 0 ? "PENDING" : "SUCCESS",     // (a) attacker sets amount = 0
      userId: user.id,                                 // (b) attacker supplies the user object
      total: amount,
      enrollment:
        amount === 0
          ? { create: existingCourses.map((c, index) => ({
              userId: user.id,
              courseId: c.id,
              price: prices[index]!.price,             // (c) attacker supplies the price
              classroom: { create: { userId: user.id } },   // (d) a real classroom is created
            })) }
          : undefined,
    },
  });
  ...
  if (amount > 0) { /* gateway */ } else { /* "purchase complete", no gateway at all */ }
```

There is **no session check** in this function, and **no server-side price lookup anywhere** — `course.basePrice`/`price` is never compared against `amount` or `prices`. The `existingEnrollment` check at :63-68 is the only guard, and it merely stops duplicate purchases.

**Attack** (verified: `createPayment`'s action id is published in the client bundle):

```
POST /cart  HTTP/1.1
Host: igraphical.ir
Cookie: __Secure-authjs.session-token=<your own session>
Next-Action: 7faf991ac9a78a10bf31fb1c3bf1bc6ef2a46da22b
Content-Type: application/json

[{
  "amount": 0,
  "coursesIds": [<id of the most expensive course>],
  "itemsTotal": 0,
  "prices": [{ "courseId": <same id>, "price": 0, "originalPrice": 0 }],
  "useWallet": false,
  "paymentMethod": "NO_METHOD"
}]
```

Result: a `Payment` row with `status: "SUCCESS"`, an `Enrollment`, and a `ClassRoom` — the attacker then opens `/panel/courses`, clicks "ورود به کلاس درس", and watches everything. The classroom page guard (`classroom/[id]/page.tsx:82`, `user.id !== classroom.userId`) passes, because the classroom genuinely belongs to them.

A zero-effort variant for anyone who already has an account: open the cart page, run the same call from the browser console. The only thing stopping it is `disabled={pending}` on the button — a UI attribute.

**Fix.** Never accept `user`, `amount`, `prices`, `itemsTotal` or `useWalletAmount` from the client. In `createPayment`:

```ts
const sessionUser = await getSessionUser();
if (!sessionUser) return { error: "unauthorized" };

// re-read prices from the DB and recompute everything server-side
const courses = await database.course.findMany({ where: { id: { in: coursesIds } } });
const computed = computeTotals(courses, coupon, sessionUser.wallet);  // itemsTotal, discount, amount
if (data.amount !== computed.amount) return { error: "price mismatch" };
```

…and use `sessionUser.id` everywhere `user.id` is used today.

---

### C3. Pay 1 rial (≈ nothing) for any course

**File:** `apps/app/actions/payment.ts:81` → `:139` → `:253` → `:148-157` → `:283`

The attacker-chosen `amount` is what the gateway is asked to charge, what is stored on the cart (`amount * 10`), what the verification step compares against, and what the enrollment is priced at. So put an expensive course in the cart, then call `createPayment` with `"amount": 1` — the gateway charges 10 rial, verification succeeds (it legitimately matches the cart row), and the enrollment is granted for the full course.

The only protection against this is a **client-side** `disabled={cartTotal !== 20000}` on the SADAD option (`CheckoutForm.tsx:543`).

**Fix.** Same as C2 — server-side total. Also bind the amount to the courses: store an immutable server-computed `Payment.total` and verify the gateway response against *that*, and re-check it at enrollment time.

---

### C4. Full admin (and tutor) takeover

**Files:** `apps/admin/actions/login/authenticator.ts:6-14`, `packages/auth/admin.config.ts:32-45`, plus the admin app's total absence of guards:

* `apps/admin/middleware.ts:10-15` — `const isLoggedIn = !!token;` — **cookie presence only**, no signature check, no role check.
* `apps/admin/app/(DASHBOARD)/layout.tsx:8-27` — **no auth check at all**.
* `apps/admin/lib/auth.ts:5` `authenticateSession` — **dead code, zero call sites**.

So there are two independent ways in: call `authenticator` with an admin identifier (C1), or send `Cookie: __Secure-authjs.session-token=x` and get the dashboard (worked because nothing verifies the cookie).

Then everything in the admin app is unguarded. Of ~69 exported functions in `apps/admin/actions`, **zero** check a session (a grep found exactly one that even reads a session, and it only uses it for attribution). Highlights:

* `apps/admin/actions/admin.ts:12` `createAdmin` — create a new ADMIN with a chosen password; `:74` `updateAdmin` — reset any admin's password.
* `apps/admin/actions/wallet.ts:6` `updateWallet` — credit any wallet, any amount.
* `apps/admin/actions/export.ts:6` `fullUserExport` — every user's name/phone/email as XLSX.
* `apps/admin/actions/settlement.ts:59` — mark tutor payouts as paid.
* `apps/admin/data/admin.ts:5-7` — `getAdmins()` returns the whole admin table **including bcrypt password hashes**; `apps/tutor/data/otp.ts:5-10` returns **plaintext OTP codes** for any identifier.

**Fix.** (1) A real role claim in the JWT (`packages/auth/*.config.ts` currently store only `id`) plus real validation in middleware (`auth()`, not `!!token`). (2) A `requireAdmin()` guard at the top of **every** action and data function in the admin/tutor apps — or, better, remove `"use server"` from all `data/*.ts` files. (3) Wire up `authenticateSession()` in the dashboard layout.

---

## 3. CRITICAL — the data leak (probably what the bounty hunters meant)

### The whole user table is readable without logging in

**Files:** `apps/app/data/user.ts:1-25`, and the same pattern in `packages/auth/data/user.ts:1-24`, `apps/admin/data/user.ts`, `apps/tutor/data/tutor.ts`

```ts
"use server";                                    // <-- line 1: turns these into public endpoints
export const getUserByIdentifier = async (phoneOrEmail: string) => {
  return await database.user.findFirst({ where: { OR: [{ phone: phoneOrEmail }, { email: phoneOrEmail }] } });
};
export const getUserById = async (id: number) => {
  if (!id) return;
  return await database.user.findUnique({ where: { id }, include: { image: true, wallet: true } });
};
```

No `auth()`, no ownership check, and `getUserByIdentifier` is imported by a client component (`components/forms/profileForm.tsx:6`), so it is a **confirmed, published, unauthenticated endpoint** (verified present in the client bundle).

**Attack:** POST `getUserById` with `[1]`, `[2]`, `[3]`… and download your entire customer database — `nationalId`, `phone`, `email`, plus wallet balance via the `include`. This is Iranian national ID + phone + email data, i.e. a reportable personal-data breach, not just a business problem.

Related unauthenticated writes in the same style:

* `apps/app/actions/user.ts:69-143` `updateUserProfile(data, id)` — no session check; `id` goes straight into `tx.user.update({ where: { id } })`. **Anyone can rewrite any user's name, national ID, and profile photo** (and delete their old Cloudinary asset).
* `apps/app/actions/user.ts:16-65` `registerUser(data, identifier)` — sets `phoneVerified` / `emailVerified: true` purely from the shape of a client-supplied string, with no OTP verified. Combined with C1 this hands out verified accounts.
* `apps/app/actions/login/otp.ts:12-34` `sendOtp({phoneOrEmail, userId})` — `userId` is caller-supplied and is attached to the OTP row; `verify-otp.ts:38-48` then writes the identifier onto **that** user. An attacker can move their own phone/email onto a victim's account.
* `apps/app/app/panel/tickets/[id]/page.tsx:13-15` — no `userId` filter, so `/panel/tickets/1`, `/2`, `/3`… reads any student's private support thread and attachments.
* `apps/app/actions/classroom.ts:8-158` `createLessonProgress(lessonId, classroomId)` — no ownership check; can complete other students' lessons and trigger their certificate + SMS/email.
* `apps/app/actions/certificate.ts:47-102` `generateCertificateForUser({user, course, enrollmentId})` — no auth; **anyone can mint a "verified" certificate with any name** for any course, and the public verification endpoint will confirm it.
* `apps/app/actions/cart.ts:52-71` `deleteCartItem` — no auth (its sibling `addToCart` at `:7-8` *does* authenticate correctly, so this is clearly an oversight, not policy).
* `apps/app/actions/comment.ts:7-40`, `askTutor.ts:8-98`, `ticket.ts:9-160`, `review.ts:6-32` — all take `userId`/`authorId` as an argument and post content as any user.

**Fix.** Delete `"use server"` from every `data/*.ts` file (they are read helpers — they must not be endpoints), and add a session+ownership check to every action that takes an id. Replace **every** `userId` / `user` / `authorId` argument with `(await getSessionUser())?.id`.

---

## 4. Also confirmed: what is NOT leaking

Worth knowing so you don't chase ghosts:

* **The public course page does not leak paid video URLs.** `apps/app/app/(HOME)/courses/[slug]/page.tsx:38-42` does load every lesson (including `url`), but `CourseCurriculum.tsx:71-85` only renders `lesson.url` for `lesson.isFree === true`, and Next.js does not serialize server-component props to the browser. Only free lesson URLs reach the client. The leak is the access bypasses above, not the course page.
* **A student's cookie cannot be replayed on the admin/tutor apps.** Each app has its own `AUTH_SECRET` (`apps/{app,admin,tutor}/.env.local`), and no shared cookie `domain` is configured. Verified. (You get into admin via C1/C4 instead.)
* `addToCart` correctly derives the user from the session — a good reference for how the rest should look.
* ZarinPal/SADAD gateway *verification itself* is implemented correctly (the amount is compared against the stored cart row, and SADAD's `signData` is validated by the bank). The flaw is that the stored amount was attacker-chosen at creation time.
* All five `/api/cron/*` handlers do check `x-cron-key`.
* No `.env` file is committed to git. Passwords are bcrypt cost 10 and `compare` is used correctly — it is simply not part of the login.
* No wallet top-up path, no `role` column on `User`, so there is no schema-level self-promotion to admin.

---

## 5. HIGH — worth fixing in the same pass

| Finding | Location |
|---|---|
| OTP brute-force: no server-side attempt limit (the 3-try cap is React state), 6 digits, 2-minute window, `===` compare | `apps/app/actions/login/verify-otp.ts:6-51` |
| OTP is generated with `Math.random()` and stored **in plaintext** — the bcrypt call is commented out | `packages/utils/src/otp.ts:8-10, 30-31, 37, 63-70` |
| reCAPTCHA is bypassable by simply omitting the argument: `if (recaptchaToken) await isHumanOrNot(...)`. Disabled/commented out entirely in the admin+tutor logins | `apps/app/actions/login/verify-otp.ts:12`, `apps/app/actions/comment.ts:14`, `apps/admin/actions/login/verify-login.ts:13-14` |
| `verifyPayment` has no session check; the cart is located by request-supplied `authority`/`providerId` (sequential ints), and `paymentMethod` from the query string selects the branch — an unknown value falls through to the Digipay branch | `apps/app/actions/payment.ts:233-256` |
| The sadad/digipay callback routes do zero validation and are explicitly exempted from middleware; they redirect to `/checkout-result?Status=OK` with attacker-controlled parameters | `apps/app/app/api/sadad/route.ts:3-25`, `apps/app/app/api/digipay/route.ts:3-24`, `apps/app/middleware.ts:12-17` |
| Cart is deleted **before** the payment is marked SUCCESS and the enrollment is created; no idempotency guard; no `@@unique([userId, courseId])` on `Enrollment`. A failure here = paid but not enrolled | `apps/app/actions/payment.ts:258-293` |
| Coupon rules (expiry, usage limit, course include/exclude) are enforced **only in the browser**; the server checks existence and does a naked `used: increment 1` | `apps/app/actions/payment.ts:51-55, 188-195`; `CheckoutForm.tsx:315-389` |
| Any user can be impersonated in public comments / Q&A / reviews by passing their id | `actions/comment.ts:23-32`, `actions/review.ts:6-32` |
| File uploads have no server-side type/size validation; `resource_type` comes from the spoofable `file.type` | `actions/askTutor.ts:58-83`, `actions/ticket.ts:32-57` |
| Middleware treats "a cookie exists" as "logged in" (`!!token`) — not a security boundary on its own, but it is your only route gate | `apps/app/middleware.ts:5-10`, `apps/admin/middleware.ts:10-15`, `apps/tutor/middleware.ts:5-10` |
| No security headers anywhere (no CSP, HSTS, X-Frame-Options) | `apps/*/next.config.ts` |

---

## 6. Infrastructure & secrets — do these today, they are not code fixes

1. **A MySQL root password is in your git history and pushed to two GitHub remotes.**
   It appears in `docker-compose.yml` in commit `bb356ea` ("Edit Dockerfiles to overcome sanctions"), removed later in `9ed4177`. Both `origin` (github.com/ezlegin/igraphical) and `upstream` (github.com/ezlegini-ir/igraphical) contain `bb356ea`. The same password is reused as `DIGIPAY_PASSWORD`.
   → **Rotate it now.** Then purge history (`git filter-repo` / BFG) and force-push. Deleting the file is not enough — assume it is compromised.
2. **Every secret is baked into your Docker images.** `.dockerignore` contains only `node_modules`, while each Dockerfile does `COPY . .` — so `.env`, all three `.env.local`, `packages/database/.env`, `apps/admin/ga.json` (a Google service-account **private key**) and `.git/` are permanently in the image layers. Anyone who can pull the image extracts everything.
   → Add `.env*`, `ga.json`, `.git` to `.dockerignore`; move build secrets to BuildKit `--mount=type=secret`.
3. **Secrets passed as Docker build args** (`DATABASE_URL`, `RESEND_API_KEY`) — visible via `docker history --no-trunc`. `docker-compose.yml:60-62, 86-88, 113-115`.
4. **MySQL runs as root with an empty password** (`MYSQL_ALLOW_EMPTY_PASSWORD: "1"`, `mysql://root@database`). It is not port-published, but it shares the `app_network` with nginx-proxy, which mounts `docker.sock` — so any RCE in any container on that network gets unauthenticated DB root. Give MySQL a real password and a non-root app user, and remove the hardcoded DSN at `apps/admin/Dockerfile:50`.
5. **Rotate everything else too**, on the assumption the image/history leaked: `AUTH_SECRET` ×3 (this also invalidates all existing sessions — a feature right now), ZarinPal access token, Digipay client secret/authorization/username/password, SADAD terminal key, Cloudinary, Resend, Kavenegar, `CRON_SECRET_KEY`, and delete/replace the `ga.json` service-account key. Stop reusing the DB password for Digipay.
6. Legacy SADAD credentials are commented out in tracked source at `apps/app/actions/sadad.ts:24-26` and have been in git since `93e487e` — confirm they are revoked.

---

## 7. Suggested fix order

**Today (no code changes):**
1. Rotate the MySQL root password; purge it from git history.
2. Put `admin.igraphical.ir` and `tutor.igraphical.ir` behind an IP allowlist / VPN / HTTP basic auth at nginx. Right now they are publicly reachable and trivially bypassable — this buys you time while you fix C1/C4.
3. Rotate the payment-gateway and Cloudinary credentials.
4. Add `.env*` and `ga.json` to `.dockerignore`; rebuild images.

**This week (the actual fixes, in this order):**

| Order | Fix | Why first |
|---|---|---|
| 1 | Real credential verification inside `authorize` for all three apps (signed short-lived OTP/password proof) | Every other control is decorative while login is free |
| 2 | Remove `"use server"` from all `data/*.ts` files | Instantly closes the PII dump and the admin/tutor data exposure |
| 3 | `createPayment`: session user + server-computed amounts | Closes free/cheap enrollment |
| 4 | `requireAdmin()` / `requireTutor()` guards on every action in admin & tutor; add a role claim to the JWT; validate sessions in middleware | Closes platform takeover |
| 5 | Replace every `userId`/`user`/`authorId`/`id` argument with the session user, and add ownership checks to tickets, classroom, askTutor, cart, comments, reviews, certificates | Closes the remaining IDOR family |
| 6 | Server-side OTP: attempt cap, `crypto.randomInt`, hashed storage, timing-safe compare; make captcha mandatory (not `if (token)`) | Closes brute force and spam |
| 7 | Payment: make the callback idempotent, order the writes correctly, add `@@unique([userId, courseId])`, validate callbacks server-side in the route instead of trusting the client | Correctness + fraud |
| 8 | Security headers, rate limiting, remove debug `console.log`s of gateway data (`actions/sadad.ts:117`) | Hardening |

**Quick sanity test after fixing C1:** in an incognito window, POST the login page's second request (the one carrying only the identifier) *without* completing the OTP step. Before the fix you get a session; after the fix you must get an error.

---

## 8. How this was verified

* All findings come from reading the source; every claim in this report cites a file and line.
* Reachability was confirmed against the real build, not assumed: `apps/app/.next/server/server-reference-manifest.json` lists the registered server actions, and I extracted the action ids actually embedded in `apps/app/.next/static/**/*.js`. `authenticator`, `createPayment`, `updateUserProfile`, `getUserByIdentifier`, `sendOtp`, `registerUser`, `createLessonProgress`, `verifyPayment`, `addToCart`, `createAskTutor`, `sendTicketMessage`, `generateCertificateForUser` and others are published to the browser — i.e. callable by anyone with a `fetch()`.
* The `getAdmins()` / `getAdminByIdentifier()` / `getTutorByIdentifier()` exports are registered as actions but their ids were **not** found in the client bundle, so those specific ones need id discovery rather than being one-line exploits — they should still be fixed.
* Cross-app cookie reuse and the public course page were specifically tested and cleared (section 4), so the report does not overstate the risk.
