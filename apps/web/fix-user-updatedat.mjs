import { neon } from '@neondatabase/serverless';

const connStr =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_fVreJN50Kauw@ep-billowing-shadow-a5svvtgn-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require';

const sql = neon(connStr);

async function fixUserUpdatedAt() {
  console.log('Fixing User.updatedAt in Neon DB...');
  try {
    await sql`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT NOW();`;
    await sql`ALTER TABLE "User" ALTER COLUMN "updatedAt" SET DEFAULT NOW();`;
    console.log('User.updatedAt default set successfully');
  } catch (e) {
    console.log('User.updatedAt note:', e.message);
  }
}

fixUserUpdatedAt();
