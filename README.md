<div align="center">

![Linkkk Logo](frontend/public/favicon.svg)

# **Linkkk v2**

### _The smart URL shortener that thinks before it redirects._

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-316192?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

**[Live Demo](https://linkkk.dev)** • **[API Reference](#-api)**

---

</div>

## 🎯 **What Makes Linkkk Different?**

Linkkk isn't just another URL shortener. It's a **rules-based redirection engine** that lets you create intelligent links that adapt to your audience.

### **Think of it like this:**

- 🌍 **Geo-targeting** → Send visitors from Spain to `/es` and UK visitors to `/en`
- 📱 **Device detection** → Mobile users get the app store, desktop users see the website
- 🤖 **Bot filtering** → Block crawlers or redirect them to a special page
- 🔐 **Password gates** → Protect sensitive links with passwords and hints
- 🚫 **VPN detection** → Block or redirect VPN traffic
- 📊 **Access count conditions** → Create self-destructing links after N clicks
- 🕒 **Time-based rules** → Activate links only during specific dates/times

**All of this, without writing a single line of code.**

---

## ✨ **Core Features**

<table>
<tr>
<td width="50%">

### 🔗 **Smart Link Management**

- Create short, memorable URLs
- Toggle links on/off instantly
- Track every click with detailed analytics
- Filter and search your links
- Drag-and-drop rule prioritization

</td>
<td width="50%">

### 🧠 **Conditional Link Rules**

- **7 condition types**: Country, device, IP, VPN, bot, date, access count
- **4 action types**: Redirect, block, password gate, webhooks
- **AND/OR logic** for complex scenarios
- **Else actions** for fallback behavior
- **Priority-based evaluation**

</td>
</tr>
<tr>
<td width="50%">

### 📊 **Deep Analytics**

- Real-time click tracking
- Geographic distribution (country detection)
- Device breakdown (mobile/tablet/desktop)
- VPN and bot detection
- Access history with IP logging
- Full access records per link

</td>
<td width="50%">

### 🎨 **Modern UI/UX**

- Neo-brutalist design language
- Smooth animations (Framer Motion)
- Mobile-first responsive design
- Bottom navigation for mobile
- Dark mode interface
- Inline editing and creation

</td>
</tr>
<tr>
<td width="50%">

### 🔐 **Multi-Tier Authentication**

- **Guest mode**: Try before you sign up (1-hour sessions)
- **User accounts**: Full analytics and higher limits
- **JWT-based auth** with httpOnly cookies
- **Automatic link migration** from guest to user

</td>
<td width="50%">

### 🛡️ **Enterprise-Grade Security**

- CSRF protection (SameSite cookies)
- XSS prevention (httpOnly cookies)
- SSRF protection (URL validation)
- SQL injection immunity (Prisma ORM)
- Rate limiting per endpoint
- Bcrypt password hashing (12 rounds)

</td>
</tr>
</table>

---

## 🚀 **Quick Start**

### **Prerequisites**

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### **1. Clone & Install**

```bash
git clone https://github.com/aka-alvaroso/Linkkk.git
cd Linkkk

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### **2. Configure Environment**

**Backend** (`backend/.env`):

```env
DATABASE_URL="postgresql://user:password@localhost:5432/linkkk"
JWT_SECRET="your-super-secret-jwt-key-change-this"
FRONTEND_URL="http://localhost:3001"
NODE_ENV="development"
PORT=3000
```

**Frontend** (`frontend/.env.local`):

```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### **3. Database Setup**

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### **4. Run the App**

**Backend** (port 3000):

```bash
cd backend
npm run dev
```

**Frontend** (port 3001):

```bash
cd frontend
npm run dev
```

🎉 **Open** → [http://localhost:3001](http://localhost:3001)

---

## 📚 **Architecture**

```
Linkkk v2/
│
├── 🎨 frontend/          # Next.js 15 + React 19 + TypeScript
│   ├── app/
│   │   ├── components/   # UI components (Button, Input, Drawer, etc.)
│   │   ├── hooks/        # Custom hooks (useAuth, useLinks, etc.)
│   │   ├── stores/       # Zustand state management
│   │   ├── services/     # API client services
│   │   └── utils/        # Helpers and utilities
│   └── public/           # Static assets
│
└── ⚙️ backend/           # Express.js + Prisma + PostgreSQL
    └── v2/
        ├── controllers/  # Business logic
        ├── routers/      # Route definitions
        ├── middlewares/  # Auth & rate limiting
        ├── validators/   # Zod schemas
        ├── utils/        # Link rules engine, helpers
        ├── prisma/       # Database schema & client
        └── constants/    # Error codes & configs
```

### **Tech Stack**

| Layer             | Technology                                                     |
| ----------------- | -------------------------------------------------------------- |
| **Frontend**      | Next.js 15, React 19, TypeScript, Tailwind CSS 4, Zustand     |
| **Backend**       | Node.js, Express.js, Prisma ORM, PostgreSQL                   |
| **Security**      | Helmet, JWT, bcryptjs, express-rate-limit                     |
| **Animations**    | Framer Motion (`motion` library)                              |
| **Validation**    | Zod                                                           |
| **UI Components** | Custom component library (Button, Input, Modal, Drawer, Toast)|
| **Drag & Drop**   | @dnd-kit                                                      |
| **Icons**         | react-icons                                                   |

---

## 🧪 **Link Rules Engine**

The heart of Linkkk v2. Here's how it works:

### **Anatomy of a Rule**

```json
{
  "priority": 1,
  "enabled": true,
  "match": "AND",
  "conditions": [
    {
      "field": "country",
      "operator": "in",
      "value": ["ES", "MX", "AR"]
    },
    {
      "field": "device",
      "operator": "equals",
      "value": "mobile"
    }
  ],
  "actionType": "redirect",
  "actionSettings": {
    "url": "https://example.com/mobile-es"
  },
  "elseActionType": "redirect",
  "elseActionSettings": {
    "url": "{{longUrl}}"
  }
}
```

### **Condition Types**

| Field          | Operators                             | Example Values                      |
| -------------- | ------------------------------------- | ----------------------------------- |
| `country`      | `in`, `not_in`                        | `["US", "CA", "GB"]`                |
| `device`       | `equals`, `not_equals`                | `"mobile"`, `"tablet"`, `"desktop"` |
| `ip`           | `equals`, `not_equals`                | `"192.168.1.1"`                     |
| `is_vpn`       | `equals`                              | `true`, `false`                     |
| `is_bot`       | `equals`                              | `true`, `false`                     |
| `date`         | `before`, `after`, `equals`           | `"2025-12-31T23:59:59Z"`            |
| `access_count` | `equals`, `greater_than`, `less_than` | `100`                               |

### **Action Types**

1. **`redirect`** → Send users to a different URL

   - Supports template variables: `{{longUrl}}`, `{{shortUrl}}`
   - SSRF protection (blocks private IPs)

2. **`block_access`** → Show a custom message and prevent access

   ```json
   {
     "reason": "This content is not available in your region."
   }
   ```

3. **`password_gate`** → Require a password to continue

   ```json
   {
     "password": "secret123",
     "hint": "Starts with 's'"
   }
   ```

4. **`notify`** → Trigger a webhook on link access

   ```json
   {
     "webhookUrl": "https://your-server.com/webhook",
     "method": "POST"
   }
   ```

### **Evaluation Flow**

1. Rules are sorted by **priority** (lower = first)
2. Conditions are evaluated based on **match type** (AND/OR)
3. If conditions match → **primary action** executes
4. If conditions don't match → **else action** executes (if defined)
5. First matching rule wins (evaluation stops)

### **Example Use Cases**

**Geo-targeting with fallback:**

```
IF country IN [ES, MX, AR] AND device = mobile
  → Redirect to https://example.com/mobile-es
ELSE
  → Redirect to original URL
```

**Password-protected link:**

```
IF access_count < 50
  → Require password "launch2025"
ELSE
  → Block access (expired)
```

**Bot filtering:**

```
IF is_bot = true
  → Block access
ELSE
  → Redirect to original URL
```

---

## 🔒 **Security Features**

| Feature            | Implementation                                                                        |
| ------------------ | ------------------------------------------------------------------------------------- |
| **Authentication** | JWT tokens (7-day expiration for users, 1-hour for guests)                           |
| **Cookies**        | httpOnly, SameSite=Strict, Secure (production)                                        |
| **Passwords**      | bcrypt hashing (10 rounds for auth, 12 for link passwords)                            |
| **SQL Injection**  | Prisma ORM with parameterized queries                                                 |
| **XSS**            | httpOnly cookies, User-Agent sanitization (max 500 chars)                             |
| **CSRF**           | SameSite=Strict cookies                                                               |
| **SSRF**           | URL validation blocks private/local IPs (192.168.x, 10.x, 127.x, AWS metadata)        |
| **Rate Limiting**  | Per-endpoint limits (e.g., 5 login attempts/15min, 50 link creations/hour)            |
| **Headers**        | Helmet.js (CSP, HSTS, X-Frame-Options, Permissions-Policy)                            |
| **Enumeration**    | Generic error messages (no user existence leakage)                                    |

---

## 📊 **Plan Limits**

| Feature                 | Guest  | Registered User |
| ----------------------- | ------ | --------------- |
| **Max Links**           | 10     | 50              |
| **Link Expiration**     | 7 days | Never           |
| **Rules per Link**      | 1      | 5               |
| **Conditions per Rule** | 1      | 3               |
| **Analytics**           | ❌     | ✅              |

---

## 🌐 **API**

### **Authentication**

All endpoints require a JWT token (except `/auth/*` and `/r/:shortUrl`).

**Token can be provided via:**

- Cookie: `token` (httpOnly)
- Header: `Authorization: Bearer <token>`

### **Base URL**

```
http://localhost:3000
```

### **Endpoints**

<details>
<summary><b>🔐 Authentication</b></summary>

#### **POST** `/auth/register`

Create a new user account.

**Request:**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### **POST** `/auth/login`

Authenticate and get a token.

**Request:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJ..."
  }
}
```

---

#### **POST** `/auth/guest`

Create a guest session (1-hour token).

**Response:**

```json
{
  "success": true,
  "data": {
    "guestSession": { "id": 1 },
    "token": "eyJ..."
  }
}
```

---

#### **GET** `/auth/validate`

Check if current token is valid.

**Response:**

```json
{
  "success": true,
  "data": {
    "user": { ... }  // or "guestSession": { ... }
  }
}
```

---

#### **POST** `/auth/logout`

Clear authentication tokens.

**Response:**

```json
{
  "success": true
}
```

</details>

<details>
<summary><b>🔗 Link Management</b></summary>

#### **POST** `/link`

Create a short link.

**Request:**

```json
{
  "longUrl": "https://example.com/very/long/url",
  "status": true
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "shortUrl": "a1b2c3d4",
    "longUrl": "https://example.com/very/long/url",
    "status": true,
    "accessCount": 0,
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

---

#### **GET** `/link`

Get all your links.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "shortUrl": "a1b2c3d4",
      "longUrl": "https://example.com",
      "status": true,
      "accessCount": 42,
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

#### **GET** `/link/:shortUrl`

Get a single link by shortUrl.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "shortUrl": "a1b2c3d4",
    "longUrl": "https://example.com",
    "status": true,
    "accessCount": 42,
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

---

#### **PUT** `/link/:shortUrl`

Update a link.

**Request:**

```json
{
  "longUrl": "https://new-url.com",
  "status": false
}
```

---

#### **DELETE** `/link/:shortUrl`

Delete a link (cascades to rules and access records).

</details>

<details>
<summary><b>📏 Link Rules</b></summary>

#### **POST** `/link/:shortUrl/rules`

Create a rule for a link.

**Request:**

```json
{
  "priority": 1,
  "enabled": true,
  "match": "AND",
  "conditions": [
    {
      "field": "country",
      "operator": "in",
      "value": ["US", "CA"]
    }
  ],
  "actionType": "redirect",
  "actionSettings": {
    "url": "https://example.com/us-ca"
  }
}
```

---

#### **GET** `/link/:shortUrl/rules`

Get all rules for a link.

---

#### **GET** `/link/:shortUrl/rules/:ruleId`

Get a single rule.

---

#### **PUT** `/link/:shortUrl/rules/:ruleId`

Update a rule.

---

#### **DELETE** `/link/:shortUrl/rules/:ruleId`

Delete a rule.

---

#### **POST** `/link/:shortUrl/rules/batch`

Create multiple rules at once (max 20).

</details>

<details>
<summary><b>📊 Analytics</b></summary>

#### **GET** `/accesses/link/:shortUrl`

Get all access records for a link.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userAgent": "Mozilla/5.0...",
      "ip": "203.0.113.45",
      "country": "US",
      "isVPN": false,
      "isBot": false,
      "createdAt": "2025-01-15T14:30:00Z"
    }
  ]
}
```

</details>

<details>
<summary><b>👤 User Management</b></summary>

#### **PUT** `/user`

Update user profile.

**Request:**

```json
{
  "username": "new_username",
  "email": "newemail@example.com",
  "password": "NewPassword123!"
}
```

---

#### **POST** `/user/api-key`

Generate API key for programmatic access.

**Response:**

```json
{
  "success": true,
  "data": {
    "apiKey": "a1b2c3d4e5f6..."
  }
}
```

---

#### **DELETE** `/user/api-key`

Revoke current API key.

---

#### **DELETE** `/user/data`

Delete all user links (keeps account).

---

#### **DELETE** `/user`

Delete account and all associated data.

</details>

<details>
<summary><b>🌐 Public Redirect</b></summary>

#### **GET** `/r/:shortUrl`

Public endpoint that evaluates rules and redirects.

**Query params:**

- `password` (optional) - For password-protected links

**Behavior:**

1. Evaluates all rules in priority order
2. Tracks the access (IP, country, device, VPN, bot)
3. Executes the matching action
4. Returns 302 redirect, 403 blocked, or 200 password gate

</details>

### **Error Responses**

```json
{
  "success": false,
  "code": "LINK_NOT_FOUND",
  "message": "The requested link does not exist."
}
```

**Common Error Codes:**

- `UNAUTHORIZED` - Invalid or missing token
- `LINK_NOT_FOUND` - Link doesn't exist
- `LINK_LIMIT_EXCEEDED` - User hit their plan's link limit
- `RULE_LIMIT_EXCEEDED` - Too many rules for this link
- `INVALID_DATA` - Validation error (check `validation` field)
- `RATE_LIMIT_EXCEEDED` - Too many requests

---

## 🗂️ **Database Schema**

```prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String   @unique
  password  String
  avatarUrl String?
  apiKey    String?  @unique
  createdAt DateTime @default(now())
  links     Link[]
}

model GuestSession {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  links     Link[]
}

model Link {
  id             Int           @id @default(autoincrement())
  userId         Int?
  guestSessionId Int?
  shortUrl       String        @unique
  longUrl        String
  status         Boolean       @default(true)
  accessCount    Int           @default(0)
  createdAt      DateTime      @default(now())
  user           User?         @relation(fields: [userId], references: [id])
  guestSession   GuestSession? @relation(fields: [guestSessionId], references: [id])
  accesses       Access[]
  rules          LinkRule[]
}

model Access {
  id        Int      @id @default(autoincrement())
  linkId    Int
  createdAt DateTime @default(now())
  userAgent String
  ip        String
  country   String
  isVPN     Boolean
  isBot     Boolean
  link      Link     @relation(fields: [linkId], references: [id], onDelete: Cascade)
}

model LinkRule {
  id                 Int             @id @default(autoincrement())
  linkId             Int
  link               Link            @relation(fields: [linkId], references: [id], onDelete: Cascade)
  priority           Int             @default(0)
  enabled            Boolean         @default(true)
  match              MatchType       @default(AND)
  conditions         RuleCondition[]
  actionType         ActionType
  actionSettings     Json?
  elseActionType     ActionType?
  elseActionSettings Json?
  createdAt          DateTime        @default(now())
  updatedAt          DateTime        @updatedAt
}

model RuleCondition {
  id       Int          @id @default(autoincrement())
  ruleId   Int
  rule     LinkRule     @relation(fields: [ruleId], references: [id], onDelete: Cascade)
  field    FieldType
  operator OperatorType
  value    Json
}
```

---

## 🎨 **UI Components**

Linkkk v2 includes a custom-built component library with a **neo-brutalist design** aesthetic.

### **Available Components:**

| Component        | Features                                                                 |
| ---------------- | ------------------------------------------------------------------------ |
| **Button**       | 4 variants (solid, outline, ghost, link), 5 sizes, loading states, icons |
| **Input**        | Text, textarea, password, with icons, error messages, 4 sizes            |
| **Select**       | Dropdown with custom styling                                             |
| **InlineSelect** | Button-style option selector                                             |
| **Modal**        | 6 sizes, 3 positions, backdrop click, ESC key, portal rendering          |
| **Drawer**       | 8 placements (sides + corners), modal mode, multiple sizes               |
| **Toast**        | 4 types (success, error, warning, info), auto-dismiss, progress bar      |
| **AnimatedText** | 7 animation types (fade, slide, scale, blur, flip)                       |
| **Switch**       | Toggle switch with smooth animations                                     |
| **Chip**         | Tags/badges with variants and icons                                      |
| **Dropdown**     | Dropdown menu component                                                  |

### **Design Tokens:**

```css
--color-primary: #88FA1E   /* Lime green */
--color-dark: #1B1B1B      /* Almost black */
--color-light: #F2F3F4     /* Off-white */
--color-info: #279AF1      /* Blue */
--color-danger: #EF233C    /* Red */
--color-warning: #F1A208   /* Orange */
--color-success: #88FA1E   /* Lime (same as primary) */
```

**Shadow style:**

```css
box-shadow: 8px 8px 0 var(--color-dark);
```

---

## 🧪 **Testing**

```bash
cd backend
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

**Test stack:**

- Jest
- Supertest (API testing)
- Prisma test environment

---

## 📦 **Deployment**

### **Frontend (Vercel)**

```bash
cd frontend
npm run build
npm start
```

Set environment variables:

- `NEXT_PUBLIC_API_URL` → Your backend URL

### **Backend (Railway / Render / VPS)**

```bash
cd backend
npm install --production
npx prisma migrate deploy
npx prisma generate
npm start  # or: node v2.js
```

Set environment variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`
- `NODE_ENV=production`
- `PORT` (optional, defaults to 3000)

---

## 🛠️ **Development Scripts**

**Backend:**

```bash
npm run dev           # Watch mode (v2.js)
npm start             # Production (v1.js, legacy)
npm test              # Run tests
npx prisma studio     # Database GUI
npx prisma migrate dev # Create migration
```

**Frontend:**

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
```

---

## 🤝 **Contributing**

This project was created as a **Final Degree Project (TFG)** for a Higher Degree in Web Application Development.

If you'd like to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 **License**

This project is licensed under the **ISC License**.

---

## 🙏 **Acknowledgments**

- **Next.js Team** - For the amazing React framework
- **Prisma Team** - For the best ORM experience
- **Vercel** - For hosting and deployment tools
- **Open Source Community** - For all the incredible libraries used

---

## 📧 **Contact**

**Álvaro** - [@aka-alvaroso](https://github.com/aka-alvaroso)

**Project Link:** [https://github.com/aka-alvaroso/Linkkk](https://github.com/aka-alvaroso/Linkkk)

**Live Demo:** [https://linkkk.dev](https://linkkk.dev)

---

<div align="center">

**Made with ❤️ and lots of ☕**

_Linkkk v2 - Smart links for smart people._

</div>
