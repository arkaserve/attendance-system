import React, { useEffect, useState } from 'react';
import Toast from '../components/Toast';

const API = '/api';

function Reports() {
  const [stats, setStats] = useState(null);
  const [classes, setClasses] = useState([]);
  const [classFilter, setClassFilter] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetch(`${API}/stats`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setClasses([...new Set(data.perStudent.map((s) => s.class))].sort());
      })
      .catch((err) => showToast('error', err.message));
  }, []);

  if (!stats) return <p>Loading...</p>;

  const rows = classFilter ? stats.perStudent.filter((s) => s.class === classFilter) : stats.perStudent;

  const barClass = (percent) => (percent >= 75 ? 'good' : percent >= 50 ? 'warn' : 'low');
  const badgeClass = (percent) => (percent >= 75 ? 'badge-present' : percent >= 50 ? 'badge-late' : 'badge-absent');

  return (
    <div>
      <div className="page-header">
        <h1>Attendance Reports</h1>
      </div>

      <div className="shop-toolbar">
        <div className="search-bar">
          Showing attendance percentage per student across all lectures (late counts as present).
        </div>
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
              <th>Present</th>
              <th>Absent</th>
              <th>Attendance %</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-state">
                  No students found
                </td>
              </tr>
            )}
            {rows.map((s) => (
              <tr key={s.id}>
                <td>
                  <span className="avatar">{s.name.charAt(0)}</span>
                  <strong>{s.name}</strong>
                </td>
                <td>{s.class}</td>
                <td>{s.roll_number}</td>
                <td>{s.present}</td>
                <td>{s.absent}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="progress-bar" style={{ width: 140 }}>
                      <div className={`progress-fill ${barClass(s.present_percent)}`} style={{ width: `${s.present_percent}%` }} />
                    </div>
                    <span className={`badge ${badgeClass(s.present_percent)}`}>{s.present_percent}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Toast message={toast?.message} type={toast?.type} />
    </div>
  );
}

export default Reports;