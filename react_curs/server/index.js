const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DB_PATH = path.join(__dirname, 'db.json');

function readDb() {
  try {
    if (!fs.existsSync(DB_PATH)) return { users: {} };
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw || '{"users":{}}');
  } catch (e) {
    console.error('Read DB error', e);
    return { users: {} };
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Write DB error', e);
  }
}

// Получить пользователя по email
app.get('/api/users/:email', (req, res) => {
  const db = readDb();
  const email = req.params.email;
  const u = db.users[email];
  if (!u) return res.status(404).json({ error: 'Not found' });
  res.json(u);
});

// Сохранить или обновить пользователя (по email)
app.post('/api/users', (req, res) => {
  const payload = req.body;
  if (!payload || !payload.email) return res.status(400).json({ error: 'Missing email' });
  const db = readDb();
  db.users = db.users || {};
  db.users[payload.email] = payload;
  writeDb(db);
  res.json({ ok: true });
});

const port = process.env.PORT || 5050;
app.listen(port, () => console.log(`Backend running on http://localhost:${port}`));
