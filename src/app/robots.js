export default function robots() {
    const baseUrl = 'https://spasmooth.com.br';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/', '/obrigado/', '/entrar/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
