import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/login', { email, password });
      // Save token and role in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);

      // Save current teacher ID if role is teacher
      if (data.role === 'teacher' && data.userId) {
        localStorage.setItem('currentTeacherId', data.userId);
      }
      if (data.role === 'student' && data.userId) {
        localStorage.setItem('userId', data.userId);
      }
      console.log("mxk",data.role)
      // Navigate based on user role
      if (data.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else if (data.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (data.role === 'student') {
        navigate('/dashboard');
      } else {
        // Fallback route if no matching role is found
        navigate('/');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed, please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-8">
      <h2 className="text-3xl font-semibold mb-4">Login</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input 
          type="email" 
          placeholder="Email" 
          className="w-full p-2 border rounded" 
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input 
          type="password" 
          placeholder="Password" 
          className="w-full p-2 border rounded" 
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Login</button>
      </form>
      <p className="mt-4">
        Don't have an account? <Link className="text-blue-500" to="/signup">Sign Up</Link>
      </p>
    </div>
  );
}

export default LoginPage;
