# 📋 Códigos de Error Simplificados - API v2

## 🎯 Estructura Simple

Todos los errores siguen este formato:

```json
{
  "success": false,
  "code": "UNAUTHORIZED",
  "message": "Unauthorized"
}
```

Para errores de validación:
```json
{
  "success": false,
  "code": "INVALID_DATA",
  "message": "Invalid data",
  "validation": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## 📋 Lista de Códigos

| Código | Status | Uso |
|--------|--------|-----|
| `UNAUTHORIZED` | 401 | Sin autenticación |
| `INVALID_CREDENTIALS` | 401 | Login incorrecto |
| `USER_NOT_FOUND` | 404 | Usuario no existe |
| `USER_EXISTS` | 400 | Usuario ya existe |
| `INVALID_DATA` | 400 | Datos incorrectos |
| `GUEST_SESSION_EXISTS` | 400 | Sesión guest ya existe |
| `GUEST_SESSION_NOT_FOUND` | 404 | Sesión guest no encontrada |
| `LINK_NOT_FOUND` | 404 | Link no encontrado |
| `LINK_ACCESS_DENIED` | 403 | Sin permisos para el link |
| `SHORT_URL_EXISTS` | 400 | URL corta ya existe |
| `RATE_LIMIT_EXCEEDED` | 429 | Demasiadas peticiones |
| `INTERNAL_ERROR` | 500 | Error interno |
| `DATABASE_ERROR` | 500 | Error de base de datos |

---

## 🛠️ Uso en el Código

```javascript
const { errorResponse } = require("../utils/response");
const ERRORS = require("../constants/errorCodes");

// Error simple
return errorResponse(res, ERRORS.UNAUTHORIZED);

// Error con validación
return errorResponse(res, ERRORS.INVALID_DATA, validationIssues);
```

---

## ✅ Beneficios

- **Simple** - Solo 13 códigos esenciales
- **Claro** - Nombres descriptivos
- **Consistente** - Mismo formato siempre
- **Fácil** - Uso directo sin complejidad
