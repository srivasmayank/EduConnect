import React, { useState, useEffect } from 'react';
import API from '../api';

function ProfilePage() {
  const [profile, setProfile] = useState({ name: '', email: '', bio: '' });

  useEffect(() => {
    API.get('/auth/profile')
      .then(res => setProfile(res.data))
      .catch(err => console.error('Error fetching profile:', err));
  }, []);

  const handleUpdate = (e) => {
    e.preventDefault();
    alert('Profile update functionality coming soon!');
  };

  return (
    <div className="max-w-lg mx-auto p-8">
      <h2 className="text-3xl font-semibold mb-4">Profile Management</h2>
      <form onSubmit={handleUpdate} className="space-y-4">
        <input 
          type="text" 
          className="w-full p-2 border rounded" 
          value={profile.name}
          onChange={e => setProfile({ ...profile, name: e.target.value })}
          placeholder="Name"
        />
        <input 
          type="email" 
          className="w-full p-2 border rounded" 
          value={profile.email}
          onChange={e => setProfile({ ...profile, email: e.target.value })}
          placeholder="Email"
        />
        <textarea 
          className="w-full p-2 border rounded" 
          value={profile.bio}
          onChange={e => setProfile({ ...profile, bio: e.target.value })}
          placeholder="Bio"
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Update Profile</button>
      </form>
    </div>
  );
}

export default ProfilePage;
