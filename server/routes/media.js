const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

// Configure multer storage by type
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine subfolder from field or mimetype
    let subfolder = 'misc';
    if (file.mimetype.startsWith('image/')) subfolder = 'images';
    else if (file.mimetype.startsWith('video/')) subfolder = 'videos';
    else if (file.mimetype.startsWith('audio/')) subfolder = 'voice';

    const dir = path.join(__dirname, '../uploads', subfolder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.bin';
    cb(null, `media-${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
      'audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/wav', 'audio/mp4',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  },
});

// GET /api/media — list all media
router.get('/', (req, res) => {
  try {
    const { member_id, type } = req.query;
    let query = 'SELECT * FROM media';
    const params = [];
    const conditions = [];

    if (member_id) {
      conditions.push('member_id = ?');
      params.push(member_id);
    }
    if (type) {
      conditions.push('type = ?');
      params.push(type);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const media = db.prepare(query).all(...params);
    res.json(media);
  } catch (err) {
    console.error('Error fetching media:', err);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

// POST /api/media/upload — upload a file
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { member_id, title, description } = req.body;

    // Determine type from mimetype
    let type = 'image';
    if (req.file.mimetype.startsWith('video/')) type = 'video';
    else if (req.file.mimetype.startsWith('audio/')) type = 'voice';

    // Override with explicit type if provided
    if (req.body.type && ['image', 'video', 'voice'].includes(req.body.type)) {
      type = req.body.type;
    }

    const id = uuidv4();

    // Build file path for serving
    let subfolder = 'misc';
    if (req.file.mimetype.startsWith('image/')) subfolder = 'images';
    else if (req.file.mimetype.startsWith('video/')) subfolder = 'videos';
    else if (req.file.mimetype.startsWith('audio/')) subfolder = 'voice';

    const file_path = `/uploads/${subfolder}/${req.file.filename}`;

    db.prepare(`
      INSERT INTO media (id, member_id, type, file_path, title, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, member_id || null, type, file_path, title || null, description || null);

    const media = db.prepare('SELECT * FROM media WHERE id = ?').get(id);
    res.status(201).json(media);
  } catch (err) {
    console.error('Error uploading media:', err);
    res.status(500).json({ error: 'Failed to upload media' });
  }
});

// DELETE /api/media/:id — delete media
router.delete('/:id', (req, res) => {
  try {
    const media = db.prepare('SELECT * FROM media WHERE id = ?').get(req.params.id);
    if (!media) return res.status(404).json({ error: 'Media not found' });

    // Delete file from disk
    const filePath = path.join(__dirname, '..', media.file_path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    db.prepare('DELETE FROM media WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Media deleted' });
  } catch (err) {
    console.error('Error deleting media:', err);
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

module.exports = router;
