import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';

const API = '/api';

function MarkAttendance() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lecture, setLecture] = useState(null);
  const [rows, setRows] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetch(`${API}/lectures/${id}/attendance`)
      .then((res) => res.json())
      .then((data) => {
        setLecture(data.lecture);
        setRows(data.rows);
        const map = {};
        data.rows.forEach((r) => {
          map[r.student_id] = r.status;
        });
        setStatuses(map);
      })
      .catch((err) => showToast('error', err.message));
  }, [id]);

  const setStatus = (studentId, status) => {
    setStatuses({ ...statuses, [studentId]: status });
  };

  const handleSave = () => {
    setSaving(true);
    fetch(`${API}/lectures/${id}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rows: rows.map((r) => ({ student_id: r.student_id, status: statuses[r.student_id] })),
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save attendance');
        setRows(data.rows);
        const map = {};
        data.rows.forEach((r) => {
          map[r.student_id] = r.status;
        });
        setStatuses(map);
        showToast('success', 'Attendance saved');
        setSaving(false);
      })
      .catch((err) => {
        showToast('error', err.message);
        setSaving(false);
      });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Mark Attendance</h1>
          {lecture && (
            <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>
              {lecture.subject} · {lecture.date}
              {lecture.topic ? ` · ${lecture.topic}` : ''}
            </p>
          )}
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/lectures')}>
          ← Back to Lectures
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Class</th>
              <th>Roll No</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="empty-state">
                  No students registered yet
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.student_id}>
                <td>
                  <span className="avatar">{r.student_name.charAt(0)}</span>
                  <strong>{r.student_name}</strong>
                </td>
                <td>{r.class}</td>
                <td>{r.roll_number}</td>
                <td>
                  <div className="present-toggle">
                    <button
                      className={statuses[r.student_id] === 'present' ? 'selected-present' : ''}
                      onClick={() => setStatus(r.student_id, 'present')}
                    >
                      Present
                    </button>
                    <button
                      className={statuses[r.student_id] === 'absent' ? 'selected-absent' : ''}
                      onClick={() => setStatus(r.student_id, 'absent')}
                    >
                      Absent
                    </button>
                    <button
                      className={statuses[r.student_id] === 'late' ? 'selected-late' : ''}
                      onClick={() => setStatus(r.student_id, 'late')}
                    >
                      Late
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="modal-actions">
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Attendance'}
        </button>
      </div>

      <Toast message={toast?.message} type={toast?.type} />
    </div>
  );
}

export default MarkAttendance;