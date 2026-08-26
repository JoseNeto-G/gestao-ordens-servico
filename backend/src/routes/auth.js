const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

router.post('/register', (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
          return res.status(400).json({ error: 'Nome, email e senha sao obrigatorios' });
    }

              const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (exists) {
          return res.status(409).json({ error: 'Ja existe um usuario com este email' });
    }

              const hash = bcrypt.hashSync(password, 10);
    const info = db
      .prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)')
      .run(name, email, hash, role || 'tecnico');

              return res.status(201).json({ id: info.lastInsertRowid, name, email, role: role || 'tecnico' });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

              if (!user || !bcrypt.compareSync(password, user.password_hash)) {
                    return res.status(401).json({ error: 'Email ou senha invalidos' });
              }

              const token = jwt.sign(
                { id: user.id, name: user.name, role: user.role },
                    process.env.JWT_SECRET || 'dev-secret',
                { expiresIn: '8h' }
                  );

              return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

module.exports = router;
