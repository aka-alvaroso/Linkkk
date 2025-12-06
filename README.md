<div align="center">

![Linkkk Logo](frontend/public/favicon.svg)

# **Linkkk**

### _Enlaces inteligentes que se adaptan a tu audiencia_

[![Live Demo](https://img.shields.io/badge/🚀_Demo-linkkk.dev-88FA1E?style=for-the-badge)](https://linkkk.dev)

**[Prueba Gratis](https://linkkk.dev)** • **[Ver Demo](https://linkkk.dev)** • **[Contacto](#-contacto)**

---

</div>

## 🎯 **¿Qué es Linkkk?**

**Linkkk no es solo un acortador de URLs.** Es un **motor de redirección inteligente** que te permite crear enlaces que piensan por sí mismos y se adaptan automáticamente a cada visitante.

### **Imagina poder hacer esto:**

- 🌍 **Dirigir a españoles a `/es` y a británicos a `/en`** → Sin configurar nada manualmente
- 📱 **Enviar usuarios móviles a la app y usuarios de escritorio a la web** → Automáticamente
- 🤖 **Bloquear bots o redirigirlos a una página especial** → Con un clic
- 🔐 **Proteger enlaces sensibles con contraseña** → Con pistas opcionales
- 🚫 **Detectar y bloquear tráfico VPN** → Para contenido exclusivo
- 📊 **Evitar accesos tras N clics** → Lanzamientos limitados
- 🕒 **Activar enlaces solo en fechas/horas específicas** → Campañas programadas
- 🚀 **Y más que se irán añadiendo con el tiempo**

**Todo esto sin escribir una sola línea de código.**

---

## ✨ **Características Principales**

<table>
<tr>
<td width="50%">

### 🔗 **Gestión Inteligente de Enlaces**

- Crea URLs cortas y memorables al instante
- Activa/desactiva enlaces con un toggle
- Rastrea cada clic con analíticas detalladas
- Filtra y busca entre tus enlaces
- Reorganiza reglas con drag & drop
- Edición inline súper rápida

</td>
<td width="50%">

### 🧠 **Reglas Condicionales Avanzadas**

- **7 tipos de condiciones**: País, dispositivo, IP, VPN, bot, fecha, contador
- **4 tipos de acciones**: Redirección, bloqueo, contraseña, webhooks
- **Lógica AND/OR** para escenarios complejos
- **Acciones ELSE** para comportamiento alternativo
- **Sistema de prioridades** configurable

</td>
</tr>
<tr>
<td width="50%">

### 📊 **Analíticas en Tiempo Real**

- Seguimiento de clics en vivo
- Distribución geográfica (detección de país)
- Desglose por dispositivo (móvil/tablet/escritorio)
- Detección de VPN y bots
- Historial completo con registro de IPs
- Exporta tus datos cuando quieras

</td>
<td width="50%">

### 🎨 **Interfaz Moderna y Fluida**

- Diseño neo-brutalista único
- Animaciones suaves (Framer Motion)
- 100% responsive (mobile-first)
- Navegación inferior en móvil
- Modo oscuro elegante
- Experiencia de usuario premium

</td>
</tr>
<tr>
<td width="50%">

### 🔐 **Acceso Flexible**

- **Modo invitado**: Prueba sin registrarte (sesiones de 1 hora)
- **Cuentas de usuario**: Analíticas completas y límites más altos
- **Migración automática** de enlaces de invitado a usuario
- **API keys** para integración programática

</td>
<td width="50%">

### 🛡️ **Seguridad desde el inicio**

- Protección CSRF y XSS
- Prevención de inyección SQL
- Rate limiting por endpoint
- Encriptación de contraseñas (bcrypt)
- Validación de URLs (anti-SSRF)
- Cookies httpOnly seguras

</td>
</tr>
</table>

---

## 🚀 **Casos de Uso Reales**

### **1. Marketing Multiregional**

```
SI país EN [ES, MX, AR] Y dispositivo = móvil
  → Redirigir a https://tuapp.com/mobile-es
SINO
  → Redirigir a https://tuapp.com/en
```

**Perfecto para:** Campañas internacionales, landing pages localizadas, apps con versiones regionales.

---

### **2. Lanzamientos Exclusivos**

```
SI contador_accesos < 100
  → Requiere contraseña "early2025"
SINO
  → Bloquear acceso (cupo agotado)
```

**Perfecto para:** Acceso anticipado, beta testing, eventos con aforo limitado.

---

### **3. Protección Anti-Bot**

```
SI es_bot = true O es_vpn = true
  → Bloquear acceso
SINO
  → Redirigir a contenido original
```

**Perfecto para:** Proteger contenido premium, evitar scraping, filtrar tráfico sospechoso.

---

### **4. Campañas Temporales**

```
SI fecha ENTRE "2025-12-01" Y "2025-12-25"
  → Redirigir a https://tutienda.com/navidad
SINO
  → Redirigir a https://tutienda.com
```

**Perfecto para:** Promociones estacionales, eventos limitados, ofertas flash.

---

### **5. Optimización Móvil**

```
SI dispositivo = móvil
  → Redirigir a app store (iOS/Android)
SINO
  → Redirigir a sitio web
```

**Perfecto para:** Aumentar descargas de apps, mejorar conversión móvil, deep linking.

---

## 🎨 **Diseño que Enamora**

Linkkk no solo funciona bien, **se ve increíble**. Nuestro diseño neo-brutalista combina:

- **Colores vibrantes** → Verde lima (#88FA1E) como color principal
- **Sombras audaces** → `8px 8px 0 #1B1B1B` para ese look único
- **Animaciones fluidas** → Transiciones suaves con Framer Motion
- **Tipografía moderna** → Fuentes optimizadas para legibilidad
- **Componentes personalizados** → Botones, modales, drawers, toasts y más

### **Componentes Disponibles:**

| Componente | Características |
|------------|-----------------|
| **Button** | 4 variantes, 5 tamaños, estados de carga, iconos |
| **Input** | Texto, textarea, password, con iconos, mensajes de error |
| **Modal** | 6 tamaños, 3 posiciones, cierre con ESC |
| **Drawer** | 8 posiciones (lados + esquinas), múltiples tamaños |
| **Toast** | 4 tipos (success, error, warning, info), auto-dismiss |
| **Switch** | Toggle animado y suave |
| **Chip** | Tags/badges con variantes e iconos |

---

## 📊 **Planes y Límites**

| Característica | Invitado | Usuario Registrado |
|----------------|----------|-------------------|
| **Enlaces máximos** | 10 | 50 |
| **Duración de enlaces** | 7 días | Ilimitado |
| **Reglas por enlace** | 1 | 5 |
| **Condiciones por regla** | 1 | 3 |
| **Analíticas detalladas** | ❌ | ✅ |
| **API Key** | ❌ | ✅ |
| **Exportar datos** | ❌ | ✅ |

> **¿Necesitas más?** Contáctanos para planes empresariales o ampliados personalizados.

---

## 🧪 **Motor de Reglas: El Cerebro de Linkkk**

### **Tipos de Condiciones**

| Campo | Operadores | Valores de Ejemplo |
|-------|-----------|-------------------|
| `country` | `in`, `not_in` | `["ES", "US", "MX"]` |
| `device` | `equals`, `not_equals` | `"mobile"`, `"tablet"`, `"desktop"` |
| `ip` | `equals`, `not_equals` | `"192.168.1.1"` |
| `is_vpn` | `equals` | `true`, `false` |
| `is_bot` | `equals` | `true`, `false` |
| `date` | `before`, `after`, `equals` | `"2025-12-31T23:59:59Z"` |
| `access_count` | `equals`, `greater_than`, `less_than` | `100` |

### **Tipos de Acciones**

1. **`redirect`** → Envía usuarios a una URL diferente
   - Soporta variables: `{{longUrl}}`, `{{shortUrl}}`
   - Protección anti-SSRF integrada

2. **`block_access`** → Muestra un mensaje personalizado y bloquea el acceso
   - Ideal para restricciones geográficas o de contenido

3. **`password_gate`** → Requiere contraseña para continuar
   - Con pistas opcionales para ayudar a los usuarios

4. **`notify`** → Dispara un webhook al acceder al enlace
   - Perfecto para integraciones con Slack, Discord, Zapier, etc.

### **Flujo de Evaluación**

1. Las reglas se ordenan por **prioridad** (menor = primero)
2. Las condiciones se evalúan según **tipo de match** (AND/OR)
3. Si las condiciones coinciden → se ejecuta la **acción principal**
4. Si no coinciden → se ejecuta la **acción ELSE** (si está definida)
5. La primera regla que coincide gana (la evaluación se detiene)

---

## 🌟 **¿Por Qué Elegir Linkkk?**

### **vs. Acortadores Tradicionales (bit.ly, TinyURL)**

| Característica | Linkkk | Otros |
|----------------|--------|-------|
| Redirección condicional | ✅ | ❌ |
| Detección de país/dispositivo | ✅ | ❌ |
| Protección con contraseña | ✅ | ❌ |
| Detección de VPN/bots | ✅ | ❌ |
| Enlaces autodestructivos | ✅ | ❌ |
| Webhooks integrados | ✅ | ❌ |
| Diseño moderno | ✅ | ⚠️ |
| Modo invitado sin registro | ✅ | ❌ |

---

## 🔗 **Empieza Ahora**

### **1. Modo Invitado (Sin Registro)**

1. Ve a [linkkk.dev](https://linkkk.dev)
2. Haz clic en "Continuar como invitado"
3. Crea tu primer enlace inteligente
4. ¡Listo! Tienes 10 enlaces durante 7 días

### **2. Cuenta Completa (Gratis)**

1. Regístrate en [linkkk.dev](https://linkkk.dev)
2. Verifica tu email
3. Disfruta de 50 enlaces ilimitados
4. Accede a analíticas completas y API

### **3. Integración API**

```bash
# Genera tu API key desde el panel
curl -X POST https://api.linkkk.dev/link \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "longUrl": "https://example.com",
    "status": true
  }'
```

---

## 🛠️ **Stack Tecnológico**

Construido con las mejores tecnologías modernas:

| Capa | Tecnología |
|------|-----------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS 4 |
| **Backend** | Node.js, Express.js, Prisma ORM |
| **Base de Datos** | PostgreSQL |
| **Seguridad** | JWT, bcrypt, Helmet, Rate Limiting |
| **Animaciones** | Framer Motion |
| **Validación** | Zod |
| **Drag & Drop** | @dnd-kit |

---

## 📧 **Contacto**

¿Tienes preguntas? ¿Necesitas un plan empresarial? ¿Quieres colaborar?

**Álvaro** - [@aka-alvaroso](https://github.com/aka-alvaroso)

**Proyecto:** [github.com/aka-alvaroso/Linkkk](https://github.com/aka-alvaroso/Linkkk)

**Demo en Vivo:** [linkkk.dev](https://linkkk.dev)

---

## 📄 **Licencia**

Este proyecto está licenciado bajo la **Licencia ISC**.

---

<div align="center">

**Hecho con ❤️ y mucho ☕**

_Linkkk - Enlaces inteligentes para gente inteligente._

[![GitHub stars](https://img.shields.io/github/stars/aka-alvaroso/Linkkk?style=social)](https://github.com/aka-alvaroso/Linkkk)
[![Twitter Follow](https://img.shields.io/twitter/follow/aka_alvaroso?style=social)](https://twitter.com/aka_alvaroso)

</div>
