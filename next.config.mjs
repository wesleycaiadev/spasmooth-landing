/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const baseHeaders = [
    { key: 'X-DNS-Prefetch-Control', value: 'on' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const prodOnlyHeaders = [
    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
    { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
    { key: 'Reporting-Endpoints', value: 'csp-endpoint="https://spasmooth.com.br/api/csp-report"' },
    { key: 'Report-To', value: '{"group":"csp-endpoint","max_age":10886400,"endpoints":[{"url":"https://spasmooth.com.br/api/csp-report"}]}' },
    {
        key: 'Content-Security-Policy',
        value: [
            "default-src 'self'",
            // `unsafe-inline` for scripts remains temporarily: per-request nonces would make
            // the ISR home dynamic. Its removal is tracked in docs/SECURITY.md.
            "script-src 'self' 'unsafe-inline' https://clerk.spasmooth.com.br https://*.clerk.com https://challenges.cloudflare.com https://www.googletagmanager.com",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' blob: data: https://images.unsplash.com https://*.supabase.co https://img.clerk.com https://ui-avatars.com",
            "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://*.supabase.co https://clerk.spasmooth.com.br https://*.clerk.com",
            "font-src 'self' https://fonts.gstatic.com",
            "frame-src 'self' https://*.clerk.com https://www.google.com https://maps.google.com https://challenges.cloudflare.com",
            "object-src 'none'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "upgrade-insecure-requests",
            "report-to csp-endpoint",
            "report-uri /api/csp-report"
        ].join('; ')
    }
];

const securityHeaders = isProd
    ? [...baseHeaders, ...prodOnlyHeaders]
    : baseHeaders;

const nextConfig = {
    poweredByHeader: false,
    experimental: {
        serverActions: { bodySizeLimit: '64kb' },
        // The CLI checker in Next 16.3 currently fails to parse TS 6 output in this project.
        // The compiler API performs the same production type check reliably.
        useTypeScriptCli: false,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'xqxrjwamybfndpnvlgie.supabase.co',
            },
            {
                protocol: 'https',
                hostname: 'img.clerk.com',
            },
        ],
    },
    async headers() {
        return [
            { source: "/admin/:path*", headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }] },
            { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }] },
            {
                source: '/(.*)',
                headers: securityHeaders,
            },
        ];
    },
};

export default nextConfig;
