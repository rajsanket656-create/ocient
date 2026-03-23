import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ggsbmbburbudfeoapwem.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdnc2JtYmJ1cmJ1ZGZlb2Fwd2VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2OTI0NTUsImV4cCI6MjA4OTI2ODQ1NX0.47Jm9VwPd724uvtFZVSR8C_apqTkbi0IHvyU-7j0Q10';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Logging in...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'tatinihar@gmail.com',
    password: 'BHALU12345B'
  });

  if (authError) {
    console.error('Login error:', authError);
    return;
  }

  console.log('Logged in user ID:', authData.user.id);

  console.log('Fetching profile...');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (profileError) {
    console.error('Profile fetch error:', profileError);
  } else {
    console.log('Profile:', profile);
  }
}

test();
