const express = require('express');
const db = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired);

router.get('/', (req, res) => {
    const clients = db.prepare('SELECT * FROM clients ORDER BY name').all();
    res.json(clients);
});

router.post('/', (req, res) => {
    const { name, phone, email, address } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome e obrigatorio' });

              const info = db
      .prepare('INSERT INTO clients (name, phone, email, address) VALUES (?, ?, ?, ?)')
      .run(name, phone || null, email || null, address || null);

              res.status(201).json({ id: info.lastInsertRowid, name, phone, email, address });
});

router.put('/:id', (req, res) => {
    const { name, phone, email, address } = req.body;
    db.prepare('UPDATE clients SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?')
      .run(name, phone, email, address, req.params.id);
    res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
    db.prepare('DELETE FROM clients WHERE id = ?').run(req.params.id);
    res.status(204).end();
});

module.exports = router;
