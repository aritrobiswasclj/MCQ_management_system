import React, { useState } from 'react';

// UserForm Component
function UserForm({ onCreated }) {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    const newUser = {
      user_id: Date.now(),
      username: username.trim(),
      role
    };
    onCreated(newUser);
    setUsername('');
    setRole('user');
    setError('');
  };

  return (
    <div className="bg-dark-card shadow-xl rounded-lg p-6 max-w-md w-full">
      <h2 className="text-2xl font-semibold text-gray-100 mb-6">Create New User</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-900/50 text-soft-red rounded-md">
          {error}
        </div>
      )}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full p-2 bg-dark-accent border border-gray-600 rounded-md focus:ring-2 focus:ring-soft-blue focus:border-soft-blue text-gray-100 placeholder-gray-500"
            placeholder="Enter username"
          />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-300">
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 w-full p-2 bg-dark-accent border border-gray-600 rounded-md focus:ring-2 focus:ring-soft-blue focus:border-soft-blue text-gray-100"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-soft-blue text-white py-2 px-4 rounded-md hover:bg-blue-500 transition-colors"
        >
          Create User
        </button>
      </form>
    </div>
  );
}

// AdminPage Component
function AdminPage() {
  const [users, setUsers] = useState([]);

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-100 mb-8 text-center">
          Admin Dashboard
        </h1>
        <div className="mb-8 flex justify-center">
          <UserForm
            onCreated={(u) => setUsers([...users, u])}
          />
        </div>
        <div className="bg-dark-card shadow-xl rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-100 mb-4">
            Newly Created Users (Session)
          </h3>
          {users.length === 0 ? (
            <p className="text-gray-400">No users created yet.</p>
          ) : (
            <ul className="space-y-3">
              {users.map((u) => (
                <li
                  key={u.user_id}
                  className="flex items-center justify-between p-3 bg-dark-accent rounded-md hover:bg-gray-600 transition-colors"
                >
                  <span className="text-gray-200">
                    #{u.user_id} – {u.username} (
                    <span className="capitalize">{u.role}</span>)
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    u.role === 'admin' ? 'bg-red-900/50 text-soft-red' :
                    u.role === 'editor' ? 'bg-yellow-900/50 text-soft-yellow' :
                    'bg-green-900/50 text-soft-green'
                  }`}>
                    {u.role}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
