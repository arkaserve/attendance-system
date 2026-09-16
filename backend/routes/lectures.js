import express from 'express';
import db from '../database.js';

const router = express.Router();

function getAttendanceRows(lectureId) {
  return db
    .prepare(`
      SELECT a.id AS id, s.id AS student_id, s.name AS student_name, s.class, s.roll_number,
             COALESCE(a.status, 'present') AS status
      FROM students s
      LEFT JOIN attendance a ON a.student_id = s.id AND a.lecture_id = ?
      ORDER BY s.class, s.roll_number
    `)
    .all(lectureId);
}

router.get('/', (req, res) => {
  const { date, subject, from, to } = req.query;
  const conditions = [];
  const params = [];

  if (date) {
    conditions.push('l.date = ?');
    params.push(date);
  }
  if (subject) {
    conditions.push('l.subject LIKE ?');
    params.push(`%${subject}%`);
  }
  if (from) {
    conditions.push('l.date >= ?');
    params.push(from);
  }
  if (to) {
    conditions.push('l.date <= ?');
    params.push(to);
  }

  let query = `
    SELECT l.*,
           COALESCE(SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END), 0) AS present_count,
           COALESCE(SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END), 0) AS absent_count,
           COALESCE(SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END), 0) AS late_count
    FROM lectures l
    LEFT JOIN attendance a ON a.lecture_id = l.id
  `;
  if (conditions.length) query += ` WHERE ${conditions.join(' AND ')}`;
  query += ' GROUP BY l.id ORDER BY l.date DESC, l.id DESC';

  res.json(db.prepare(query).all(...params));
});

router.get('/:id/attendance', (req, res) => {
  const lecture = db.prepare('SELECT * FROM lectures WHERE id = ?').get(req.params.id);
  if (!lecture) return res.status(404).json({ error: 'Lecture not found' });
  res.json({ lecture, rows: getAttendanceRows(lecture.id) });
});

router.post('/:id/attendance', (req, res) => {
  const lecture = db.prepare('SELECT * FROM lectures WHERE id = ?').get(req.params.id);
  if (!lecture) return res.status(404).json({ error: 'Lecture not found' });

  const { rows } = req.body;
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: 'rows must be a non-empty array' });
  }

  const validStatuses = ['present', 'absent', 'late'];
  const upsert = db.prepare(`
    INSERT INTO attendance (lecture_id, student_id, status)
    VALUES (?, ?, ?)
    ON CONFLICT(lecture_id, student_id) DO UPDATE SET
      status = excluded.status,
      marked_at = datetime('now')
  `);

  for (const row of rows) {
    if (!row.student_id || !validStatuses.includes(row.status)) {
      return res.status(400).json({ error: 'Each row needs a valid student_id and status' });
    }
    const student = db.prepare('SELECT id FROM students WHERE id = ?').get(row.student_id);
    if (!student) return res.status(400).json({ error: `Student ${row.student_id} not found` });
    upsert.run(lecture.id, row.student_id, row.status);
  }

  res.json({ lecture, rows: getAttendanceRows(lecture.id) });
});

router.get('/:id', (req, res) => {
  const lecture = db.prepare('SELECT * FROM lectures WHERE id = ?').get(req.params.id);
  if (!lecture) return res.status(404).json({ error: 'Lecture not found' });

  const present = db.prepare("SELECT COUNT(*) AS count FROM attendance WHERE lecture_id = ? AND status = 'present'").get(lecture.id).count;
  const absent = db.prepare("SELECT COUNT(*) AS count FROM attendance WHERE lecture_id = ? AND status = 'absent'").get(lecture.id).count;
  const late = db.prepare("SELECT COUNT(*) AS count FROM attendance WHERE lecture_id = ? AND status = 'late'").get(lecture.id).count;

  res.json({ ...lecture, present_count: present, absent_count: absent, late_count: late });
});

router.post('/', (req, res) => {
  const { subject, date, start_time, end_time, topic } = req.body;
  if (!subject || !date) return res.status(400).json({ error: 'Subject and date are required' });

  const result = db
    .prepare('INSERT INTO lectures (subject, date, start_time, end_time, topic) VALUES (?, ?, ?, ?, ?)')
    .run(subject, date, start_time || null, end_time || null, topic || null);

  res.status(201).json(db.prepare('SELECT * FROM lectures WHERE id = ?').get(result.lastInsertRowid));
});

router.put('/:id', (req, res) => {
  const lecture = db.prepare('SELECT * FROM lectures WHERE id = ?').get(req.params.id);
  if (!lecture) return res.status(404).json({ error: 'Lecture not found' });

  const { subject, date, start_time, end_time, topic } = req.body;

  db.prepare('UPDATE lectures SET subject = ?, date = ?, start_time = ?, end_time = ?, topic = ? WHERE id = ?').run(
    subject !== undefined ? subject : lecture.subject,
    date !== undefined ? date : lecture.date,
    start_time !== undefined ? start_time : lecture.start_time,
    end_time !== undefined ? end_time : lecture.end_time,
    topic !== undefined ? topic : lecture.topic,
    lecture.id
  );

  res.json(db.prepare('SELECT * FROM lectures WHERE id = ?').get(lecture.id));
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM lectures WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Lecture not found' });
  res.json({ message: 'Lecture deleted' });
});

export default router;