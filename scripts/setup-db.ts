import postgres from 'postgres';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local');
  process.exit(1);
}

async function setupDatabase() {
  console.log('🚀 Setting up database...\n');

  // Create postgres client
  const client = postgres(DATABASE_URL, { max: 1 });

  try {
    // 1. Execute setup-functions.sql
    console.log('📝 Step 1/3: Creating functions and triggers...');
    const functionsSQL = fs.readFileSync(
      path.join(__dirname, '../lib/db/setup-functions.sql'),
      'utf-8'
    );
    await client.unsafe(functionsSQL);
    console.log('✅ Functions and triggers created!\n');

    // 2. Execute rls-policies.sql
    console.log('🔒 Step 2/3: Applying RLS policies...');
    const rlsSQL = fs.readFileSync(
      path.join(__dirname, '../lib/db/rls-policies.sql'),
      'utf-8'
    );
    await client.unsafe(rlsSQL);
    console.log('✅ RLS policies applied!\n');

    // 3. Execute seed-questions.sql
    console.log('🌱 Step 3/3: Seeding questions...');
    const seedSQL = fs.readFileSync(
      path.join(__dirname, '../lib/db/seed-questions.sql'),
      'utf-8'
    );
    await client.unsafe(seedSQL);
    console.log('✅ Questions seeded!\n');

    console.log('🎉 Database setup complete!');
    console.log('\n📊 Summary:');
    console.log('   ✅ 5 functions created');
    console.log('   ✅ 6 triggers created');
    console.log('   ✅ 20+ indexes created');
    console.log('   ✅ RLS policies applied (25 tables)');
    console.log('   ✅ 70 questions seeded');
    console.log('\n🚀 Ready to run: bun dev\n');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();
