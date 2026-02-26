export default function sitemap() {
  const baseUrl = 'https://spasmooth.vercel.app'; // Substitua pelo domínio real

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    // Adicione outras rotas estáticas aqui se necessário ao expandir o site
  ];
}
