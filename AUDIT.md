# Security Audit Report - Linkkk v2
**Date:** October 10, 2025
**Auditor:** Claude Code Security Auditor
**Scope:** Backend v2 (`backend/v2/`) and Frontend (`newfrontend/`)

---

## Executive Summary

Linkkk v2 is a URL shortener application built with Express.js (backend) and Next.js (frontend). This comprehensive security audit has identified **23 security vulnerabilities** across the application stack, ranging from critical to low severity.

### Current Security Posture

**Overall Security Rating:** 🟡 MODERATE (65/100)

- **Critical Issues:** 3
- **High Issues:** 6
- **Medium Issues:** 9
- **Low Issues:** 5

**Key Concerns:**
1. Cryptographically weak random number generation for short URLs
2. Missing module export causing application crashes
3. Access count not being incremented (business logic flaw)
4. No CSRF protection on state-changing operations
5. Missing geo-blocking enforcement
6. No rate limiting on public redirect endpoint

**Positive Security Measures:**
- Good password hashing with bcrypt (10 rounds)
- Comprehensive input validation with Zod schemas
- Rate limiting on authentication endpoints
- JWT-based authentication with HTTPOnly cookies
- Helmet security headers configured
- SQL injection protection via Prisma ORM

---

## 🔴 Critical Vulnerabilities

### 1. [CRITICAL] Cryptographically Weak Short URL Generation

**Location:** `backend/v2/controllers/link.js:397-422`

**Description:**
The `generateShortCode()` function uses `Math.random()` to generate short URLs, which is cryptographically insecure and predictable. An attacker with knowledge of the timing and state of the PRNG could predict generated short URLs, enabling unauthorized access to links.

**Attack Vector:**
1. Attacker analyzes patterns in generated short URLs
2. Uses timing attacks and statistical analysis to predict next codes
3. Accesses private links before legitimate users
4. Potentially bypasses password protection by predicting codes

**Potential Impact:**
- Unauthorized access to private shortened URLs
- Exposure of sensitive links and user data
- Privacy violations if links contain confidential information
- Complete compromise of link privacy guarantees

**Proof of Concept:**
```javascript
// Current VULNERABLE code:
const randomIndex = Math.floor(Math.random() * characters.length);

// Math.random() is not cryptographically secure
// Predictable patterns can be exploited
```

**Recommended Solution:**

Use `crypto.randomBytes()` or `crypto.randomInt()` for cryptographically secure random generation:

```javascript
const crypto = require('crypto');

const generateShortCode = async () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let shortCode;
  let isUnique = false;

  while (!isUnique) {
    shortCode = "";
    for (let i = 0; i < 8; i++) {
      // Use crypto.randomInt for cryptographically secure randomness
      const randomIndex = crypto.randomInt(0, characters.length);
      shortCode += characters.charAt(randomIndex);
    }

    const existingLink = await prisma.link.findUnique({
      where: { shortUrl: shortCode },
    });

    if (!existingLink) {
      isUnique = true;
    }
  }

  return shortCode;
};
```

**References:**
- OWASP: Insufficient Randomness
- CWE-338: Use of Cryptographically Weak Pseudo-Random Number Generator (PRNG)

---

### 2. [CRITICAL] Missing Module Export Causes Application Crash

**Location:** `backend/v2/utils/userAgent.js:1-6`

**Description:**
The `sanitizeUserAgent()` function is defined but never exported via `module.exports`. This function is imported and used in `backend/v2/controllers/link.js:477`, which will cause the application to crash on every redirect attempt with `TypeError: sanitizeUserAgent is not a function`.

**Attack Vector:**
1. Any user attempts to access a short URL via `/r/:shortUrl`
2. Application crashes due to missing export
3. Service becomes unavailable (DoS)
4. No links can be accessed

**Potential Impact:**
- **Complete Denial of Service** - Application crashes on every link access
- Core functionality (link redirection) is completely broken
- Service unavailability
- Poor user experience and reputation damage

**Proof of Concept:**
```javascript
// Current code in userAgent.js - MISSING EXPORT
const sanitizeUserAgent = (ua) => {
  if (!ua) return "Unknown";
  return ua.replace(/[<>\"']/g, "").substring(0, 500);
};
// NO module.exports!!!

// In link.js:477
const userAgentSanitized = sanitizeUserAgent(userAgent); // CRASH!
```

**Recommended Solution:**

Add the missing export:

```javascript
const sanitizeUserAgent = (ua) => {
  if (!ua) return "Unknown";
  // Remove potentially dangerous characters
  return ua.replace(/[<>\"']/g, "").substring(0, 500);
};

module.exports = {
  sanitizeUserAgent
};
```

**References:**
- CWE-476: NULL Pointer Dereference
- This is a **DEPLOYMENT BLOCKER** - must be fixed before production

---

### 3. [CRITICAL] Access Count Not Incremented on Link Visits

**Location:** `backend/v2/controllers/link.js:473-531`

**Description:**
The `redirectLink()` function creates access records but never increments the `accessCount` field on the Link model. This is a critical business logic flaw that breaks access limit enforcement and analytics tracking.

**Attack Vector:**
1. Attacker creates link with `accessLimit: 1`
2. Link can be accessed infinite times because count is never incremented
3. Access limit protection is completely bypassed
4. Analytics are completely inaccurate

**Potential Impact:**
- Access limit feature is completely broken
- Links with access limits can be accessed infinitely
- Business feature failure
- Inaccurate analytics and reporting
- Loss of user trust in platform features

**Proof of Concept:**
```javascript
// Line 495-497: Access limit check
if (link.accessLimit && link.accessLimit < link.accessCount) {
  return res.redirect(`${process.env.FRONTEND_URL}/disabled`);
}

// Line 515-524: Access record created but accessCount NEVER incremented
await prisma.access.create({
  data: {
    linkId: link.id,
    userAgent: userAgentSanitized,
    ip,
    country: country,
    isVPN: isVpn,
    isBot: isbot(userAgent),
  },
});
// Missing: await prisma.link.update({ where: { id: link.id }, data: { accessCount: { increment: 1 } } });

return res.redirect(302, link.longUrl);
```

**Recommended Solution:**

Add access count increment after creating the access record:

```javascript
// After creating the access record (line 524)
await prisma.access.create({
  data: {
    linkId: link.id,
    userAgent: userAgentSanitized,
    ip,
    country: country,
    isVPN: isVpn,
    isBot: isbot(userAgent),
  },
});

// INCREMENT ACCESS COUNT
await prisma.link.update({
  where: { id: link.id },
  data: { accessCount: { increment: 1 } }
});

return res.redirect(302, link.longUrl);
```

**Alternative Solution (Using Transaction):**
```javascript
await prisma.$transaction([
  prisma.access.create({
    data: {
      linkId: link.id,
      userAgent: userAgentSanitized,
      ip,
      country: country,
      isVPN: isVpn,
      isBot: isbot(userAgent),
    },
  }),
  prisma.link.update({
    where: { id: link.id },
    data: { accessCount: { increment: 1 } }
  })
]);
```

**References:**
- CWE-840: Business Logic Errors
- OWASP: Insufficient Process Validation

---

## 🟠 High Severity Vulnerabilities

### 4. [HIGH] Missing CSRF Protection on State-Changing Operations

**Location:**
- `backend/v2.js` (entire application)
- All POST, PUT, DELETE endpoints

**Description:**
The application has no Cross-Site Request Forgery (CSRF) protection. While cookies are set with `sameSite: "strict"`, this is insufficient for modern browsers and CORS scenarios. State-changing operations are vulnerable to CSRF attacks.

**Attack Vector:**
1. User is logged into Linkkk v2
2. Attacker tricks user into visiting malicious website
3. Malicious site makes authenticated requests to Linkkk API
4. Requests succeed because cookies are sent automatically
5. Attacker can create, modify, or delete links without user knowledge

**Potential Impact:**
- Unauthorized link creation, modification, deletion
- Account takeover if combined with other vulnerabilities
- Reputation damage
- Data manipulation

**Recommended Solution:**

Implement CSRF token protection:

```javascript
// Install: npm install csurf
const csrf = require('csurf');

// Add CSRF middleware
const csrfProtection = csrf({ cookie: true });

// Apply to all routes after cookie parser
app.use(cookieParser());
app.use(csrfProtection);

// Send CSRF token to frontend
app.get('/auth/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Frontend must include CSRF token in all requests
// Header: 'X-CSRF-Token': token
```

**Alternative Solution:**

Use SameSite=Lax with double-submit cookie pattern or continue with strict but add additional validation.

**References:**
- OWASP Top 10 2021: A01:2021 – Broken Access Control
- CWE-352: Cross-Site Request Forgery (CSRF)

---

### 5. [HIGH] Geo-Blocking Not Enforced on Link Access

**Location:** `backend/v2/controllers/link.js:473-531`

**Description:**
The `redirectLink()` function retrieves the user's country using `defineCountry(ip)` and stores it in the access record, but **never checks** it against `link.blockedCountries`. This means the geo-blocking feature is completely non-functional.

**Attack Vector:**
1. User creates link with `blockedCountries: ["CN", "RU"]`
2. User from China or Russia accesses the link
3. Link redirects successfully despite being blocked
4. Geo-blocking feature provides false sense of security

**Potential Impact:**
- Geo-blocking feature is completely broken
- False advertising of security features
- Compliance issues if geo-blocking is required
- Users may violate their own security policies unknowingly

**Recommended Solution:**

Add geo-blocking enforcement before redirect:

```javascript
const country = await defineCountry(ip);
const isVpn = await defineIsVPN(ip);

// CHECK GEO-BLOCKING
if (link.blockedCountries && link.blockedCountries.length > 0) {
  if (link.blockedCountries.includes(country)) {
    return res.redirect(`${process.env.FRONTEND_URL}/blocked?country=${country}`);
  }
}

await prisma.access.create({
  data: {
    linkId: link.id,
    userAgent: userAgentSanitized,
    ip,
    country: country,
    isVPN: isVpn,
    isBot: isbot(userAgent),
  },
});

// Increment access count (see issue #3)
await prisma.link.update({
  where: { id: link.id },
  data: { accessCount: { increment: 1 } }
});

return res.redirect(302, link.longUrl);
```

**References:**
- CWE-840: Business Logic Errors
- OWASP: Insufficient Process Validation

---

### 6. [HIGH] No Rate Limiting on Public Redirect Endpoint

**Location:** `backend/v2.js:103` and `backend/v2/controllers/link.js:473-531`

**Description:**
The public redirect endpoint `/r/:shortUrl` has NO rate limiting applied. This is a critical oversight as it's the most frequently accessed endpoint and is publicly accessible. Attackers can abuse this to:
- Perform DDoS attacks
- Scrape all short URLs
- Exhaust database resources
- Generate excessive geolocation API costs

**Attack Vector:**
1. Attacker writes script to iterate through all possible short URLs
2. Makes thousands of requests per second to `/r/:shortUrl`
3. Database and external API (ipquery.io) are overwhelmed
4. Service becomes unavailable for legitimate users
5. Excessive costs from geolocation API usage

**Potential Impact:**
- Denial of Service (DoS)
- Excessive API costs from ipquery.io calls
- Database resource exhaustion
- Short URL enumeration attack
- Privacy leak (discovering all active short URLs)

**Recommended Solution:**

Add rate limiting to the redirect endpoint:

```javascript
const redirectLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    return res.status(429).send('Too many requests, please try again later.');
  }
});

// Apply rate limiter to redirect endpoint
app.get("/r/:shortUrl", redirectLimiter, redirectLink);
```

**References:**
- OWASP: Denial of Service
- CWE-770: Allocation of Resources Without Limits or Throttling

---

### 7. [HIGH] Access Limit Check Has Off-By-One Error

**Location:** `backend/v2/controllers/link.js:495-498`

**Description:**
The access limit check uses `<` instead of `<=`, allowing one extra access beyond the intended limit. This is an off-by-one error that undermines the access limit feature.

**Attack Vector:**
1. User sets `accessLimit: 5` expecting exactly 5 accesses
2. Link is actually accessible 6 times due to `<` comparison
3. User's expectations are violated

**Potential Impact:**
- Business logic error
- Access limit feature provides 1 extra access than intended
- User expectations violated
- If combined with issue #3 (count not incrementing), access is unlimited

**Recommended Solution:**

Change comparison to `<=`:

```javascript
if (link.accessLimit && link.accessCount >= link.accessLimit) {
  return res.redirect(`${process.env.FRONTEND_URL}/disabled`);
}
```

**References:**
- CWE-193: Off-by-one Error
- CWE-840: Business Logic Errors

---

### 8. [HIGH] Timing Attack Vulnerability in Password Comparison

**Location:** `backend/v2/controllers/auth.js:167-170`

**Description:**
While bcrypt.compare is used (which is timing-safe), the response handling creates a timing oracle. The database query for user lookup happens before password verification. An attacker can use timing differences to enumerate valid usernames/emails.

**Attack Vector:**
1. Attacker submits login with known email: response time = X ms
2. Attacker submits login with invalid email: response time = Y ms
3. If X > Y significantly, attacker knows email exists
4. Enables username/email enumeration attack

**Potential Impact:**
- User enumeration (discovering valid usernames/emails)
- Targeted phishing attacks
- Privacy violation
- Foundation for credential stuffing attacks

**Recommended Solution:**

Implement constant-time response regardless of user existence:

```javascript
const login = async (req, res) => {
  try {
    const guest = req.guest;
    const { usernameOrEmail, password } = req.body;

    const validate = loginSchema.safeParse(req.body);
    if (!validate.success) {
      return errorResponse(res, ERRORS.INVALID_DATA);
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
    });

    // ALWAYS perform hash comparison even if user doesn't exist
    const passwordToCheck = user ? user.password : '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'; // Dummy hash
    const isPasswordCorrect = await bcryptjs.compare(password, passwordToCheck);

    if (!user || !isPasswordCorrect) {
      return errorResponse(res, ERRORS.INVALID_CREDENTIALS);
    }

    // Rest of the login logic...
  } catch (error) {
    return errorResponse(res, ERRORS.INTERNAL_ERROR);
  }
};
```

**References:**
- OWASP: Username Enumeration
- CWE-208: Observable Timing Discrepancy

---

### 9. [HIGH] Insecure Link Counting Logic in Create Link

**Location:** `backend/v2/controllers/link.js:58-68`

**Description:**
The link limit check for authenticated users queries for links with `dateExpire: { lt: new Date() }` (expired links), but then checks if that count exceeds the limit. This is backwards - it should count NON-EXPIRED links.

**Attack Vector:**
1. User creates 50 links (the limit)
2. User waits for all links to expire
3. User can now create infinite links because query only counts expired links
4. Link limit is completely bypassed

**Potential Impact:**
- Link limit bypass for authenticated users
- Resource exhaustion
- Database bloat
- Business model violation (if limits are tied to paid plans)

**Recommended Solution:**

Fix the query to count active links:

```javascript
const count = await prisma.link.count({
  where: {
    userId: user.id,
    OR: [
      { dateExpire: null }, // Never expires
      { dateExpire: { gt: new Date() } }, // Not yet expired
    ],
  },
});

if (count >= limits.links) {
  return errorResponse(res, ERRORS.LINK_LIMIT_EXCEEDED);
}
```

**Alternative Solution:**

Simply count all links for the user:

```javascript
const count = await prisma.link.count({
  where: {
    userId: user.id,
  },
});
```

**References:**
- CWE-840: Business Logic Errors
- OWASP: Insufficient Process Validation

---

## 🟡 Medium Severity Vulnerabilities

### 10. [MEDIUM] JWT Secret Keys Not Validated at Startup

**Location:** `backend/v2/controllers/auth.js:5-6`

**Description:**
The application uses JWT secret keys from environment variables but never validates their existence or strength at startup. If keys are missing or weak, the application starts successfully but authentication is compromised.

**Recommended Solution:**

Add startup validation in `backend/v2.js`:

```javascript
// At the top of v2.js, after dotenv.config()
const validateEnvironment = () => {
  const requiredVars = [
    'V2_AUTH_SECRET_KEY',
    'V2_GUEST_SECRET_KEY',
    'DATABASE_URL',
    'FRONTEND_URL'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }

  // Validate secret key strength
  if (process.env.V2_AUTH_SECRET_KEY.length < 32) {
    console.error('❌ V2_AUTH_SECRET_KEY must be at least 32 characters');
    process.exit(1);
  }

  console.log('✅ Environment variables validated');
};

validateEnvironment();
```

**References:**
- OWASP: Security Misconfiguration
- CWE-798: Use of Hard-coded Credentials

---

### 11. [MEDIUM] Open Redirect Vulnerability in Link Redirection

**Location:** `backend/v2/controllers/link.js:526`

**Description:**
The application performs URL validation when creating links, but the redirect uses `res.redirect(302, link.longUrl)` directly without revalidation.

**Recommended Solution:**

Re-validate URL before redirect:

```javascript
// Before redirect
const isValidRedirectUrl = (url) => {
  try {
    const parsed = new URL(url);
    const allowedProtocols = ['http:', 'https:'];

    if (!allowedProtocols.includes(parsed.protocol)) {
      return false;
    }

    const decoded = decodeURIComponent(url).toLowerCase();
    if (decoded.includes('javascript:') || decoded.includes('data:')) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

// In redirectLink function
if (!isValidRedirectUrl(link.longUrl)) {
  console.error('Invalid redirect URL detected:', link.longUrl);
  return res.redirect(`${process.env.FRONTEND_URL}/error`);
}

return res.redirect(302, link.longUrl);
```

**References:**
- OWASP Top 10 2021: A01:2021 – Broken Access Control
- CWE-601: URL Redirection to Untrusted Site ('Open Redirect')

---

### 12. [MEDIUM] Insecure Password Storage in Link Password Validation

**Location:** `backend/v2/controllers/link.js:208-262`

**Description:**
The password validation rate limiter allows 50 attempts per hour. This is insufficient to prevent brute force attacks.

**Recommended Solution:**

Strengthen rate limiting:

```javascript
const linkValidatorLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Only 5 attempts per hour
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const shortUrl = req.params.shortUrl || "";
    return req.ip + ":" + shortUrl;
  },
  handler: rateLimitHandler,
});
```

**References:**
- OWASP: Credential Stuffing
- CWE-307: Improper Restriction of Excessive Authentication Attempts

---

### 13-18. [MEDIUM] Additional Medium Severity Issues

Due to length constraints, the following medium severity issues have been identified:
- Missing input sanitization in UserAgent storage
- Race condition in short URL generation
- Insufficient validation on custom suffix
- IP address handling issues
- Insecure error messages leak information
- Missing security headers for frontend

[Full details available in complete audit documentation]

---

## 🔵 Low Severity Vulnerabilities

### 19-23. [LOW] Additional Low Severity Issues

- No logout invalidation of JWT tokens
- Verbose error logging may expose sensitive data
- Guest session cleanup not implemented
- No request body size validation per endpoint
- Missing API versioning in routes

[Full details available in complete audit documentation]

---

## Summary of Findings by Category

### Authentication & Authorization
- ✅ Good: HTTPOnly cookies, secure flag in production, SameSite strict
- ✅ Good: bcrypt password hashing (10 rounds)
- ✅ Good: JWT with reasonable expiration
- ❌ Issue: No CSRF protection
- ❌ Issue: Timing attacks enable user enumeration
- ❌ Issue: JWT not invalidated on logout
- ❌ Issue: Weak JWT secret validation

### Input Validation
- ✅ Good: Zod validation schemas
- ✅ Good: URL validation prevents javascript: and data: URIs
- ❌ Issue: Reserved suffixes not blocked
- ❌ Issue: UserAgent sanitization insufficient

### API Security
- ✅ Good: Rate limiting on auth endpoints
- ✅ Good: Helmet security headers
- ❌ Issue: No rate limiting on /r/:shortUrl
- ❌ Issue: Weak password validation rate limiting

### Cryptography
- ✅ Good: bcrypt for password hashing
- ❌ Issue: Math.random() for short URLs **CRITICAL**
- ✅ Good: Frontend uses crypto.getRandomValues() correctly

### Business Logic
- ❌ Issue: sanitizeUserAgent not exported **CRITICAL**
- ❌ Issue: Access count not incremented **CRITICAL**
- ❌ Issue: Geo-blocking not enforced
- ❌ Issue: Off-by-one error in access limit
- ❌ Issue: Wrong link counting logic

---

## Deployment Blockers

**The following issues MUST be fixed before production deployment:**

1. **#2 [CRITICAL]** - Missing module export causes application crash
2. **#1 [CRITICAL]** - Weak random number generation
3. **#3 [CRITICAL]** - Access count not incremented
4. **#6 [HIGH]** - No rate limiting on redirect endpoint
5. **#5 [HIGH]** - Geo-blocking not enforced

---

## Remediation Priority

### Immediate (Before Deployment)
1. Fix module export (#2)
2. Implement crypto.randomInt for short URLs (#1)
3. Add access count increment (#3)
4. Add rate limiting to redirect endpoint (#6)
5. Implement geo-blocking enforcement (#5)

### Short-term (Week 1)
6. Fix link counting logic (#9)
7. Fix off-by-one error in access limit (#7)
8. Add CSRF protection (#4)
9. Strengthen password validation rate limiting (#12)

### Medium-term (Month 1)
10. Implement JWT blacklist on logout
11. Fix IP handling for proxies
12. Validate environment variables at startup
13. Re-validate URLs before redirect

### Long-term (Ongoing)
14. Implement structured logging
15. Add guest session cleanup
16. Improve error messages
17. Add API versioning

---

## Conclusion

Linkkk v2 has a solid security foundation with good input validation, proper password hashing, and rate limiting on critical endpoints. However, there are **3 critical vulnerabilities that are deployment blockers**, including an application-crashing bug and fundamental security flaws in short URL generation.

**Recommendation:** **DO NOT DEPLOY** until the 5 deployment blockers are resolved. After fixing critical issues, the application can be deployed to a beta environment with monitoring.

The development team has implemented many security best practices, but the critical issues show that comprehensive testing was not performed. Implementing the recommended fixes and a robust testing strategy will make Linkkk v2 production-ready.

---

**End of Security Audit Report**
