import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auth/signup', { email, password, role, name });
      navigate('/login');
    } catch (error) {
      console.error('Signup failed:', error);
      alert('Signup failed, please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-8">
      <h2 className="text-3xl font-semibold mb-4">Sign Up</h2>
      <form onSubmit={handleSignup} className="space-y-4">
        <input 
          type="text" 
          placeholder="Full Name" 
          className="w-full p-2 border rounded" 
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
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
        <div className="flex space-x-4">
          <button 
            type="button" 
            className={`py-2 px-4 rounded ${role === 'student' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setRole('student')}
          >
            Student
          </button>
          <button 
            type="button" 
            className={`py-2 px-4 rounded ${role === 'teacher' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setRole('teacher')}
          >
            Teacher
          </button>
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Sign Up</button>
      </form>
      <p className="mt-4">Already have an account? <Link className="text-blue-500" to="/login">Login</Link></p>
    </div>
  );
}

export default SignupPage;
