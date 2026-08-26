require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

const email = 'admin@exemplo.com';
const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);

if (!exists) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run(
          'Administrador',
          email,
          hash,
          'admin'
        );
    console.log('Usuario admin criado: admin@exemplo.com / admin123');
} else {
    console.log('Usuario admin ja existe.');
}

const clientCount = db.prepare('SELECT COUNT(*) as c FROM clients').get().c;
if (clientCount === 0) {
    const insertClient = db.prepare('INSERT INTO clients (name, phone, email) VALUES (?, ?, ?)');
    insertClient.run('Oficina Silva', '(11) 90000-0001', 'contato@oficinasilva.com');
    insertClient.run('Comercial Souza', '(11) 90000-0002', 'contato@comercialsouza.com');
    console.log('Clientes de exemplo criados.');
}
