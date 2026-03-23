import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ggsbmbburbudfeoapwem.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdnc2JtYmJ1cmJ1ZGZlb2Fwd2VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2OTI0NTUsImV4cCI6MjA4OTI2ODQ1NX0.47Jm9VwPd724uvtFZVSR8C_apqTkbi0IHvyU-7j0Q10';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
  const { data, error } = await supabase.from('profiles').upsert([
    { id: 'efc52ca9-ba98-46ab-85eb-556ddb96135d', email: 'tatinihar@gmail.com', is_admin: true }
  ]).select();
  console.log('Insert/Update attempt:', error || data);
}

fix();
