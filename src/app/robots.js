export default function robots() {
    const baseUrl = 'https://spasmooth.vercel.app';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/', '/obrigado/', '/entrar/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
