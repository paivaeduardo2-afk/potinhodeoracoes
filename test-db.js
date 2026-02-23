import db from './db.js';
console.log('Database test...');
try {
  const row = db.prepare('SELECT 1 as test').get();
  console.log('Database OK:', row);
} catch (e) {
  console.error('Database Error:', e);
}
process.exit(0);
