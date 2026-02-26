import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Protege apenas a rota admin, deixa o resto do site livre
const isProtectedRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware((auth, req) => {
    if (isProtectedRoute(req)) auth().protect();
});

export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
