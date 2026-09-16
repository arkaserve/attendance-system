import express from 'express';
import db from './database.js';
import studentsRouter from './routes/students.js';
import lecturesRouter from './routes/lectures.js';
import attendanceRouter from './routes/attendance.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use('/api/students', studentsRouter);
app.use('/api/lectures', lecturesRouter);
app.use('/api/attendance', attendanceRouter);

function toDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

app.get('/api/stats', (req, res) => {
  const today = toDateString(new Date());

  const totalStudents = db.prepare('SELECT COUNT(*) AS count FROM students').get().count;
  const totalLectures = db.prepare('SELECT COUNT(*) AS count FROM lectures').get().count;
  const todayLectureCount = db.prepare('SELECT COUNT(*) AS count FROM lectures WHERE date = ?').get(today).count;

  const todayStatusCount = (status) =>
    db
      .prepare(
        'SELECT COUNT(*) AS count FROM attendance a JOIN lectures l ON a.lecture_id = l.id WHERE l.date = ? AND a.status = ?'
      )
      .get(today, status).count;

  const todayPresent = todayStatusCount('present');
  const todayAbsent = todayStatusCount('absent');
  const todayLate = todayStatusCount('late');

  const perStudent = db
    .prepare(`
      SELECT s.id, s.name, s.class, s.roll_number,
             COUNT(a.id) AS total,
             COALESCE(SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END), 0) AS absent
      FROM students s
      LEFT JOIN attendance a ON a.student_id = s.id
      GROUP BY s.id
      ORDER BY s.class, s.roll_number
    `)
    .all()
    .map((row) => {
      const present = row.total - row.absent;
      const present_percent = row.total > 0 ? Math.round((present / row.total) * 1000) / 10 : 0;
      return {
        id: row.id,
        name: row.name,
        class: row.class,
        roll_number: row.roll_number,
        present,
        absent: row.absent,
        present_percent,
      };
    });

  const lowAttendance = perStudent
    .filter((s) => s.present + s.absent > 0 && s.present_percent < 75)
    .sort((a, b) => a.present_percent - b.present_percent);

  res.json({
    totalStudents,
    totalLectures,
    todayLectureCount,
    todayPresent,
    todayAbsent,
    todayLate,
    lowAttendance,
    perStudent,
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Attendance Tracker backend running on http://localhost:${PORT}`);
});