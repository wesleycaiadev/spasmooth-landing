import { PGlite } from '@electric-sql/pglite';
import { btree_gist } from '@electric-sql/pglite/contrib/btree_gist';
import assert from 'node:assert/strict';
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
  // The legacy SEO setup precedes the catalog migrations in the installed schema.
  await db.exec('ALTER TABLE public.services ADD COLUMN seo_indexable boolean DEFAULT false;');
  for (const migration of fs.readdirSync(path.join(root, 'supabase', 'migrations')).sort()) {
    await db.exec(read('supabase', 'migrations', migration));
  }
  await db.exec(read('sql', '008_booking_schedule_admin_source_of_truth.sql'));
  await db.exec(read('supabase', 'migrations', '20261031170000_new_combos.sql'));
  const offersResult = await db.exec(read('tests', 'catalog-offers.sql'));
  // Reapplying catalog SQL must preserve edits made in the Admin afterwards.
  await db.exec("BEGIN; UPDATE public.services SET duration_minutes=60,price=175 WHERE slug='combo-desacelera';");
  await db.exec(read('supabase', 'migrations', '20261031170000_new_combos.sql'));
  await db.exec("DO $$ BEGIN IF NOT EXISTS(SELECT 1 FROM public.services WHERE slug='combo-desacelera' AND duration_minutes=60 AND price=175) THEN RAISE EXCEPTION 'ADMIN_EDIT_OVERWRITTEN'; END IF; END $$; ROLLBACK;");
  const canonicalResult = await db.exec(read('tests', 'database-security.sql'));
  const anamnesisResult = await db.exec(read('tests', 'booking-anamnesis.sql'));
  await db.exec(`
    BEGIN;
    SET LOCAL ROLE service_role;
    WITH pro AS (
      INSERT INTO public.professionals(name, location, active) VALUES ('Worker Fixture', 'Aracaju', true) RETURNING id
    ), booking AS (
      INSERT INTO public.bookings(unit, professional_id, service_id, client_name, client_phone, starts_at, ends_at, status)
      SELECT 'Aracaju', pro.id, s.id, 'Pessoa Teste', '82999990000', now() + interval '1 day',
             now() + interval '1 day 45 minutes', 'pendente'
      FROM pro CROSS JOIN public.services s WHERE s.slug = 'combo-desacelera' RETURNING id
    ), intake AS (
      INSERT INTO public.booking_anamneses(booking_id, questionnaire_version, service_category, deadline_at)
      SELECT id, 'spa-1', 'combo', now() FROM booking RETURNING booking_id
    )
    INSERT INTO public.booking_notification_outbox(booking_id, available_at) SELECT booking_id, now() FROM intake;
  `);
  const claims = await Promise.all([
    db.query('SELECT public.claim_booking_notification() AS claim'),
    db.query('SELECT public.claim_booking_notification() AS claim'),
  ]);
  assert.equal(claims.filter(result => result.rows[0].claim !== null).length, 1, 'Overlapping worker calls must obtain one claim');
  await db.exec('ROLLBACK');
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
  await db.exec(read('tests', 'catalog-offers.sql'));
  console.log(JSON.stringify({ offers: offersResult.filter(r=>r.rows.length).map(r=>r.rows), canonical: canonicalResult.filter(r=>r.rows.length).map(r=>r.rows), anamnesis: anamnesisResult.filter(r=>r.rows.length).map(r=>r.rows), compatibility: result.filter(r=>r.rows.length).map(r=>r.rows) }));
} finally {
  await db.close();
}
