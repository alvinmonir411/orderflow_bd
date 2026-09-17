const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_fVreJN50Kauw@ep-billowing-shadow-a5svvtgn-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require');

async function main() {
  const rows = await sql`SELECT * FROM "ChatMessage" ORDER BY "createdAt" DESC LIMIT 15`;
  console.log('Recent Messages Count:', rows.length);
  console.log(JSON.stringify(rows, null, 2));

  const settings = await sql`SELECT * FROM "BotSettings" WHERE id = 'settings-1'`;
  console.log('BotSettings:', settings);
}

main().catch(console.error);
