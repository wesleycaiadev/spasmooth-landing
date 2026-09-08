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
    {
        key: 'Content-Security-Policy',
        value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://clerk.spasmooth.com.br https://*.clerk.accounts.dev https://*.clerk.dev https://*.clerk.com https://challenges.cloudflare.com https://www.googletagmanager.com",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' blob: data: https://images.unsplash.com https://*.supabase.co https://img.clerk.com https://*.clerk.dev https://ui-avatars.com",
            "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://*.supabase.co https://clerk.spasmooth.com.br https://*.clerk.accounts.dev https://*.clerk.dev https://*.clerk.com",
            "font-src 'self' https://fonts.gstatic.com",
            "frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.dev https://*.clerk.com https://www.google.com https://maps.google.com https://challenges.cloudflare.com",
            "object-src 'none'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "upgrade-insecure-requests"
        ].join('; ')
    }
];

const securityHeaders = isProd
    ? [...baseHeaders, ...prodOnlyHeaders]
    : baseHeaders;

const nextConfig = {
    poweredByHeader: false,
    experimental: { serverActions: { bodySizeLimit: '64kb' } },
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
