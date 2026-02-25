export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
        },
        sitemap: 'https://spasmooth.vercel.app/sitemap.xml',
    }
}
