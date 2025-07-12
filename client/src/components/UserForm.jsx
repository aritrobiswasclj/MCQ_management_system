import React, { useState } from 'react';
import axios from 'axios';

export default function UserForm({ onCreated }) {
  const [form, setForm] = useState({
    username: '',
    password: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'student',
  });
  const [msg, setMsg] = useState('');

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg('Saving…');
    try {
      const res = await axios.post('http://localhost:3000/api/users', form);
      setMsg(`✅ Created user #${res.data.user_id}`);
      onCreated && onCreated(res.data);
      setForm({ ...form, password: '' });
    } catch (err) {
      console.error(err);
      setMsg(err.response?.data?.error || 'Error');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
      <h2>Create User</h2>

      {['username', 'password', 'email', 'first_name', 'last_name'].map(f => (
        <div key={f} style={{ marginBottom: 8 }}>
          <input
            type={f === 'password' ? 'password' : 'text'}
            name={f}
            placeholder={f.replace('_', ' ')}
            value={form[f]}
            onChange={handleChange}
            required={['username', 'password', 'email'].includes(f)}
            style={{ width: '100%', padding: 6 }}
          />
        </div>
      ))}

      <select
        name="role"
        value={form.role}
        onChange={handleChange}
        style={{ marginBottom: 12, padding: 6, width: '100%' }}
      >
        <option value="student">student</option>
        <option value="teacher">teacher</option>
        <option value="admin">admin</option>
      </select>

      <button style={{ padding: '8px 16px' }}>Create</button>
      {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
    </form>
  );
}
