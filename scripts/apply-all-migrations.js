/**
 * Script to display all pending migration instructions
 * Run with: node scripts/apply-all-migrations.js
 */

const fs = require('fs');
const path = require('path');

console.log('');
console.log('═'.repeat(80));
console.log('📦 APPLY ALL PENDING MIGRATIONS');
console.log('═'.repeat(80));
console.log('');
console.log('🔧 ISSUES TO FIX:');
console.log('   1. ❌ Invoice public links showing "Invoice Not Found"');
console.log('   2. ❌ Notifications only appear after page refresh');
console.log('   3. ❌ "new row violates row-level security policy" errors');
console.log('   4. ❌ 401 error when placing orders');
console.log('');
console.log('✅ SOLUTIONS: Apply 3 database migrations');
console.log('');
console.log('═'.repeat(80));
console.log('');

const migrations = [
  {
    file: '004_public_invoice_access.sql',
    title: 'Migration #1: Enable Public Invoice Access',
    description: 'Allows customers to view invoices via public links'
  },
  {
    file: '005_enable_notifications_realtime.sql',
    title: 'Migration #2: Enable Real-time Notifications',
    description: 'Enables instant notifications without page refresh'
  },
  {
    file: '006_fix_orders_rls_policies.sql',
    title: 'Migration #3: Fix Orders RLS Policies',
    description: 'Fixes RLS errors for orders, customers, and notifications'
  }
];

console.log('📝 INSTRUCTIONS:');
console.log('');
console.log('1. Open Supabase SQL Editor:');
console.log('   🔗 https://supabase.com/dashboard/project/tjitbybznlpdiqbbgqif/sql/new');
console.log('');
console.log('2. Copy and run each migration SQL below IN ORDER');
console.log('');
console.log('3. After running all 3, test the fixes:');
console.log('   - Create a new order → notification appears instantly');
console.log('   - Share an invoice link → customer can view it');
console.log('   - No more RLS policy errors in console');
console.log('');
console.log('═'.repeat(80));
console.log('');

migrations.forEach((migration, index) => {
  console.log(`\n${'═'.repeat(80)}`);
  console.log(`${migration.title}`);
  console.log(`📄 ${migration.description}`);
  console.log('═'.repeat(80));
  console.log('');
  
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migration.file);
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');
  
  console.log(migrationSql);
  console.log('');
  
  if (index < migrations.length - 1) {
    console.log('⬇️  NEXT MIGRATION BELOW ⬇️');
  }
});

console.log('═'.repeat(80));
console.log('');
console.log('✅ AFTER APPLYING ALL 3 MIGRATIONS:');
console.log('');
console.log('   ✓ Customers can view invoices via public links');
console.log('   ✓ Notifications appear instantly in real-time');
console.log('   ✓ No more RLS policy violation errors');
console.log('   ✓ Admins can manage all orders, customers, and notifications');
console.log('   ✓ Order placement works correctly');
console.log('');
console.log('💡 TIP: Run all 3 migrations in one SQL query for faster setup!');
console.log('');
console.log('═'.repeat(80));
