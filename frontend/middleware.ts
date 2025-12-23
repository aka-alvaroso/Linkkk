import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n/request';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // files with extensions
  ) {
    return NextResponse.next();
  }

  // Get locale from cookie or header
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value;
  let locale = defaultLocale;

  if (localeCookie && locales.includes(localeCookie as any)) {
    locale = localeCookie as any;
  } else {
    // Try to detect from Accept-Language header
    const acceptLanguage = request.headers.get('accept-language');
    if (acceptLanguage) {
      const preferredLanguage = acceptLanguage
        .split(',')[0]
        .split('-')[0]
        .toLowerCase();

      if (locales.includes(preferredLanguage as any)) {
        locale = preferredLanguage as any;
      }
    }
  }

  // Create response
  const response = NextResponse.next();

  // Set cookie if not already set or different
  if (!localeCookie || localeCookie !== locale) {
    response.cookies.set('NEXT_LOCALE', locale, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  // Match all pathnames except for
  // - api routes
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico, favicon.png (favicon files)
  matcher: ['/((?!api|_next/static|_next/image|favicon).*)'],
};
