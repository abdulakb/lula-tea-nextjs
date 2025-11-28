const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Running migration: 003_add_order_details.sql\n');
    
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '003_add_order_details.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the SQL directly
    const { data, error } = await supabase.rpc('exec_sql', { sql_text: sql });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('\nNew columns added to orders table:');
    console.log('  - customer_email');
    console.log('  - gps_coordinates');
    console.log('  - delivery_address_formatted');
    console.log('  - delivery_time_preference');
    console.log('  - quantity_ordered');
    console.log('  - order_date');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
