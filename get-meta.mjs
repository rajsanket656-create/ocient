import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const supabaseUrl = 'https://ggsbmbburbudfeoapwem.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdnc2JtYmJ1cmJ1ZGZlb2Fwd2VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2OTI0NTUsImV4cCI6MjA4OTI2ODQ1NX0.47Jm9VwPd724uvtFZVSR8C_apqTkbi0IHvyU-7j0Q10';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data } = await supabase.auth.signInWithPassword({ email: 'tatinihar@gmail.com', password: 'BHALU12345B'});
  fs.writeFileSync('meta.json', JSON.stringify({ user_metadata: data.user.user_metadata, app_metadata: data.user.app_metadata }, null, 2));
}
run();
