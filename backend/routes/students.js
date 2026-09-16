import express from 'express';
import db from '../database.js';

const router = express.Router();

router.get('/', (req, res) => {
  const { search, class: className } = req.query;
  const conditions = [];
  const params = [];

  if (search) {
    conditions.push('(name LIKE ? OR email LIKE ? OR roll_number LIKE ?)');
    const like = `%${search}%`;
    params.push(like, like, like);
  }
  if (className) {
    conditions.push('class = ?');
    params.push(className);
  }

  let query = 'SELECT * FROM students';
  if (conditions.length) query += ` WHERE ${conditions.join(' AND ')}`;
  query += ' ORDER BY class, roll_number';

  res.json(db.prepare(query).all(...params));
});

router.get('/:id', (req, res) => {
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

router.post('/', (req, res) => {
  const { name, email, class: className, roll_number } = req.body;
  if (!name || !email || !className || !roll_number) {
    return res.status(400).json({ error: 'Name, email, class, and roll number are required' });
  }

  const dup = db.prepare('SELECT id FROM students WHERE email = ?').get(email);
  if (dup) return res.status(400).json({ error: 'A student with this email already exists' });

  const result = db
    .prepare('INSERT INTO students (name, email, class, roll_number) VALUES (?, ?, ?, ?)')
    .run(name, email, className, roll_number);

  res.status(201).json(db.prepare('SELECT * FROM students WHERE id = ?').get(result.lastInsertRowid));
});

router.put('/:id', (req, res) => {
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const { name, email, class: className, roll_number } = req.body;

  if (email && email !== student.email) {
    const dup = db.prepare('SELECT id FROM students WHERE email = ? AND id != ?').get(email, student.id);
    if (dup) return res.status(400).json({ error: 'A student with this email already exists' });
  }

  db.prepare('UPDATE students SET name = ?, email = ?, class = ?, roll_number = ? WHERE id = ?').run(
    name !== undefined ? name : student.name,
    email !== undefined ? email : student.email,
    className !== undefined ? className : student.class,
    roll_number !== undefined ? roll_number : student.roll_number,
    student.id
  );

  res.json(db.prepare('SELECT * FROM students WHERE id = ?').get(student.id));
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM students WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Student not found' });
  res.json({ message: 'Student deleted' });
});

export default router;