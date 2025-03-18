import React, { useEffect, useState } from 'react';
import API from '../api';

function ManageUsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    API.get('/admin/users')
      .then(res => setUsers(res.data.users))
      .catch(err => console.error('Error fetching users:', err));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/admin/users/${id}`, { status });
      setUsers(users.map(user => user._id === id ? { ...user, status } : user));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-semibold mb-4">Manage Users</h2>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2 border">Email</th>
            <th className="px-4 py-2 border">Role</th>
            <th className="px-4 py-2 border">Status</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td className="px-4 py-2 border">{user.email}</td>
              <td className="px-4 py-2 border">{user.role}</td>
              <td className="px-4 py-2 border">{user.status}</td>
              <td className="px-4 py-2 border">
                <button onClick={() => updateStatus(user._id, 'approved')} className="bg-green-500 text-white px-2 py-1 rounded mr-2">Approve</button>
                <button onClick={() => updateStatus(user._id, 'banned')} className="bg-red-500 text-white px-2 py-1 rounded">Ban</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageUsersPage;
