import { neon } from '@neondatabase/serverless';

const connStr =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_fVreJN50Kauw@ep-billowing-shadow-a5svvtgn-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require';

const sql = neon(connStr);

async function fixUserColumns() {
  console.log('Fixing User table columns in Neon DB...');
  try {
    await sql`ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;`;
    console.log('User.password drop not-null succeeded');
  } catch (e) {
    console.log('User.password note:', e.message);
  }

  try {
    await sql`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT DEFAULT 'admin123';`;
    await sql`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT DEFAULT 'admin123';`;
    console.log('User password columns verified');
  } catch (e) {
    console.log('Error adding password column:', e.message);
  }
}

fixUserColumns();
