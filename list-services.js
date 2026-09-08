const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local.full
const envFile = fs.readFileSync('.env.local.full', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/^"|"$/g, '');
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('services').select('*').eq('active', true).order('category').order('name');
  if (error) {
    console.error(error);
  } else {
    data.forEach(s => {
      console.log(`- ${s.name} (Categoria: ${s.category}, Duração: ${s.duration_minutes}min, Preço: R$${s.price})`);
    });
  }
}
run();
