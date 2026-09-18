import { neon } from '@neondatabase/serverless';

const connStr =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_fVreJN50Kauw@ep-billowing-shadow-a5svvtgn-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require';

const sql = neon(connStr);

async function fixUserStoreId() {
  console.log('Fixing User.storeId in Neon DB...');
  try {
    await sql`ALTER TABLE "User" ALTER COLUMN "storeId" DROP NOT NULL;`;
    console.log('User.storeId drop not-null succeeded');
  } catch (e) {
    console.log('User.storeId note:', e.message);
  }

  try {
    await sql`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "storeId" TEXT DEFAULT 'store-1';`;
    console.log('User.storeId verified');
  } catch (e) {
    console.log('Error adding storeId column:', e.message);
  }
}

fixUserStoreId();
