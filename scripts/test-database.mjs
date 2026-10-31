import { PGlite } from '@electric-sql/pglite';
import { btree_gist } from '@electric-sql/pglite/contrib/btree_gist';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const db = new PGlite({ extensions: { btree_gist } });
try {
  await db.exec(`
  CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
  GRANT USAGE ON SCHEMA public TO anon,authenticated,service_role;
  CREATE TABLE public.professionals(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),name text,location text,active boolean DEFAULT true,location_start_date date,location_end_date date,created_at timestamptz DEFAULT now());
  CREATE TABLE public.leads(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),nome text,whatsapp text,service_name text,professional_id uuid REFERENCES professionals(id),appointment_date date,appointment_time text,status_kanban text,mensagem_interesse text,created_at timestamptz DEFAULT now());
  CREATE TABLE public.professional_schedule(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),professional_id text,day_of_week integer,start_time time,end_time time,is_day_off boolean,created_at timestamptz DEFAULT now());
  CREATE TABLE public.site_config(id text PRIMARY KEY,sections_layout jsonb,updated_at timestamptz DEFAULT now());
  CREATE TABLE public.booking_locks(id uuid PRIMARY KEY DEFAULT gen_random_uuid());
  CREATE FUNCTION public.update_lead_interest(p_id uuid,p_interest text) RETURNS void LANGUAGE sql SECURITY DEFINER AS 'UPDATE public.leads SET mensagem_interesse=p_interest WHERE id=p_id';
  `);
  const root = fileURLToPath(new URL('../', import.meta.url));
  const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');
  await db.exec(read('sql', '001_booking_tables.sql').split('INSERT INTO public.services (name')[0]);
  for (const migration of fs.readdirSync(path.join(root, 'supabase', 'migrations')).sort()) {
    await db.exec(read('supabase', 'migrations', migration));
  }
  await db.exec(read('sql', '008_booking_schedule_admin_source_of_truth.sql'));
  await db.exec(read('supabase', 'migrations', '20261031170000_new_combos.sql'));
  const offersResult = await db.exec(read('tests', 'catalog-offers.sql'));
  const canonicalResult = await db.exec(read('tests', 'database-security.sql'));
  // Model the old installer and permissive inherited ACLs, then repair them.
  await db.exec(`
  CREATE TABLE public.rate_limit_entries(key text PRIMARY KEY,tokens integer,window_start timestamptz,window_seconds integer);
  GRANT ALL ON public.rate_limit_entries TO PUBLIC,anon,authenticated;
  GRANT EXECUTE ON FUNCTION public.consume_rate_limit(text,integer,integer) TO PUBLIC,anon,authenticated;
  GRANT EXECUTE ON FUNCTION public.cleanup_rate_limit_entries() TO PUBLIC,anon,authenticated;
  `);
  // Both installation paths must converge, including repeated applications.
  await db.exec(read('sql', '009_rate_limit.sql'));
  await db.exec(read('sql', '009_rate_limit.sql'));
  const result = await db.exec(read('tests', 'database-security.sql'));
  console.log(JSON.stringify({ offers: offersResult.filter(r=>r.rows.length).map(r=>r.rows), canonical: canonicalResult.filter(r=>r.rows.length).map(r=>r.rows), compatibility: result.filter(r=>r.rows.length).map(r=>r.rows) }));
} finally {
  await db.close();
}
