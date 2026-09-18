import { neon } from '@neondatabase/serverless';

const connStr =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_fVreJN50Kauw@ep-billowing-shadow-a5svvtgn-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require';

const sql = neon(connStr);

async function migrate() {
  console.log('⚡ Running database column migration on Neon PostgreSQL...');
  try {
    // 1. Alter all tables to ensure organizationId exists everywhere
    console.log('Altering tables for organizationId...');
    await sql`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "organizationId" TEXT DEFAULT 'org-1';`;
    await sql`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "organizationId" TEXT DEFAULT 'org-1';`;
    await sql`ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "organizationId" TEXT DEFAULT 'org-1';`;
    await sql`ALTER TABLE "ChatMessage" ADD COLUMN IF NOT EXISTS "organizationId" TEXT DEFAULT 'org-1';`;
    await sql`ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "organizationId" TEXT DEFAULT 'org-1';`;
    await sql`ALTER TABLE "BotSettings" ADD COLUMN IF NOT EXISTS "organizationId" TEXT DEFAULT 'org-1';`;
    await sql`ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "organizationId" TEXT DEFAULT 'org-1';`;
    await sql`ALTER TABLE "ConversationTag" ADD COLUMN IF NOT EXISTS "organizationId" TEXT DEFAULT 'org-1';`;
    await sql`ALTER TABLE "InternalNote" ADD COLUMN IF NOT EXISTS "organizationId" TEXT DEFAULT 'org-1';`;
    await sql`ALTER TABLE "ConversationTimeline" ADD COLUMN IF NOT EXISTS "organizationId" TEXT DEFAULT 'org-1';`;
    await sql`ALTER TABLE "ChannelConnection" ADD COLUMN IF NOT EXISTS "organizationId" TEXT DEFAULT 'org-1';`;
    await sql`ALTER TABLE "Tag" ADD COLUMN IF NOT EXISTS "organizationId" TEXT DEFAULT 'org-1';`;

    // 2. Also ensure other optional columns exist
    await sql`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT DEFAULT 'admin123';`;
    await sql`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'USER';`;
    await sql`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatar" TEXT DEFAULT '';`;
    await sql`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT DEFAULT '';`;
    await sql`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "title" TEXT DEFAULT 'Team Member';`;
    await sql`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT TRUE;`;

    // 3. Update existing records with default organizationId 'org-1' if null
    await sql`UPDATE "User" SET "organizationId" = 'org-1' WHERE "organizationId" IS NULL;`;
    await sql`UPDATE "Order" SET "organizationId" = 'org-1' WHERE "organizationId" IS NULL;`;
    await sql`UPDATE "Customer" SET "organizationId" = 'org-1' WHERE "organizationId" IS NULL;`;
    await sql`UPDATE "ChatMessage" SET "organizationId" = 'org-1' WHERE "organizationId" IS NULL;`;

    console.log('✅ Migration successful! All tables updated with organizationId.');
  } catch (err) {
    console.error('❌ Migration Error:', err);
  }
}

migrate();
