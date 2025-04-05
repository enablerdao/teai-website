const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vtjkhwlqmgsxjknggvnl.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public'
  },
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

async function addAdmin() {
  try {
    // First, get the user ID using raw SQL query
    const { data: users, error: userError } = await supabase
      .rpc('get_user_id_by_email', {
        p_email: 'yuki@hamada.tokyo'
      });

    if (userError) {
      console.error('Error finding user:', userError);
      return;
    }

    if (!users || users.length === 0) {
      console.error('User not found');
      return;
    }

    const userId = users[0].id;
    console.log('Found user ID:', userId);

    // Add the user as an admin using raw SQL
    const { error: adminError } = await supabase
      .rpc('add_admin_user', {
        p_user_id: userId,
        p_created_by: userId
      });

    if (adminError) {
      console.error('Error adding admin:', adminError);
      return;
    }

    console.log('Successfully added yuki@hamada.tokyo as an admin');
  } catch (error) {
    console.error('Error:', error);
  }
}

// First create the necessary functions
async function createHelperFunctions() {
  try {
    // Create function to get user ID by email
    await supabase.rpc('create_get_user_id_function', {
      sql: `
        CREATE OR REPLACE FUNCTION get_user_id_by_email(p_email TEXT)
        RETURNS TABLE (id UUID)
        SECURITY DEFINER
        SET search_path = public
        LANGUAGE plpgsql
        AS $$
        BEGIN
          RETURN QUERY
          SELECT auth.users.id
          FROM auth.users
          WHERE email = p_email;
        END;
        $$;
      `
    });

    // Create function to add admin user
    await supabase.rpc('create_add_admin_function', {
      sql: `
        CREATE OR REPLACE FUNCTION add_admin_user(p_user_id UUID, p_created_by UUID)
        RETURNS void
        SECURITY DEFINER
        SET search_path = public
        LANGUAGE plpgsql
        AS $$
        BEGIN
          INSERT INTO admin_users (user_id, created_by)
          VALUES (p_user_id, p_created_by)
          ON CONFLICT (user_id) DO NOTHING;
        END;
        $$;
      `
    });

    console.log('Helper functions created successfully');
  } catch (error) {
    console.error('Error creating helper functions:', error);
  }
}

// Run the script
async function main() {
  await createHelperFunctions();
  await addAdmin();
}

main(); 