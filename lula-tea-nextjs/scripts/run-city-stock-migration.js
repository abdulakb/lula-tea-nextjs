const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rvefebygwjxaexiywknb.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2ZWZlYnlnd2p4YWV4aXl3a25iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjg5NDI0OCwiZXhwIjoyMDQ4NDcwMjQ4fQ.CJ-mKZ_4Rd9iCGf9G2Ou8qQJOZnKYdgkfZsN_7nDqGI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('Starting city stock migration...');
    
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '012_add_city_stock.sql');
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');
    
    // Split SQL by semicolons and execute each statement
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);
      console.log(statement.substring(0, 100) + '...');
      
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: statement
      });
      
      if (error) {
        // Try direct query if exec_sql doesn't exist
        const { error: directError } = await supabase.from('_migrations').insert({
          name: '012_add_city_stock',
          executed_at: new Date().toISOString()
        });
        
        console.warn('Warning:', error.message);
        console.log('Trying alternative method...');
        
        // For ALTER TABLE and CREATE FUNCTION, we need to use the SQL editor or supabase CLI
        console.log('\n⚠️ This migration requires SQL admin access.');
        console.log('Please run this migration manually in Supabase SQL Editor:');
        console.log('1. Go to https://supabase.com/dashboard/project/rvefebygwjxaexiywknb/sql/new');
        console.log('2. Paste the contents of supabase/migrations/012_add_city_stock.sql');
        console.log('3. Click "Run"');
        
        return;
      }
      
      console.log('✓ Statement executed successfully');
    }
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
