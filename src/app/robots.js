export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/admin/', // Impede o Google de indexar o seu painel de administração
        },
        sitemap: 'https://spasmooth.vercel.app/sitemap.xml',
    }
}
