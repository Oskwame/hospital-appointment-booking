import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // We use localStorage for auth, so middleware cannot verify tokens.
  // Auth protection is handled client-side in components/protected-layout.tsx
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}