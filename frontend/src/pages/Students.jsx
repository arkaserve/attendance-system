import React, { useEffect, useState } from 'react';
import StudentForm from '../components/StudentForm';
import Toast from '../components/Toast';

const API = '/api';

function Students() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadStudents = (query = '', cls = '') => {
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (cls) params.set('class', cls);
    fetch(`${API}/students?${params.toString()}`)
      .then((res) => res.json())
      .then(setStudents)
      .catch((err) => showToast('error', err.message));
  };

  useEffect(() => {
    fetch(`${API}/students`)
      .then((res) => res.json())
      .then((list) => setClasses([...new Set(list.map((s) => s.class))].sort()))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadStudents(search, classFilter), 300);
    return () => clearTimeout(t);
  }, [search, classFilter]);

  const handleSave = () => {
    loadStudents(search, classFilter);
    setShowModal(false);
    setEditing(null);
  };

  const handleDelete = (id, name) => {
    if (!confirm(`Delete ${name} and their attendance records?`)) return;
    fetch(`${API}/students/${id}`, { method: 'DELETE' })
      .then((res) => res.json())
      .then(() => {
        loadStudents(search, classFilter);
        showToast('success', 'Student deleted');
      })
      .catch((err) => showToast('error', err.message));
  };

  return (
    <div>
      <div className="page-header">
        <h1>Students</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setShowModal(true);
          }}
        >
          + Add Student
        </button>
      </div>

      <div className="shop-toolbar">
        <input
          className="search-bar"
          placeholder="Search by name, email, or roll number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="search-bar" value={classFilter} onChange={(e) => setClassFilter(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Class</th>
              <th>Roll No</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 && (
              <tr>
                <td colSpan={4} className="empty-state">
                  No students found
                </td>
              </tr>
            )}
            {students.map((s) => (
              <tr key={s.id}>
                <td>
                  <span className="avatar">{s.name.charAt(0)}</span>
                  <strong>{s.name}</strong>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{s.email}</div>
                </td>
                <td>{s.class}</td>
                <td>{s.roll_number}</td>
                <td className="actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setEditing(s);
                      setShowModal(true);
                    }}
                  >
                    Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id, s.name)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <StudentForm
          student={editing}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
          }}
          onSave={handleSave}
          onToast={showToast}
        />
      )}

      <Toast message={toast?.message} type={toast?.type} />
    </div>
  );
}

export default Students;