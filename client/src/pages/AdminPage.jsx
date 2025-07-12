import React, { useState } from 'react';
import UserForm from '../components/UserForm.jsx';

export default function AdminPage() {
  const [users, setUsers] = useState([]);

  return (
    <div style={{ padding: '2rem' }}>
      <UserForm
        onCreated={u => setUsers([...users, u])}
      />

      <h3 style={{ marginTop: '2rem' }}>Newly Created Users (session)</h3>
      <ul>
        {users.map(u => (
          <li key={u.user_id}>
            #{u.user_id} – {u.username} ({u.role})
          </li>
        ))}
      </ul>
    </div>
  );
}
