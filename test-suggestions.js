const pool = require('./backend/db');

async function testSuggestions() {
  try {
    console.log('Testing visitors table...');
    
    // Check if visitors table exists and has data
    const visitorsResult = await pool.query('SELECT phone, full_name FROM visitors LIMIT 10');
    console.log('Visitors in database:', visitorsResult.rows);
    
    // Test the exact query used in the API
    const searchQuery = `
      SELECT phone, full_name 
      FROM visitors 
      WHERE phone ILIKE $1
      ORDER BY 
        CASE 
          WHEN phone = $2 THEN 1
          WHEN phone LIKE $3 THEN 2
          ELSE 3
        END,
        phone
      LIMIT 10
    `;
    
    const searchResult = await pool.query(searchQuery, [
      '3%',  // Starts with 3
      '3',   // Exact match
      '3%'   // Starts with 3 again
    ]);
    
    console.log('Search results for "3":', searchResult.rows);
    
    // Format as API would
    const suggestions = searchResult.rows.map(row => `${row.phone}(${row.full_name || 'Unknown'})`);
    console.log('Formatted suggestions:', suggestions);
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await pool.end();
  }
}

testSuggestions();
