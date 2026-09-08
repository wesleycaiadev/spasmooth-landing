import { MetadataRoute } from 'next';
import { getIndexableUnits } from '@/data/units';
import { getIndexableServices } from '@/services/publicServices';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://spasmooth.com.br';

  // Static URLs guaranteed to be generated
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/privacidade`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/servicos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/unidades`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  try {
    // Attempt to fetch units (Static file, shouldn't fail, but keep safe)
    const activeUnits = getIndexableUnits();
    const unitUrls: MetadataRoute.Sitemap = activeUnits.map((unit) => ({
      url: `${baseUrl}/unidades/${unit.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    // Attempt to fetch services from DB (Might fail if Supabase is down)
    const activeServices = await getIndexableServices();
    const serviceUrls: MetadataRoute.Sitemap = activeServices.map((service) => ({
      url: `${baseUrl}/servicos/${service.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticUrls, ...unitUrls, ...serviceUrls];
  } catch (error) {
    // If Supabase fails or any other error, fallback to static URLs to prevent 500 error
    console.error('Error generating dynamic sitemap URLs, returning static fallback:', error);
    return staticUrls;
  }
}
