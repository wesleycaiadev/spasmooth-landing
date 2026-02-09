-- Create Professional Schedule Table
create table if not exists professional_schedule (
  id uuid default uuid_generate_v4() primary key,
  professional_id text not null, -- Using text because in ProfessionalSelector it seems we use string IDs like 'ana', 'julia'
  day_of_week integer not null, -- 0-6 (Sunday-Saturday)
  start_time time not null default '08:00:00',
  end_time time not null default '20:00:00',
  is_day_off boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table professional_schedule enable row level security;

-- Policy: Everyone can read schedules
create policy "Public schedules are viewable by everyone"
  on professional_schedule for select
  using ( true );

-- Policy: Only authenticated/admin can insert/update (if we had auth, for now open for dev or restricted to service role)
-- Assuming public insert for now based on previous patterns, or just manual insert
create policy "Public schedules are insertable by everyone"
  on professional_schedule for insert
  with check ( true );

-- Insert Default Schedules for Known Professionals
-- Ana, Julia, Rebeca, Sol
-- Monday (1) to Saturday (6)
insert into professional_schedule (professional_id, day_of_week, start_time, end_time, is_day_off)
select 
  p_id, 
  day_num, 
  '08:00:00', 
  '20:00:00', 
  false
from 
  (values ('ana'), ('julia'), ('rebeca'), ('sol')) as p(p_id)
cross join 
  generate_series(1, 6) as t(day_num);

-- Insert Sunday (0) as OFF for everyone
insert into professional_schedule (professional_id, day_of_week, start_time, end_time, is_day_off)
select 
  p_id, 
  0, 
  '08:00:00', 
  '20:00:00', 
  true
from 
  (values ('ana'), ('julia'), ('rebeca'), ('sol')) as p(p_id);
