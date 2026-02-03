const pool = require('./db');

async function checkVisitorLeadsTable() {
  try {
    console.log('=== CHECKING visitor_leads TABLE STRUCTURE ===');
    
    // Check table structure
    const structureQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'visitor_leads'
      ORDER BY ordinal_position
    `;
    
    const structureResult = await pool.query(structureQuery);
    console.log('📋 Table structure:');
    structureResult.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check recent records with follow_up_date
    const recentRecordsQuery = `
      SELECT id, visitor_id, employee_id, follow_up_date, created_at
      FROM visitor_leads 
      ORDER BY created_at DESC 
      LIMIT 5
    `;
    
    const recordsResult = await pool.query(recentRecordsQuery);
    console.log('\n📄 Recent records:');
    if (recordsResult.rows.length === 0) {
      console.log('  No records found');
    } else {
      recordsResult.rows.forEach(record => {
        console.log(`  ID: ${record.id}, Visitor: ${record.visitor_id}, Follow-up: ${record.follow_up_date}, Created: ${record.created_at}`);
      });
    }
    
    // Check specifically for null follow_up_dates
    const nullCheckQuery = `
      SELECT COUNT(*) as total_records,
             COUNT(follow_up_date) as non_null_dates,
             COUNT(*) - COUNT(follow_up_date) as null_dates
      FROM visitor_leads
    `;
    
    const nullResult = await pool.query(nullCheckQuery);
    console.log('\n📊 Follow-up date statistics:');
    console.log(`  Total records: ${nullResult.rows[0].total_records}`);
    console.log(`  Non-null dates: ${nullResult.rows[0].non_null_dates}`);
    console.log(`  Null dates: ${nullResult.rows[0].null_dates}`);
    
  } catch (error) {
    console.error('❌ Error checking table:', error);
  } finally {
    await pool.end();
  }
}

checkVisitorLeadsTable();
