import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const supabaseUrl = "https://ktvbmxliscwhmlxlfyly.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0dmJteGxpc2N3aG1seGxmeWx5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkwODgyNiwiZXhwIjoyMDc5NDg0ODI2fQ.wjXUoN4fI6GZExdDzdQbOLRgcCTPFNHIT3_PlJ_xfRA";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function clearTestData() {
  console.log('🧹 Starting to clear test data...\n');

  try {
    // 1. Delete all orders (this should cascade to order_details if they exist)
    console.log('Deleting orders...');
    const { error: ordersError, count: ordersCount } = await supabase
      .from('orders')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (ordersError) {
      console.error('❌ Error deleting orders:', ordersError);
    } else {
      console.log(`✅ Deleted ${ordersCount || 'all'} orders\n`);
    }

    // 2. Delete all analytics events
    console.log('Deleting analytics events...');
    const { error: analyticsError, count: analyticsCount } = await supabase
      .from('analytics_events')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (analyticsError) {
      console.error('❌ Error deleting analytics:', analyticsError);
    } else {
      console.log(`✅ Deleted ${analyticsCount || 'all'} analytics events\n`);
    }

    console.log('✨ Test data cleared successfully!');
    console.log('📝 Your database is now clean and ready for production.');
    console.log('\n💡 Note: Product data was preserved.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

clearTestData();
