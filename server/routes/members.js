const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/photos');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `photo-${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);
    if (extOk && mimeOk) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for profile photos'));
    }
  },
});

// GET /api/members — list all members
router.get('/', (req, res) => {
  try {
    const members = db.prepare('SELECT * FROM members ORDER BY name ASC').all();
    res.json(members);
  } catch (err) {
    console.error('Error fetching members:', err);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// GET /api/members/:id — get one member
router.get('/:id', (req, res) => {
  try {
    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.json(member);
  } catch (err) {
    console.error('Error fetching member:', err);
    res.status(500).json({ error: 'Failed to fetch member' });
  }
});

// POST /api/members — create member
router.post('/', upload.single('photo'), (req, res) => {
  try {
    const { name, birthdate, relationship, bio } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const id = uuidv4();
    const photo_path = req.file ? `/uploads/photos/${req.file.filename}` : null;

    db.prepare(`
      INSERT INTO members (id, name, birthdate, relationship, bio, photo_path)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, name, birthdate || null, relationship || null, bio || null, photo_path);

    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(id);
    res.status(201).json(member);
  } catch (err) {
    console.error('Error creating member:', err);
    res.status(500).json({ error: 'Failed to create member' });
  }
});

// PUT /api/members/:id — update member
router.put('/:id', upload.single('photo'), (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Member not found' });

    const { name, birthdate, relationship, bio } = req.body;
    let photo_path = existing.photo_path;

    if (req.file) {
      // Remove old photo if exists
      if (existing.photo_path) {
        const oldPath = path.join(__dirname, '..', existing.photo_path);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      photo_path = `/uploads/photos/${req.file.filename}`;
    }

    db.prepare(`
      UPDATE members
      SET name = ?, birthdate = ?, relationship = ?, bio = ?, photo_path = ?
      WHERE id = ?
    `).run(
      name || existing.name,
      birthdate !== undefined ? birthdate : existing.birthdate,
      relationship !== undefined ? relationship : existing.relationship,
      bio !== undefined ? bio : existing.bio,
      photo_path,
      req.params.id
    );

    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
    res.json(member);
  } catch (err) {
    console.error('Error updating member:', err);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// DELETE /api/members/:id — delete member
router.delete('/:id', (req, res) => {
  try {
    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    // Remove photo file if exists
    if (member.photo_path) {
      const photoPath = path.join(__dirname, '..', member.photo_path);
      if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
    }

    db.prepare('DELETE FROM members WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Member deleted' });
  } catch (err) {
    console.error('Error deleting member:', err);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

module.exports = router;
