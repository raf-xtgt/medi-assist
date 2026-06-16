const { Pool } = require('pg');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function generateAuthToken() {
  try {
    const host = process.env.PGHOST;
    const region = process.env.AWS_REGION;
    const username = process.env.PGUSER;

    console.log(`Generating token for: ${username}@${host}`);
    
    const command = `aws rds generate-db-auth-token --hostname ${host} --port 5432 --region ${region} --username ${username}`;
    const token = execSync(command, { 
      encoding: 'utf8',
      env: { ...process.env }
    }).trim();
    return token;
  } catch (error) {
    console.error('Error generating auth token:', error.message);
    throw error;
  }
}

async function runMigration() {
  try {
    console.log('Environment check:');
    console.log(`PGHOST: ${process.env.PGHOST}`);
    console.log(`PGUSER: ${process.env.PGUSER}`);
    console.log(`PGDATABASE: ${process.env.PGDATABASE}`);
    console.log(`AWS_REGION: ${process.env.AWS_REGION}`);
    
    const token = await generateAuthToken();

    const pool = new Pool({
      host: process.env.PGHOST,
      database: process.env.PGDATABASE || 'postgres',
      port: 5432,
      user: process.env.PGUSER || 'postgres',
      password: token,
      ssl: { rejectUnauthorized: false },
      max: 1,
    });

    const sqlFile = path.join(__dirname, 'scripts', '002-create-dbeaver-user.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('🔐 Connected to Aurora PostgreSQL...');
    console.log('Running migration: 002-create-dbeaver-user.sql');
    await pool.query(sql);
    console.log('✅ Migration completed successfully!');
    console.log('\n📝 DBeaver Connection Details:');
    console.log(`Host: ${process.env.PGHOST}`);
    console.log(`Port: 5432`);
    console.log(`Database: ${process.env.PGDATABASE}`);
    console.log(`Username: dbeaver_user`);
    console.log(`Password: DBeaver@Secure2025`);
    console.log(`SSL: Enable SSL (required)`);
    console.log('\n✨ You can now connect to your database via DBeaver using these credentials!');

    await pool.end();
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
