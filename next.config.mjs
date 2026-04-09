/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const baseHeaders = [
    { key: 'X-DNS-Prefetch-Control', value: 'on' },
    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
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
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.spasmooth.com.br https://*.clerk.accounts.dev https://*.clerk.dev https://*.clerk.com",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' blob: data: https://images.unsplash.com https://*.supabase.co https://img.clerk.com https://*.clerk.dev",
            "connect-src 'self' https://*.supabase.co https://clerk.spasmooth.com.br https://*.clerk.accounts.dev https://*.clerk.dev https://*.clerk.com",
            "font-src 'self' https://fonts.gstatic.com",
            "frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.dev https://*.clerk.com https://www.google.com https://maps.google.com",
            "object-src 'none'",
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
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: '*.supabase.co',
            },
            {
                protocol: 'https',
                hostname: 'img.clerk.com',
            },
        ],
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: securityHeaders,
            },
        ];
    },
};

export default nextConfig;
