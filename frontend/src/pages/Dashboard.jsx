import React, { useEffect, useState } from 'react';

const API = '/api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentLectures, setRecentLectures] = useState([]);

  useEffect(() => {
    fetch(`${API}/stats`)
      .then((res) => res.json())
      .then(setStats)
      .catch(console.error);

    fetch(`${API}/lectures`)
      .then((res) => res.json())
      .then((list) => setRecentLectures(list.slice(0, 4)))
      .catch(console.error);
  }, []);

  if (!stats) return <p>Loading...</p>;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalStudents}</div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalLectures}</div>
          <div className="stat-label">Total Lectures</div>
        </div>
        <div className="stat-card green">
          <div className="stat-value">{stats.todayLectureCount}</div>
          <div className="stat-label">Today's Lectures</div>
        </div>
        <div className="stat-card green">
          <div className="stat-value">{stats.todayPresent}</div>
          <div className="stat-label">Present Today</div>
        </div>
        <div className="stat-card red">
          <div className="stat-value">{stats.todayAbsent}</div>
          <div className="stat-label">Absent Today</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-value">{stats.todayLate}</div>
          <div className="stat-label">Late Today</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Low Attendance Warnings (&lt; 75%)</h3>
        {stats.lowAttendance.length === 0 ? (
          <div className="empty-state">No students below the attendance threshold</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Roll</th>
                  <th>Present</th>
                  <th>Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {stats.lowAttendance.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.class}</td>
                    <td>{s.roll_number}</td>
                    <td>{s.present}</td>
                    <td>
                      <span className={`badge ${s.present_percent < 50 ? 'badge-absent' : 'badge-late'}`}>
                        {s.present_percent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Recent Lectures</h3>
        {recentLectures.length === 0 ? (
          <div className="empty-state">No lectures yet</div>
        ) : (
          <div className="cards-grid">
            {recentLectures.map((l) => (
              <div className="job-card" key={l.id}>
                <div className="job-title">{l.subject}</div>
                <div className="company">{l.topic || l.date}</div>
                <div className="job-meta">
                  <span className="chip">{l.date}</span>
                  {l.start_time && <span className="chip">{l.start_time} · {l.end_time || ''}</span>}
                </div>
                <div className="job-footer">
                  <span className="badge badge-present">{l.present_count} present</span>
                  <span className="badge badge-absent">{l.absent_count} absent</span>
                  <span className="badge badge-late">{l.late_count} late</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;