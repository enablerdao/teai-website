require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vtjkhwlqmgsxjknggvnl.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is not set in .env file or environment variables.');
  process.exit(1);
}

interface User {
  email: string;
  created_at: string;
}

interface AdminUser {
  user_id: string;
  users: {
    email: string;
  };
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  // db: {
  //   schema: 'public'
  // },
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

async function listUsers() {
  try {
    // Get all users from auth.users
    const { data: users, error } = await supabase
      .from('auth.users')
      .select('email, created_at');

    if (error) {
      console.error('Error fetching users:', error);
      return;
    }

    console.log('Total users:', users.length);
    console.log('\nUser list:');
    (users as User[]).forEach(user => {
      console.log(`- ${user.email} (registered: ${new Date(user.created_at).toLocaleString('ja-JP')})`);
    });

    // Get admin users
    const { data: admins, error: adminError } = await supabase
      .from('admin_users')
      .select(`
        user_id,
        users:user_id (
          email
        )
      `);

    if (adminError) {
      console.error('Error fetching admins:', adminError);
      return;
    }

    console.log('\nAdmin users:', admins.length);
    (admins as AdminUser[]).forEach(admin => {
      console.log(`- ${admin.users.email}`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

listUsers(); 