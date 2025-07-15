import pool from './db.js';
import bcrypt from 'bcryptjs';

async function hashExistingPasswords() {
  try {
    const result = await pool.query('SELECT user_id, password FROM users WHERE password IS NOT NULL');
    const users = result.rows;

    for (const user of users) {
      if (!user.password.startsWith('$2a$')) { // Check if password is unhashed
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await pool.query('UPDATE users SET password = $1 WHERE user_id = $2', [hashedPassword, user.user_id]);
        console.log(`Hashed password for user ${user.user_id}`);
      }
    }
    console.log('Password hashing complete');
    await pool.end();
  } catch (error) {
    console.error('Error hashing passwords:', error);
  }
}

hashExistingPasswords();