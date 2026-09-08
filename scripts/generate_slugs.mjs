import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

const indexableServices = [
  'depilacao-meia-perna',
  'depilacao-perna-completa',
  'depilacao-bracos',
  'depilacao-costas',
  'depilacao-abdomen',
  'depilacao-intima',
  'depilacao-corpo-todo',
  'drenagem-linfatica',
  'spa-dos-pes',
  'relaxante-bambu',
  'relaxante-pedras',
  'relaxante-ventosa',
  'bambu-ventosa-pedras-quentes',
  'massagem-desportiva',
  'day-spa-standard'
];

async function run() {
  const { data: services, error } = await supabase
    .from('services')
    .select('id, name, active, category');

  if (error) {
    console.error("Error fetching services:", error);
    process.exit(1);
  }

  // Group by base slug
  const grouped = new Map();
  for (const s of services) {
    const baseSlug = slugify(s.name);
    if (!grouped.has(baseSlug)) {
      grouped.set(baseSlug, []);
    }
    grouped.get(baseSlug).push(s);
  }

  const results = [];

  for (const [baseSlug, group] of grouped.entries()) {
    if (group.length === 1) {
      const s = group[0];
      const seoIndexable = s.active && indexableServices.includes(baseSlug);
      results.push({ ...s, slug: baseSlug, seo_indexable: seoIndexable, oldSlug: null });
    } else {
      // Handle collisions
      let activeCount = 0;
      for (const s of group) {
        let finalSlug = baseSlug;
        
        if (s.active) {
          if (activeCount > 0) {
            finalSlug = `${baseSlug}-${activeCount+1}`; // If multiple active, fallback to -2
          }
          activeCount++;
        } else {
          const shortId = s.id.split('-')[0];
          finalSlug = `legacy-${baseSlug}-${shortId}`;
        }
        
        const seoIndexable = s.active && indexableServices.includes(finalSlug);
        results.push({ ...s, slug: finalSlug, seo_indexable: seoIndexable, oldSlug: baseSlug });
      }
    }
  }

  // Generate Report Markdown
  let md = `# Relatório Final de Slugs\n\n`;
  md += `| Nome | Slug Anterior (se colisão) | Slug Final | Ativo | SEO Indexable | Categoria |\n`;
  md += `| --- | --- | --- | --- | --- | --- |\n`;
  results.forEach(r => {
    md += `| ${r.name} | ${r.oldSlug || '-'} | **${r.slug}** | ${r.active ? '✅ Sim' : '❌ Não'} | ${r.seo_indexable ? '✅ Sim' : '❌ Não'} | ${r.category} |\n`;
  });

  writeFileSync('report_slugs_final.md', md);
  
  // Generate SQL to apply slugs
  let sql = `-- Fase 1.1: Atualizar slugs dos serviços existentes de forma limpa\n`;
  results.forEach(r => {
    sql += `UPDATE public.services SET slug = '${r.slug}', seo_indexable = ${r.seo_indexable} WHERE id = '${r.id}';\n`;
  });
  // Unique constraint
  sql += `\n-- Fase 1.2: Adicionar Unique Constraint\n`;
  sql += `ALTER TABLE public.services ADD CONSTRAINT services_slug_key UNIQUE (slug);\n`;
  
  writeFileSync('sql/007_services_seo_part1_updates.sql', sql);
  
  console.log("Relatório gerado em report_slugs_final.md e SQL em sql/007_services_seo_part1_updates.sql");
}

run();
