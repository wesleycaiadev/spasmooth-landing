export default function robots() {
    const baseUrl = 'https://spasmooth.vercel.app'; // Substitua pelo domínio real

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/'], // Evitar indexação das rotas de API e Painel Admin
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
