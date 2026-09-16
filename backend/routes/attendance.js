import express from 'express';
import db from '../database.js';

const router = express.Router();

router.patch('/:id', (req, res) => {
  const record = db.prepare('SELECT * FROM attendance WHERE id = ?').get(req.params.id);
  if (!record) return res.status(404).json({ error: 'Attendance record not found' });

  const { status } = req.body;
  if (!status || !['present', 'absent', 'late'].includes(status)) {
    return res.status(400).json({ error: 'status must be present, absent, or late' });
  }

  db.prepare("UPDATE attendance SET status = ?, marked_at = datetime('now') WHERE id = ?").run(status, record.id);

  res.json(db.prepare('SELECT * FROM attendance WHERE id = ?').get(record.id));
});

export default router;