const { Pool } = require('pg');

// Use Render PostgreSQL database directly
const connectionString = 'postgresql://expo_admin:ILK9Pxsl31jPSZxi7ojw7LZ3qk4pSXsV@dpg-d5md7k14tr6s73cifjmg-a.virginia-postgres.render.com/expo_event_db';

console.log('=== DATABASE CONNECTION DEBUG ===');
console.log('Connection String:', connectionString);
console.log('Database Host: dpg-d5md7k14tr6s73cifjmg-a.virginia-postgres.render.com');
console.log('Database Name: expo_event_db');
console.log('===============================');

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('connect', () => {
  console.log('✅ Connected to Render PostgreSQL database');
  console.log('📊 Database: expo_event_db');
  console.log('🌐 Host: dpg-d5md7k14tr6s73cifjmg-a.virginia-postgres.render.com');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
  process.exit(1);
});

// Test connection immediately
pool.query('SELECT NOW() as current_time, current_database() as database')
  .then(result => {
    console.log('🎯 Database test successful!');
    console.log('⏰ Current time:', result.rows[0].current_time);
    console.log('💾 Connected to database:', result.rows[0].database);
  })
  .catch(err => {
    console.error('❌ Database test failed:', err);
  });

module.exports = pool;
