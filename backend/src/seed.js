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
    const insertClient = db.prepare(
        'INSERT INTO clients (name, phone, email, status) VALUES (?, ?, ?, ?)'
        );
    const oficina = insertClient.run(
        'Oficina Silva',
        '(11) 90000-0001',
        'contato@oficinasilva.com',
        'ativo'
        );
    const comercial = insertClient.run(
        'Comercial Souza',
        '(11) 90000-0002',
        'contato@comercialsouza.com',
        'em_negociacao'
        );
    insertClient.run('Padaria Bom Pao', '(11) 90000-0003', 'contato@padariabompao.com', 'lead');
    console.log('Clientes de exemplo criados.');

const insertInteraction = db.prepare(
    'INSERT INTO client_interactions (client_id, type, note) VALUES (?, ?, ?)'
    );
    insertInteraction.run(
        oficina.lastInsertRowid,
        'whatsapp',
        'Cliente confirmou renovacao do contrato de manutencao.'
        );
    insertInteraction.run(
        comercial.lastInsertRowid,
        'ligacao',
        'Enviada proposta comercial, aguardando retorno.'
        );
    console.log('Interacoes de exemplo criadas.');
}
