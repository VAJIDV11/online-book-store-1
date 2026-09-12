const { pool, testConnection } = require('./config/db');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  console.log('🔄 Checking database connection...');
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Could not connect to MySQL. Please verify your .env credentials.');
    process.exit(1);
  }

  try {
    console.log('🔐 Generating fresh bcrypt password hashes...');
    const adminHash = await bcrypt.hash('Admin@12345', 10);
    const userHash = await bcrypt.hash('User@12345', 10);

    // Update or Insert Admin
    await pool.execute(`
      INSERT INTO users (id, full_name, email, password_hash, role, phone, address)
      VALUES (1, 'System Administrator', 'admin@bookstore.com', ?, 'admin', '+1 (555) 019-2834', '100 Tech Hub Blvd, Suite 400, Silicon Valley, CA')
      ON DUPLICATE KEY UPDATE 
        password_hash = VALUES(password_hash),
        role = 'admin'
    `, [adminHash]);

    // Update or Insert Customer
    await pool.execute(`
      INSERT INTO users (id, full_name, email, password_hash, role, phone, address)
      VALUES (2, 'Alex Johnson', 'user@bookstore.com', ?, 'user', '+1 (555) 382-9912', '742 Evergreen Terrace, Springfield, OR')
      ON DUPLICATE KEY UPDATE 
        password_hash = VALUES(password_hash),
        role = 'user'
    `, [userHash]);

    // Fix book image URLs
    await pool.execute(`
      UPDATE books 
      SET cover_image = 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg' 
      WHERE id = 1
    `);

    console.log('✅ Success! Default accounts have been updated in your MySQL database:');
    console.log('   🛡️  Admin:    admin@bookstore.com / Admin@12345');
    console.log('   👤  Customer: user@bookstore.com / User@12345');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating database:', error.message);
    process.exit(1);
  }
}

seedDatabase();
