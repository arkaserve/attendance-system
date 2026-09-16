import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new DatabaseSync(path.join(__dirname, 'attendance.db'));

db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    class TEXT NOT NULL,
    roll_number TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS lectures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT NOT NULL,
    date TEXT NOT NULL,
    start_time TEXT,
    end_time TEXT,
    topic TEXT
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lecture_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'present',
    marked_at TEXT DEFAULT (datetime('now')),
    UNIQUE(lecture_id, student_id),
    FOREIGN KEY (lecture_id) REFERENCES lectures(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  );
`);

function toDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function seed() {
  const count = db.prepare('SELECT COUNT(*) AS count FROM students').get().count;
  if (count > 0) return;

  const students = [
    ['Riya Verma', 'riya@mail.com', 'Class A', 'R1'],
    ['Arjun Mehta', 'arjun@mail.com', 'Class A', 'R2'],
    ['Sana Khan', 'sana@mail.com', 'Class B', 'S1'],
    ['Karan Singh', 'karan@mail.com', 'Class B', 'S2'],
  ];

  const insertStudent = db.prepare('INSERT INTO students (name, email, class, roll_number) VALUES (?, ?, ?, ?)');
  const studentIds = [];
  for (const student of students) {
    studentIds.push(insertStudent.run(...student).lastInsertRowid);
  }

  const today = new Date();
  const day1 = new Date(today);
  day1.setDate(today.getDate() - 1);
  const day2 = new Date(today);
  day2.setDate(today.getDate() - 2);

  const insertLecture = db.prepare(
    'INSERT INTO lectures (subject, date, start_time, end_time, topic) VALUES (?, ?, ?, ?, ?)'
  );
  const lecture1Id = insertLecture.run('Data Structures', toDateString(day1), '10:00', '11:00', 'Linked Lists').lastInsertRowid;
  const lecture2Id = insertLecture.run('Operating Systems', toDateString(day2), '09:00', '10:00', 'Processes').lastInsertRowid;

  const insertAttendance = db.prepare('INSERT INTO attendance (lecture_id, student_id, status) VALUES (?, ?, ?)');

  insertAttendance.run(lecture1Id, studentIds[0], 'present');
  insertAttendance.run(lecture1Id, studentIds[1], 'absent');
  insertAttendance.run(lecture1Id, studentIds[2], 'present');
  insertAttendance.run(lecture1Id, studentIds[3], 'late');

  insertAttendance.run(lecture2Id, studentIds[0], 'present');
  insertAttendance.run(lecture2Id, studentIds[1], 'present');
  insertAttendance.run(lecture2Id, studentIds[2], 'present');
  insertAttendance.run(lecture2Id, studentIds[3], 'present');
}

seed();

export default db;