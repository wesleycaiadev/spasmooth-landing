import { clerkMiddleware } from '@clerk/nextjs/server';
// Resource-level checks live in the admin layout, every action and every API handler.
export default clerkMiddleware();
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/entrar/:path*', '/seguranca/:path*'],
};
