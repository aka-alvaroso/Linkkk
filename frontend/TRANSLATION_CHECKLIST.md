# 🌍 Translation Checklist

Lista organizada de componentes y páginas a traducir, ordenados por prioridad.

## 📋 Leyenda

- ⏳ Pendiente
- 🔄 En progreso
- ✅ Completado

---

## 🎯 PRIORIDAD ALTA - Experiencia del usuario principal

### Navegación y Layout (Siempre visible)

- [x] ✅ `app/components/Navigation/Navigation.tsx` - Barra de navegación principal
- [x] ✅ `app/components/Navigation/TopNavbar.tsx` - Navbar superior
- [x] ✅ `app/components/Navigation/BottomNavbar.tsx` - Navbar inferior (mobile)

### Páginas Públicas (Landing, Auth)

- [x] ✅ `app/page.tsx` - Landing page (MUCHO TEXTO)
- [x] ✅ `app/auth/login/page.tsx` - Página de login
- [x] ✅ `app/auth/register/page.tsx` - Página de registro
- [x] ✅ `app/password/page.tsx` - Verificación de password

### Dashboard (Funcionalidad Principal)

- [x] ✅ `app/dashboard/page.tsx` - Dashboard principal
- [x] ✅ `app/components/LinkList/LinkItem.tsx` - Item de link en lista
- [x] ✅ `app/components/LinkList/LinkDetails.tsx` - Detalles del link

---

## 🔧 PRIORIDAD MEDIA - Funcionalidades core

### Gestión de Links

- [x] ✅ `app/components/Drawer/CreateLinkDrawer.tsx` - Drawer para crear link
- [x] ✅ `app/components/Drawer/EditiLinkDrawer.tsx` - Drawer para editar link
- [x] ✅ `app/components/Modal/FilterModal.tsx` - Modal de filtros

### Reglas de Links (Rules Engine)

- [x] ✅ `app/components/LinkRules/RulesManager.tsx` - Gestor de reglas
- [x] ✅ `app/components/LinkRules/LinkRule.tsx` - Regla individual
- [x] ✅ `app/components/LinkRules/RuleCondition.tsx` - Condición de regla
- [x] ✅ `app/components/LinkRules/RuleAction.tsx` - Acción de regla

### Estadísticas y Accesos

- [x] ✅ `app/components/Accesses/accessesList.tsx` - Lista de accesos
- [x] ✅ `app/settings/page.tsx` - Página de ajustes

---

## 📦 PRIORIDAD BAJA - Modals y estados especiales

### Modals y Overlays

- [x] ✅ `app/components/Modal/WaitlistModal.tsx` - Modal de waitlist

### Páginas de Estado/Error

- [x] ✅ `app/not-found.tsx` - Página 404
- [x] ✅ `app/error/page.tsx` - Página de error
- [x] ✅ `app/blocked/page.tsx` - Página bloqueada
- [x] ✅ `app/disabled/page.tsx` - Página deshabilitada


---

## 🎨 Componentes UI Base (100% Traducidos)

Estos componentes ya no tienen texto hardcodeado:

- [x] ✅ `app/components/ui/Button/Button.tsx` - Traducido (Loading...)
- [x] ✅ `app/components/ui/Input/Input.tsx` - Revisado (Sin texto hardcodeado)
- [x] ✅ `app/components/ui/Modal/Modal.tsx` - Revisado (Sin texto hardcodeado)
- [x] ✅ `app/components/ui/Drawer/Drawer.tsx` - Traducido (Aria-labels)
- [x] ✅ `app/components/ui/Alert/Alert.tsx` - Traducido (Aria-labels)
- [x] ✅ `app/components/ui/Toast/Toast.tsx` - Traducido (Aria-labels)
- [x] ✅ `app/components/ui/Select/Select.tsx` - Revisado
- [x] ✅ `app/components/ui/Switch/Switch.tsx` - Revisado
- [x] ✅ `app/components/ui/Chip/Chip.tsx` - Revisado
- [x] ✅ `app/components/ui/Dropdown/Dropdown.tsx` - Revisado
- [x] ✅ `app/components/ui/InlineSelect/InlineSelect.tsx` - Revisado
- [x] ✅ `app/components/ui/Loader/Loader.tsx` - Revisado
- [x] ✅ `app/components/ui/AnimatedText/AnimatedText.tsx` - Revisado
- [x] ✅ `app/components/ui/LanguageSwitcher/LanguageSwitcher.tsx` - ✅ Ya tenía idiomas
- [x] ✅ `app/components/ui/Toast/ToastContainer.tsx` - Revisado

---

## 📝 Notas

### Archivos que NO necesitan traducción:

- `app/components/RouteGuard/RouteGuard.tsx` - Lógica de rutas
- `app/components/SessionProvider.tsx` - Provider de sesión

### Recomendación de orden:

1. **Día 1:** Navegación + Landing page
2. **Día 2:** Auth (login/register) + Dashboard
3. **Día 3:** Drawers de crear/editar links
4. **Día 4:** Rules Manager
5. **Día 5:** Páginas de error + Modal waitlist

### Estimación:

- **Alto prioridad:** ~8 archivos, ~2-3 horas
- **Media prioridad:** ~8 archivos, ~2 horas
- **Baja prioridad:** ~5 archivos, ~1 hora
- **Total:** ~5-6 horas de traducción
