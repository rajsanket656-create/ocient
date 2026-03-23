import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ggsbmbburbudfeoapwem.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdnc2JtYmJ1cmJ1ZGZlb2Fwd2VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2OTI0NTUsImV4cCI6MjA4OTI2ODQ1NX0.47Jm9VwPd724uvtFZVSR8C_apqTkbi0IHvyU-7j0Q10';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMeta() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'tatinihar@gmail.com',
    password: 'BHALU12345B'
  });

  if (authError) {
    console.error('Login error:', authError);
    return;
  }

  console.dir(authData.user, { depth: null });
}

checkMeta();
