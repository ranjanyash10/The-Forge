const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
const dbUrl = process.env.DATABASE_URL || '';

console.log('🔄 Checking database configuration...');
console.log(`🔗 DATABASE_URL: ${dbUrl ? (dbUrl.includes('@') ? '***@' + dbUrl.split('@')[1] : dbUrl) : 'Not set (defaulting to SQLite)'}`);

let schemaContent = fs.readFileSync(schemaPath, 'utf8');

const usePostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');

let updatedContent = schemaContent;

if (usePostgres) {
  console.log('🐘 PostgreSQL detected. Updating schema provider...');
  updatedContent = schemaContent.replace(
    /datasource db \{[\s\S]*?\}/,
    `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`
  );
} else {
  console.log('💾 SQLite configuration active.');
  updatedContent = schemaContent.replace(
    /datasource db \{[\s\S]*?\}/,
    `datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}`
  );
}

if (updatedContent !== schemaContent) {
  fs.writeFileSync(schemaPath, updatedContent, 'utf8');
  console.log('✅ prisma/schema.prisma updated successfully.');
} else {
  console.log('✅ schema.prisma already matches target database type.');
}

console.log('📦 Generating Prisma Client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client generated.');
} catch (error) {
  console.error('❌ Failed to generate Prisma Client:', error.message);
  process.exit(1);
}
