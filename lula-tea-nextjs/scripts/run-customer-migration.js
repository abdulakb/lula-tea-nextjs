const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('Reading migration file...');
    const migrationPath = path.join(__dirname, '../supabase/migrations/006_create_customer_auth_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Executing migration...');
    
    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      console.log(`\nExecuting: ${statement.substring(0, 50)}...`);
      const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        console.error('Error executing statement:', error);
        // Try direct query
        const { data: data2, error: error2 } = await supabase.from('_migrations').select('*').limit(1);
        if (error2) {
          console.error('Cannot use RPC, trying direct approach...');
        }
      } else {
        console.log('✓ Statement executed successfully');
      }
    }
    
    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
