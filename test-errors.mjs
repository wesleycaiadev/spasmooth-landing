import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  
  [envPath, envLocalPath].forEach(p => {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf-8');
      content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          process.env[match[1].trim()] = match[2].trim();
        }
      });
    }
  });
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('Faltando variaveis de ambiente');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  console.log('Testing bookings query...');
  const { data, error } = await supabase
    .from("bookings")
    .select("*, professionals(name, location), services(name, duration_minutes, price)")
    .order("starts_at", { ascending: false })
    .limit(2);
  
  if (error) {
    console.error('Error in bookings query:', error);
  } else {
    console.log('Bookings Query success:', data?.length, 'rows');
  }

  console.log('\nTesting professionals getActive...');
  const { data: pros, error: errPros } = await supabase
        .from('professionals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2);
  if (errPros) {
      console.error('Error in professionals query:', errPros);
  } else {
      console.log('Professionals Query success:', pros?.length, 'rows');
  }
}

async function testUpload() {
  console.log('\nTesting upload...');
  const { data, error } = await supabase.storage.from('avatars').upload('test.txt', 'hello world', { upsert: true });
  if (error) {
    console.error('Error in upload:', error);
  } else {
    console.log('Upload success:', data);
  }
}

async function run() {
  await testQuery();
  await testUpload();
}

run();
