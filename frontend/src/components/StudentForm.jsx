import React, { useState } from 'react';

const API = '/api';

function StudentForm({ student, onClose, onSave, onToast }) {
  const [form, setForm] = useState({
    name: student?.name || '',
    email: student?.email || '',
    class: student?.class || '',
    roll_number: student?.roll_number || '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);

    const url = student ? `${API}/students/${student.id}` : `${API}/students`;
    const method = student ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save student');
        onToast('success', student ? 'Student updated' : 'Student added');
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
        <h2>{student ? 'Edit Student' : 'Add Student'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name *</label>
            <input name="name" placeholder="e.g. Riya Verma" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input name="email" type="email" placeholder="e.g. riya@mail.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Class *</label>
              <input name="class" placeholder="e.g. Class A" value={form.class} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Roll Number *</label>
              <input name="roll_number" placeholder="e.g. R1" value={form.roll_number} onChange={handleChange} required />
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

export default StudentForm;