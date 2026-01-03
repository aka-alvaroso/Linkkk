<div align="center">

<img src="frontend/public/favicon.svg" alt="Linkkk Logo" width="100" />

# **Linkkk**

### _Plataforma de gestión de enlaces con control total sobre su comportamiento._

[![Live Demo](https://img.shields.io/badge/🚀_Probar_Ahora-linkkk.dev-88FA1E?style=for-the-badge&labelColor=1a1a1a)](https://linkkk.dev)
[![Status](https://img.shields.io/badge/Status-Beta_V2-blue?style=for-the-badge&labelColor=1a1a1a)](https://github.com/aka-alvaroso/Linkkk)
[![License](https://img.shields.io/badge/License-Source_Available-orange?style=for-the-badge&labelColor=1a1a1a)](https://github.com/aka-alvaroso/Linkkk)

<p align="center">
  Linkkk te permite controlar exactamente cómo y cuándo funciona cada enlace.<br>
  A través de un motor de reglas, personaliza el comportamiento de tus enlaces según cualquier condición.
</p>

**[Documentación](#-instalación-y-desarrollo)** • **[Características](#-capacidades-del-motor)** • **[Stack](#️-stack-tecnológico)** • **[Roadmap](#-roadmap)**

</div>

---

## ⚡ **¿Qué hace Linkkk diferente?**

Los acortadores tradicionales solo redirigen: entrada A ➡ salida B.
**Linkkk es una plataforma de gestión completa.** Controla el comportamiento de cada enlace con reglas personalizadas, restricciones de acceso, protección por contraseña y analíticas detalladas. Todo sin escribir una línea de código.

<div align="center">

|    🎯 **Control Total**     |      🚀 **Rápido**      |   🔒 **Seguro**   |    📊 **Analítico**     |
| :-------------------------: | :---------------------: | :---------------: | :---------------------: |
| Motor de reglas flexible |   Redirecciones <50ms   | Auth JWT + bcrypt | Métricas en tiempo real |
|     Gestión centralizada     | Edge-ready architecture | Detección bot/VPN |  Datos por dispositivo  |
|     Sin código requerido     |   Optimizado para CDN   |  GDPR compliant   |  Historial completo   |

</div>

### **Capacidades Principales:**

- 🎯 **Motor de Reglas:** Define el comportamiento exacto de cada enlace con condiciones combinables (país, dispositivo, IP, fecha, VPN, bots).
- 🔐 **Control de Acceso:** Protege enlaces con contraseñas, restringe por geolocalización, bloquea IPs específicas o detecta VPNs automáticamente.
- 📱 **Redirección Inteligente:** Un mismo enlace puede llevar a diferentes destinos según quién, cuándo y desde dónde lo visite.
- 🛠️ **Personalización Total:** Metadata personalizada para redes sociales, sufijos custom, fechas de expiración y organización por etiquetas.
- 📊 **Analíticas Profundas:** Más allá de contar clics - entiende ubicación, dispositivo, navegador, y detecta tráfico sospechoso.

### **Ejemplos de Casos de Uso:**

```
linkkk.dev/download
├─ 🍎 iOS → App Store
├─ 🤖 Android → Google Play
└─ 💻 Desktop → Sitio web

linkkk.dev/promo
├─ 🇪🇸 España → Versión en español
├─ 🇺🇸 USA → Versión en inglés
└─ 🤖 Bot → ❌ Bloqueado

linkkk.dev/team
├─ 🔐 Sin contraseña → Acceso denegado
├─ 🌐 VPN detectada → Bloqueado
└─ ✅ Acceso válido → Contenido interno

linkkk.dev/campaign
├─ 📅 Antes del 01/01/2025 → Página de preventa
├─ 📅 Después del 01/01/2025 → Página de compra
└─ 🌍 Fuera de EU → Página de lista de espera
```

---

## 🛠️ **Stack Tecnológico**

Construido con una arquitectura moderna enfocada en rendimiento y escalabilidad.

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)

</div>

| Área              | Tecnología                  | Por qué lo elegí                               |
| :---------------- | :-------------------------- | :--------------------------------------------- |
| **Frontend**      | **Next.js 15 (App Router)** | Server Components y SEO optimizado.            |
| **Backend**       | **Node.js + Express**       | Flexibilidad y control total de los endpoints. |
| **Base de Datos** | **PostgreSQL**              | Integridad relacional y robustez.              |
| **ORM**           | **Prisma**                  | Type-safety de extremo a extremo.              |
| **Estilos**       | **Tailwind CSS 4**          | Diseño rápido y consistente (Neo-Brutalism).   |
| **Validación**    | **Zod**                     | Validación de esquemas en tiempo de ejecución. |
| **Autenticación** | **JWT + bcryptjs**          | Seguridad sin dependencias externas.           |
| **Cron Jobs**     | **node-cron**               | Limpieza automática de datos expirados.        |

---

## 🧩 **Arquitectura del Proyecto**

El repositorio funciona como un **Monorepo** dividido en dos aplicaciones principales:

```
linkkk/
├── frontend/          # Next.js 15 App Router
│   ├── app/           # Rutas y páginas
│   ├── components/    # Componentes reutilizables
│   ├── lib/           # Utilidades y helpers
│   └── messages/      # Traducciones i18n (EN/ES)
│
├── backend/           # Node.js + Express API
│   ├── v2/            # API V2 actual
│   │   ├── controllers/   # Lógica de controladores
│   │   ├── middlewares/   # Auth, validación, CORS
│   │   ├── routes/        # Definición de rutas
│   │   ├── jobs/          # Cron jobs (cleanup)
│   │   ├── prisma/        # Schema y client
│   │   └── utils/         # Helpers y constantes
│   └── v2.js          # Entry point
```

### **Flujo de gestión de un enlace:**

1. Usuario visita `linkkk.dev/r/abc123`
2. Backend captura contexto completo (IP, User-Agent, geolocalización, detección de VPN/bots)
3. Motor de reglas evalúa condiciones configuradas en orden de prioridad
4. Ejecuta la acción apropiada (redirigir, bloquear, solicitar contraseña, webhook)
5. Registra analíticas detalladas en PostgreSQL
6. El usuario puede ver métricas en tiempo real desde el dashboard

---

## 💻 **Instalación y Desarrollo**

Este código es público para fines educativos y de portafolio. Si eres desarrollador, puedes inspeccionarlo o ejecutarlo localmente.

<details>
<summary><strong>👇 Desplegar instrucciones de instalación local</strong></summary>

### Prerrequisitos

- Node.js 18+
- PostgreSQL (Local o Docker)
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/aka-alvaroso/Linkkk.git
cd Linkkk
```

### 2. Configurar Backend

```bash
cd backend
npm install
```

Crea un archivo `.env` en `/backend` con las siguientes variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/linkkk"

# JWT Secrets (genera claves aleatorias seguras)
V2_AUTH_SECRET_KEY="tu-clave-secreta-auth"
V2_GUEST_SECRET_KEY="tu-clave-secreta-guest"

# Environment
NODE_ENV="development"
PORT=3000

# Frontend URL (para CORS)
FRONTEND_URL="http://localhost:3001"

# Email (opcional, para lista de espera)
RESEND_API_KEY="tu-api-key-de-resend"
```

Ejecuta las migraciones de base de datos:

```bash
npx prisma generate
npx prisma db push
npm run dev
```

### 3. Configurar Frontend

```bash
cd ../frontend
npm install
```

Crea un archivo `.env.local` en `/frontend`:

```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

Ejecuta el frontend:

```bash
npm run dev
```

### 4. Acceso

- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:3000
- **Prisma Studio:** `npx prisma studio` (desde `/backend`)

</details>

---

## 🔐 **Seguridad y Privacidad**

Linkkk toma la seguridad y privacidad en serio:

- 🔒 **Contraseñas hasheadas** con bcryptjs (12 salt rounds, OWASP compliant)
- 🔑 **JWT con secretos rotativos** para autenticación segura
- 🛡️ **CORS configurado** para evitar ataques cross-origin
- 🍪 **Cookies HttpOnly + SameSite** para prevenir XSS/CSRF
- 🌍 **GDPR compliant** - Datos alojados en Canadá (decisión de adecuación UE)
- 🗑️ **Limpieza automática** de datos expirados (guest sessions: 7 días)
- 📄 **Documentación legal completa** (Privacidad, Cookies, Términos)

**No almacenamos:**

- Contraseñas en texto plano (solo hashes bcrypt)
- IPs completas indefinidamente (anonimización programada)

---

## 🗺️ **Roadmap**

### ✅ **Completado (V2 Beta)**

- [x] Sistema de reglas condicionales avanzadas
- [x] Autenticación JWT con sesiones guest (7 días)
- [x] Analíticas detalladas con geolocalización
- [x] Detección de bots y VPN/Proxy
- [x] Internacionalización (ES/EN)
- [x] Páginas legales (Privacidad, Cookies, Términos)
- [x] Sistema de limpieza automática de sesiones expiradas

### 🚧 **En Desarrollo**

- [x] Sistema de planes premium (Stripe) ✓
- [ ] API pública para developers
- [ ] Gráficos visuales para analíticas
- [ ] Exportación de datos (CSV/JSON)
- [ ] A/B Testing integrado

### 💡 **Futuro**

- [ ] Webhooks personalizados por regla
- [ ] Integraciones con Slack, Discord, Telegram
- [ ] QR Codes dinámicos con analytics
- [ ] Dominios personalizados
- [ ] Bio pages (similar a Linktree)
- [ ] Más condiciones y acciones en el motor de reglas

---

## 🤝 **Contribuir**

Este proyecto está abierto a contribuciones. Si encuentras un bug o tienes una idea:

1. Abre un [Issue](https://github.com/aka-alvaroso/Linkkk/issues)
2. Haz un Fork del repositorio
3. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
4. Commitea tus cambios: `git commit -m 'feat: añadir nueva funcionalidad'`
5. Push a la rama: `git push origin feature/nueva-funcionalidad`
6. Abre un Pull Request

---

## 📄 **Licencia**

Este proyecto está licenciado bajo la **GNU Affero General Public License v3.0 (AGPL-3.0)**.

Esto asegura que el código se mantenga libre y abierto. Si utilizas este código para ofrecer un servicio a través de una red (SaaS), también debes liberar el código fuente de tu versión modificada.

Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">

**Hecho con 💚 por [Álvaro](https://github.com/aka-alvaroso)**

[linkkk.dev](https://linkkk.dev) • [Reportar Bug](https://github.com/aka-alvaroso/Linkkk/issues) • [Solicitar Feature](https://github.com/aka-alvaroso/Linkkk/issues)

</div>
