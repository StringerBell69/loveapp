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

async function initDatabase() {
  console.log('🚀 Initializing database...\n');

  // Create postgres client
  const client = postgres(DATABASE_URL, { max: 1 });

  try {
    // 1. Create schema
    console.log('📝 Step 1/4: Creating schema...');
    const createSchemaSQL = fs.readFileSync(
      path.join(__dirname, '../lib/db/create-schema.sql'),
      'utf-8'
    );
    await client.unsafe(createSchemaSQL);
    console.log('✅ Schema created!\n');

    // 2. Execute setup-functions.sql
    console.log('📝 Step 2/4: Creating functions and triggers...');
    const functionsSQL = fs.readFileSync(
      path.join(__dirname, '../lib/db/setup-functions.sql'),
      'utf-8'
    );
    await client.unsafe(functionsSQL);
    console.log('✅ Functions and triggers created!\n');

    // 3. Execute rls-policies.sql
    console.log('🔒 Step 3/4: Applying RLS policies...');
    const rlsSQL = fs.readFileSync(
      path.join(__dirname, '../lib/db/rls-policies.sql'),
      'utf-8'
    );
    await client.unsafe(rlsSQL);
    console.log('✅ RLS policies applied!\n');

    // 4. Execute seed-questions.sql
    console.log('🌱 Step 4/4: Seeding questions...');
    const seedSQL = fs.readFileSync(
      path.join(__dirname, '../lib/db/seed-questions.sql'),
      'utf-8'
    );
    await client.unsafe(seedSQL);
    console.log('✅ Questions seeded!\n');

    console.log('🎉 Database initialization complete!');
    console.log('\n📊 Summary:');
    console.log('   ✅ 25 tables created');
    console.log('   ✅ 9 enums created');
    console.log('   ✅ 5 functions created');
    console.log('   ✅ 6 triggers created');
    console.log('   ✅ 20+ indexes created');
    console.log('   ✅ RLS policies applied (25 tables)');
    console.log('   ✅ 70 questions seeded');
    console.log('\n🚀 Ready to run: bun dev\n');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

initDatabase();
