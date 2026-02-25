
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS confirmation_token text UNIQUE DEFAULT gen_random_uuid();


UPDATE leads 
SET confirmation_token = null 
WHERE status_kanban != 'novo' AND confirmation_token IS NOT NULL;
