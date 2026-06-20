const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

// GET /api/messages — list messages (optionally filter by member_id)
router.get('/', (req, res) => {
  try {
    const { member_id } = req.query;
    let query = 'SELECT * FROM messages';
    const params = [];

    if (member_id) {
      query += ' WHERE member_id = ?';
      params.push(member_id);
    }

    query += ' ORDER BY created_at DESC';

    const messages = db.prepare(query).all(...params);
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /api/messages — create a message
router.post('/', (req, res) => {
  try {
    const { member_id, author_name, content } = req.body;

    if (!author_name || !content) {
      return res.status(400).json({ error: 'author_name and content are required' });
    }

    const id = uuidv4();

    db.prepare(`
      INSERT INTO messages (id, member_id, author_name, content)
      VALUES (?, ?, ?, ?)
    `).run(id, member_id || null, author_name, content);

    const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
    res.status(201).json(message);
  } catch (err) {
    console.error('Error creating message:', err);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

// DELETE /api/messages/:id — delete message
router.delete('/:id', (req, res) => {
  try {
    const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    db.prepare('DELETE FROM messages WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

module.exports = router;
