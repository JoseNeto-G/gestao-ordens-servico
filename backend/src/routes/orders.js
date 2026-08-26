const express = require('express');
const db = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired);

const STATUSES = ['aberta', 'em_andamento', 'concluida', 'cancelada'];

router.get('/', (req, res) => {
    const { status } = req.query;
    let query = `
        SELECT so.*, c.name as client_name, u.name as assigned_name
            FROM service_orders so
                LEFT JOIN clients c ON c.id = so.client_id
                    LEFT JOIN users u ON u.id = so.assigned_to
                      `;
    const params = [];
    if (status) {
          query += ' WHERE so.status = ?';
          params.push(status);
    }
    query += ' ORDER BY so.created_at DESC';

             res.json(db.prepare(query).all(...params));
});

router.post('/', (req, res) => {
    const { title, description, client_id, assigned_to, priority } = req.body;
    if (!title || !client_id) {
          return res.status(400).json({ error: 'Titulo e cliente sao obrigatorios' });
    }

              const info = db
      .prepare(
              `INSERT INTO service_orders (title, description, client_id, assigned_to, priority)
                     VALUES (?, ?, ?, ?, ?)`
            )
      .run(title, description || null, client_id, assigned_to || null, priority || 'normal');

              res.status(201).json({ id: info.lastInsertRowid });
});

router.patch('/:id/status', (req, res) => {
    const { status } = req.body;
    if (!STATUSES.includes(status)) {
          return res.status(400).json({ error: `Status deve ser um de: ${STATUSES.join(', ')}` });
    }

               db.prepare(`UPDATE service_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(
                     status,
                     req.params.id
                   );

               res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
    db.prepare('DELETE FROM service_orders WHERE id = ?').run(req.params.id);
    res.status(204).end();
});

module.exports = router;
