<div align="center">

<img src="frontend/public/favicon.svg" alt="Linkkk Logo" width="100" />

# **Linkkk**

### _Link management platform with full control over their behavior._

[![Live Demo](https://img.shields.io/badge/🚀_Try_Now-linkkk.dev-88FA1E?style=for-the-badge&labelColor=1a1a1a)](https://linkkk.dev)
[![Status](https://img.shields.io/badge/Status-Beta_V2-blue?style=for-the-badge&labelColor=1a1a1a)](https://github.com/aka-alvaroso/Linkkk)
[![License](https://img.shields.io/badge/License-Source_Available-orange?style=for-the-badge&labelColor=1a1a1a)](https://github.com/aka-alvaroso/Linkkk)

<p align="center">
  Linkkk allows you to precisely control how and when each link works.<br>
  Through a powerful rule engine, customize your links' behavior based on any condition.
</p>

**[Documentation](#-installation-and-development)** • **[Features](#-engine-capabilities)** • **[Stack](#️-tech-stack)** • **[Roadmap](#-roadmap)**

</div>

---

## ⚡ **What makes Linkkk different?**

Traditional shorteners just redirect: input A ➡ output B.
**Linkkk is a comprehensive link management platform.** Control the behavior of each link with custom rules, access restrictions, password protection, and detailed analytics. All without writing a single line of code.

<div align="center">

|  🎯 **Total Control**  |       🚀 **Fast**       |       🔒 **Secure**        | 📊 **Analytical** |
| :--------------------: | :---------------------: | :------------------------: | :---------------: |
|  Flexible Rule Engine  |     Redirects <50ms     | Auth JWT + bcrypt + Google | Real-time metrics |
| Centralized Management | Edge-ready architecture |     Bot/VPN detection      |  Data per device  |
|    No Code Required    |    Optimized for CDN    |       GDPR compliant       | Complete history  |

</div>

### **Core Capabilities:**

- 🎯 **Rule Engine:** Define the exact behavior of each link with combinable conditions (country, device, IP, date, VPN, bots).
- 🔐 **Access Control:** Protect links with passwords, restrict by geolocation, block specific IPs, or automatically detect VPNs. Supports Google OAuth for secure user authentication.
- 📱 **Smart Redirection:** A single link can lead to different destinations depending on who, when, and from where it is visited.
- 🔳 **Dynamic QR Codes:** Generate QR codes for your links with built-in analytics, allowing you to track scans and user engagement.
- 🛠️ **Total Customization:** Custom metadata for social media, custom suffixes, expiration dates, and tag-based organization.
- 📊 **Deep Analytics:** Beyond click counts - understand location, device, browser, and detect suspicious traffic.

### **Use Case Examples:**

```
linkkk.dev/download
├─ 🍎 iOS → App Store
├─ 🤖 Android → Google Play
└─ 💻 Desktop → Website

linkkk.dev/promo
├─ 🇪🇸 Spain → Spanish version
├─ 🇺🇸 USA → English version
└─ 🤖 Bot → ❌ Blocked

linkkk.dev/team
├─ 🔐 No password → Access denied
├─ 🌐 VPN detected → Blocked
└─ ✅ Valid access → Internal content

linkkk.dev/campaign
├─ 📅 Before 01/01/2025 → Pre-sale page
├─ 📅 After 01/01/2025 → Purchase page
└─ 🌍 Outside EU → Waitlist page
```

---

## 🛠️ **Tech Stack**

Built with a modern architecture focused on performance and scalability.

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)

</div>

| Area               | Technology                        | Why I chose it                                       |
| :----------------- | :-------------------------------- | :--------------------------------------------------- |
| **Frontend**       | **Next.js (App Router)**          | Server Components and optimized SEO.                 |
| **Backend**        | **Node.js + Express**             | Flexibility and full control over endpoints.         |
| **Database**       | **PostgreSQL**                    | Relational integrity and robustness.                 |
| **ORM**            | **Prisma**                        | End-to-end type-safety.                              |
| **Styling**        | **Tailwind CSS**                  | Fast and consistent design (Neo-Brutalism).          |
| **Validation**     | **Zod**                           | Runtime schema validation.                           |
| **Authentication** | **JWT + bcryptjs + Google OAuth** | Secure authentication without external dependencies. |
| **Cron Jobs**      | **node-cron**                     | Automatic cleanup of expired data.                   |

---

## 🧩 **Project Architecture**

The repository functions as a **Monorepo** divided into two main applications:

```
linkkk/
├── frontend/          # Next.js App Router
│   ├── app/           # Routes and pages
│   ├── components/    # Reusable components
│   ├── lib/           # Utilities and helpers
│   └── messages/      # i18n translations (EN/ES)
│
├── backend/           # Node.js + Express API
│   ├── v2/            # Current V2 API
│   │   ├── controllers/   # Controller logic
│   │   ├── middlewares/   # Auth, validation, CORS
│   │   ├── routes/        # Route definitions
│   │   ├── jobs/          # Cron jobs (cleanup)
│   │   ├── prisma/        # Schema and client
│   │   └── utils/         # Helpers and constants
│   └── v2.js          # Entry point
```

### **Link Management Flow:**

1. User visits `linkkk.dev/r/abc123`
2. Backend captures full context (IP, User-Agent, geolocation, VPN/bot detection)
3. Rule engine evaluates configured conditions in priority order
4. Executes the appropriate action (redirect, block, request password, webhook)
5. Records detailed analytics in PostgreSQL
6. User can view real-time metrics from the dashboard

---

## 🔐 **Security and Privacy**

Linkkk takes security and privacy seriously:

- 🔒 **Hashed passwords** with bcryptjs (OWASP compliant)
- 🔑 **JWT with rotating secrets**
- 🛡️ **CORS configured** to prevent cross-origin attacks
- 🍪 **HttpOnly + SameSite cookies** to prevent XSS/CSRF
- 🌍 **GDPR compliant**
- 🗑️ **Automatic cleanup** of expired data (guest sessions: 7 days)

**We do not store:**

- Passwords in plain text (only bcrypt hashes)
- Full IPs indefinitely (scheduled anonymization)
- Payment data (Stripe do it for us)

---

## 🗺️ **Roadmap**

### ✅ **Completed (V2 Beta)**

- [x] Advanced conditional rule system
- [x] JWT authentication with guest sessions (7 days)
- [x] Basic analytics with geolocation
- [x] Internationalization (ES/EN)
- [x] Automatic cleanup system for expired sessions
- [x] Premium plan system (Stripe)
- [x] Google OAuth for user authentication
- [x] Dynamic QR Codes with analytics

### 🚧 **In Development**

- [ ] Detailed link analytics with charts
- [ ] Public API for developers
- [ ] Data export (CSV/JSON)
- [ ] Integrated A/B Testing

### 💡 **Future**

- [ ] Custom domains
- [ ] Custom link metadata
- [ ] More conditions and actions in the rule engine
- [ ] Groups and tags for link organisation

---

## 🤝 **Contributing**

This project is open to contributions. If you find a bug or have an idea:

1. Open an [Issue](https://github.com/aka-alvaroso/Linkkk/issues)
2. Fork the repository
3. Create a branch: `git checkout -b feature/new-feature`
4. Commit your changes: `git commit -m 'feat: add new feature'`
5. Push to the branch: `git push origin feature/new-feature`
6. Open a Pull Request

---

## 📄 **License**

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

This ensures that the code remains free and open. If you use this code to offer a service over a network (SaaS), you must also release the source code of your modified version.

See the [LICENSE](LICENSE) file for more details.

---

<div align="center">

**Made with 💚 by [Álvaro](https://github.com/aka-alvaroso)**

[linkkk.dev](https://linkkk.dev) • [Report Bug](https://github.com/aka-alvaroso/Linkkk/issues) • [Request Feature](https://github.com/aka-alvaroso/Linkkk/issues)

</div>
