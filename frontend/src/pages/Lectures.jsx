import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LectureForm from '../components/LectureForm';
import Toast from '../components/Toast';

const API = '/api';

function Lectures() {
  const navigate = useNavigate();
  const [lectures, setLectures] = useState([]);
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadLectures = (subj = '', d = '') => {
    const params = new URLSearchParams();
    if (subj) params.set('subject', subj);
    if (d) params.set('date', d);
    fetch(`${API}/lectures?${params.toString()}`)
      .then((res) => res.json())
      .then(setLectures)
      .catch((err) => showToast('error', err.message));
  };

  useEffect(() => {
    loadLectures();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadLectures(subject, date), 300);
    return () => clearTimeout(t);
  }, [subject, date]);

  const handleSave = () => {
    loadLectures(subject, date);
    setShowModal(false);
    setEditing(null);
  };

  const handleDelete = (id, subjectName) => {
    if (!confirm(`Delete the "${subjectName}" lecture and its attendance records?`)) return;
    fetch(`${API}/lectures/${id}`, { method: 'DELETE' })
      .then((res) => res.json())
      .then(() => {
        loadLectures(subject, date);
        showToast('success', 'Lecture deleted');
      })
      .catch((err) => showToast('error', err.message));
  };

  return (
    <div>
      <div className="page-header">
        <h1>Lectures</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setShowModal(true);
          }}
        >
          + Add Lecture
        </button>
      </div>

      <div className="shop-toolbar">
        <input
          className="search-bar"
          placeholder="Search by subject..."
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <input
          className="search-bar"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ maxWidth: 200 }}
        />
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Lecture</th>
              <th>Date</th>
              <th>Time</th>
              <th>Attendance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lectures.length === 0 && (
              <tr>
                <td colSpan={5} className="empty-state">
                  No lectures found
                </td>
              </tr>
            )}
            {lectures.map((l) => (
              <tr key={l.id}>
                <td>
                  <strong>{l.subject}</strong>
                  {l.topic && <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{l.topic}</div>}
                </td>
                <td>{l.date}</td>
                <td>{l.start_time ? `${l.start_time} - ${l.end_time || ''}` : '—'}</td>
                <td>
                  <span className="badge badge-present">{l.present_count} P</span>{' '}
                  <span className="badge badge-absent">{l.absent_count} A</span>{' '}
                  <span className="badge badge-late">{l.late_count} L</span>
                </td>
                <td className="actions">
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => navigate(`/lectures/${l.id}/attendance`)}
                  >
                    Mark Attendance
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setEditing(l);
                      setShowModal(true);
                    }}
                  >
                    Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(l.id, l.subject)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <LectureForm
          lecture={editing}
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

export default Lectures;