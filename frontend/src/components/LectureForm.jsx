import React, { useState } from 'react';

const API = '/api';

function LectureForm({ lecture, onClose, onSave, onToast }) {
  const [form, setForm] = useState({
    subject: lecture?.subject || '',
    date: lecture?.date || '',
    start_time: lecture?.start_time || '',
    end_time: lecture?.end_time || '',
    topic: lecture?.topic || '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);

    const url = lecture ? `${API}/lectures/${lecture.id}` : `${API}/lectures`;
    const method = lecture ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save lecture');
        onToast('success', lecture ? 'Lecture updated' : 'Lecture added');
        onSave();
      })
      .catch((err) => {
        onToast('error', err.message);
        setSaving(false);
      });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{lecture ? 'Edit Lecture' : 'Add Lecture'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Subject *</label>
            <input name="subject" placeholder="e.g. Data Structures" value={form.subject} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input name="date" type="date" value={form.date} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Topic</label>
              <input name="topic" placeholder="e.g. Linked Lists" value={form.topic} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Time</label>
              <input name="start_time" type="time" value={form.start_time} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input name="end_time" type="time" value={form.end_time} onChange={handleChange} />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LectureForm;