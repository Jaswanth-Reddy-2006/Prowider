import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  
  // Inject Correlation ID if it doesn't exist
  const correlationId = request.headers.get('x-correlation-id') || crypto.randomUUID()
  requestHeaders.set('x-correlation-id', correlationId)
  
  // Inject Request ID
  const requestId = crypto.randomUUID()
  requestHeaders.set('x-request-id', requestId)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Return identifiers in response headers for observability
  response.headers.set('x-correlation-id', correlationId)
  response.headers.set('x-request-id', requestId)
  
  // Add Security Headers
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')

  return response
}

export const config = {
  matcher: '/api/:path*',
}
