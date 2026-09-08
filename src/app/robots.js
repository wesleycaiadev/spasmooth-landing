export default function robots() {
    const baseUrl = 'https://spasmooth.com.br';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/', '/obrigado/', '/entrar/', '/seguranca/', '/interesse/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
