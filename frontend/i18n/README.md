# Internacionalización (i18n)

Este proyecto usa `next-intl` para gestionar múltiples idiomas sin prefijos en URL.

## Cómo funciona

- **Idiomas disponibles:** Español (es) e Inglés (en)
- **Idioma por defecto:** Español
- **Detección automática:** Cookie `NEXT_LOCALE` > Header `Accept-Language` > Español
- **URLs limpias:** No hay `/es` o `/en` en las rutas

## Estructura de archivos

```
messages/
├── es.json  # Traducciones en español
└── en.json  # Traducciones en inglés
```

## Cómo usar traducciones

### En Client Components

```tsx
'use client';
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('Dashboard');

  return (
    <div>
      <h1>{t('title')}</h1>
      <button>{t('createButton')}</button>
    </div>
  );
}
```

### En Server Components

```tsx
import { getTranslations } from 'next-intl/server';

export default async function MyPage() {
  const t = await getTranslations('Dashboard');

  return <h1>{t('title')}</h1>;
}
```

## Archivos de traducciones

### messages/es.json
```json
{
  "Dashboard": {
    "title": "Panel de Control",
    "createButton": "Crear Link"
  }
}
```

### messages/en.json
```json
{
  "Dashboard": {
    "title": "Dashboard",
    "createButton": "Create Link"
  }
}
```

## Cambiar idioma

### Usando el hook
```tsx
'use client';
import { useLanguage } from '@/app/hooks';

export function MyComponent() {
  const { currentLocale, changeLanguage } = useLanguage();

  return (
    <button onClick={() => changeLanguage('en')}>
      Switch to English
    </button>
  );
}
```

### Usando el componente LanguageSwitcher
```tsx
import LanguageSwitcher from '@/app/components/ui/LanguageSwitcher/LanguageSwitcher';

export function MyComponent() {
  return <LanguageSwitcher />;
}
```

## Features avanzadas

### Interpolación
```json
{
  "welcome": "Bienvenido, {name}!"
}
```
```tsx
t('welcome', { name: 'Alvaro' })
// Output: "Bienvenido, Alvaro!"
```

### Plurales
```json
{
  "linkCount": "{count, plural, =0 {Sin links} =1 {1 link} other {# links}}"
}
```
```tsx
t('linkCount', { count: 5 })
// Output: "5 links"
```

### Rich Text
```tsx
t.rich('terms', {
  link: (chunks) => <Link href="/terms">{chunks}</Link>
})
```

## Configuración

- **Archivo de configuración:** `i18n/request.ts`
- **Middleware:** `middleware.ts` (gestiona cookies)
- **Layout:** `app/layout.tsx` (provider y locale)
- **Hook personalizado:** `app/hooks/useLanguage.ts`
