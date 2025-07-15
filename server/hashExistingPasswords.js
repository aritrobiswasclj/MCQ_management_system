import pool from '../db.js';
import bcrypt from 'bcryptjs';

async function hashPasswords() {
  try {
    const result = await pool.query('SELECT user_id, password FROM users');
    for (const user of result.rows) {
      if (!user.password.startsWith('$2a$')) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await pool.query('UPDATE users SET password = $1 WHERE user_id = $2', [
          hashedPassword,
          user.user_id,
        ]);
        console.log(`Updated password for user_id: ${user.user_id}`);
      }
    }
    console.log('Password hashing complete');
  } catch (err) {
    console.error('Error hashing passwords:', err);
  }
}

hashPasswords();