const express = require('express');
const db = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired);

const CLIENT_STATUSES = ['lead', 'em_negociacao', 'ativo', 'inativo'];
const INTERACTION_TYPES = ['nota', 'ligacao', 'email', 'whatsapp', 'reuniao'];

router.get('/', (req, res) => {
    const { status } = req.query;
    let query = 'SELECT * FROM clients';
    const params = [];
    if (status) {
        query += ' WHERE status = ?';
        params.push(status);
    }
    query += ' ORDER BY name';
    const clients = db.prepare(query).all(...params);
    res.json(clients);
});

// Visao de pipeline: clientes agrupados por status, para o board de CRM.
router.get('/pipeline', (req, res) => {
    const clients = db.prepare('SELECT * FROM clients ORDER BY name').all();
    const pipeline = CLIENT_STATUSES.reduce((acc, status) => {
        acc[status] = clients.filter((c) => c.status === status);
        return acc;
    }, {});
    res.json(pipeline);
});

router.post('/', (req, res) => {
    const { name, phone, email, address, status } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome e obrigatorio' });

            const clientStatus = CLIENT_STATUSES.includes(status) ? status : 'lead';

            const info = db
    .prepare('INSERT INTO clients (name, phone, email, address, status) VALUES (?, ?, ?, ?, ?)')
    .run(name, phone || null, email || null, address || null, clientStatus);

            res.status(201).json({ id: info.lastInsertRowid, name, phone, email, address, status: clientStatus });
});

router.put('/:id', (req, res) => {
    const { name, phone, email, address } = req.body;
    db.prepare('UPDATE clients SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?')
    .run(name, phone, email, address, req.params.id);
    res.json({ ok: true });
});

// Move o cliente entre as etapas do funil (lead -> em negociacao -> ativo / inativo).
router.patch('/:id/status', (req, res) => {
    const { status } = req.body;
    if (!CLIENT_STATUSES.includes(status)) {
        return res.status(400).json({ error: `Status deve ser um de: ${CLIENT_STATUSES.join(', ')}` });
    }
    db.prepare('UPDATE clients SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
    db.prepare('DELETE FROM client_interactions WHERE client_id = ?').run(req.params.id);
    db.prepare('DELETE FROM clients WHERE id = ?').run(req.params.id);
    res.status(204).end();
});

// Historico de interacoes (ligacoes, e-mails, WhatsApp, reunioes, notas) por cliente.
router.get('/:id/interactions', (req, res) => {
    const interactions = db
    .prepare('SELECT ci.*, u.name as created_by_name FROM client_interactions ci LEFT JOIN users u ON u.id = ci.created_by WHERE ci.client_id = ? ORDER BY ci.created_at DESC')
    .all(req.params.id);
    res.json(interactions);
});

router.post('/:id/interactions', (req, res) => {
    const { type, note } = req.body;
    if (!note) return res.status(400).json({ error: 'A nota da interacao e obrigatoria' });

            const interactionType = INTERACTION_TYPES.includes(type) ? type : 'nota';

            const info = db
    .prepare('INSERT INTO client_interactions (client_id, type, note, created_by) VALUES (?, ?, ?, ?)')
    .run(req.params.id, interactionType, note, req.user?.id || null);

            res.status(201).json({ id: info.lastInsertRowid, type: interactionType, note });
});

module.exports = router;
