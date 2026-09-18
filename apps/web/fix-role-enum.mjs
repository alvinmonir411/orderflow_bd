import { neon } from '@neondatabase/serverless';

const connStr =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_fVreJN50Kauw@ep-billowing-shadow-a5svvtgn-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require';

const sql = neon(connStr);

async function checkEnum() {
  console.log('Inspecting enum "Role" in PostgreSQL...');
  try {
    const enumVals = await sql`
      SELECT e.enumlabel
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'Role';
    `;
    console.log('Current "Role" enum values:', enumVals.map(r => r.enumlabel));

    // Try adding values to enum if it is an enum
    try {
      await sql`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';`;
      await sql`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'ADMIN';`;
      await sql`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'USER';`;
      console.log('Successfully added values to Role enum');
    } catch (e) {
      console.log('Enum alter note:', e.message);
    }

    // Convert User.role column to TEXT or ensure it accepts TEXT values
    try {
      await sql`ALTER TABLE "User" ALTER COLUMN "role" TYPE TEXT;`;
      console.log('User.role converted to TEXT successfully.');
    } catch (e2) {
      console.log('Role column convert note:', e2.message);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

checkEnum();
