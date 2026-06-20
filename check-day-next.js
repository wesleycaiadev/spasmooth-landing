
const { loadEnvConfig } = require('@next/env');
const { createClient } = require('@supabase/supabase-js');

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Has Anon Key:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
    const { data, error } = await supabase.from('professionals').select('*');
    if (error) {
        console.error('Error fetching professionals:', error);
    } else {
        console.log('Professionals in DB:');
        console.log(JSON.stringify(data, null, 2));
    }
}

main();
