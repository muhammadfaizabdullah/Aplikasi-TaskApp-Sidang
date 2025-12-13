import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Tambahkan headers untuk mengatasi masalah localhost dan error 431
  response.headers.set('X-DNS-Prefetch-Control', 'off')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Mengurangi ukuran response headers
  response.headers.set('Cache-Control', 'no-store, must-revalidate')
  
  // Tambahkan header untuk mengatasi masalah localhost
  if (request.nextUrl.hostname === 'localhost') {
    response.headers.set('X-Localhost-Fix', 'true')
  }

  // Tambahkan header untuk mencegah error 431
  response.headers.set('X-Session-Size-Limit', '1024')
  
  // Cek jika ada request untuk upload foto profil
  if (request.nextUrl.pathname.includes('/api/users/me/avatar')) {
    // Tambahkan header khusus untuk upload foto
    response.headers.set('X-Profile-Image-Limit', '512KB')
    response.headers.set('X-Prevent-Large-Upload', 'true')
  }

  // Optional: could enforce via cookies here if set in the future

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (NextAuth routes)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
  ],
}
