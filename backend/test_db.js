const { Client } = require('pg');

const connectionString = "postgresql://postgres:sunny%40Prasad@db.nkttztbqbccqsjwzljml.supabase.co:5432/postgres";

async function testConnection() {
  const client = new Client({
    connectionString: connectionString,
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log('--- DIAGNOSTIC START ---');
    console.log('Attempting to connect to Supabase...');
    await client.connect();
    console.log('✅ SUCCESS: Connected to Supabase!');
    const res = await client.query('SELECT NOW()');
    console.log('Server time:', res.rows[0].now);
    await client.end();
  } catch (err) {
    console.error('❌ FAILURE:', err.message);
    console.error('Error Code:', err.code);
    if (err.message.includes('getaddrinfo')) {
      console.error('Suggestion: DNS Resolution Failed. Check your hostname.');
    } else if (err.message.includes('ETIMEDOUT')) {
      console.error('Suggestion: Connection timed out. Check your firewall or try Port 6543.');
    }
  } finally {
    console.log('--- DIAGNOSTIC END ---');
  }
}

testConnection();
