-- Enable Realtime for the 'leads' table
-- This is required for the client to receive 'INSERT' events.

begin;
  -- Check if publication exists (default supabase_realtime usually exists)
  -- Add table to publication
  alter publication supabase_realtime add table leads;
commit;
