const pool = require('./db');

async function addFollowUpDateColumn() {
  try {
    console.log('Adding follow_up_date column to visitor_leads table...');
    
    // Check if column already exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'visitor_leads' 
      AND column_name = 'follow_up_date'
    `;
    
    const checkResult = await pool.query(checkColumnQuery);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ follow_up_date column already exists in visitor_leads table');
      return;
    }
    
    // Add the column
    const alterTableQuery = `
      ALTER TABLE visitor_leads 
      ADD COLUMN follow_up_date DATE
    `;
    
    await pool.query(alterTableQuery);
    console.log('✅ Successfully added follow_up_date column to visitor_leads table');
    
    // Verify the column was added
    const verifyQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'visitor_leads' 
      AND column_name = 'follow_up_date'
    `;
    
    const verifyResult = await pool.query(verifyQuery);
    console.log('🔍 Column verification:', verifyResult.rows[0]);
    
  } catch (error) {
    console.error('❌ Error adding follow_up_date column:', error);
  } finally {
    await pool.end();
  }
}

addFollowUpDateColumn();
