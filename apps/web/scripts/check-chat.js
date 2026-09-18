const { neon } = require('@neondatabase/serverless');

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('Error: DATABASE_URL not found in environment');
  process.exit(1);
}

const sql = neon(dbUrl);

async function main() {
  const rows = await sql`SELECT * FROM "ChatMessage" ORDER BY "createdAt" DESC LIMIT 5`;
  console.log('Recent Messages Count:', rows.length);
  console.log('Recent Messages:', JSON.stringify(rows, null, 2));

  const settings = await sql`SELECT * FROM "BotSettings" WHERE id = 'settings-1'`;
  console.log('BotSettings in DB:', settings);
}

main().catch(console.error);
