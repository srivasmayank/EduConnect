import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  console.log("jjjj",role)
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between">
        <div>
          <Link className="font-bold text-xl" to="/">Learning Platform</Link>
        </div>
        <div className="flex space-x-4">
          <Link to="/" className="hover:text-gray-300">Home</Link>
          <Link to="/courses" className="hover:text-gray-300">Courses</Link>
          <Link to="/search" className="hover:text-gray-300">Search</Link>
          {token ? (
            <>
              <Link to="/profile" className="hover:text-gray-300">Profile</Link>
              {role === 'student' && (
                <Link to="/dashboard" className="hover:text-gray-300">Student Dashboard</Link>
              )}
              {role === 'teacher' && (
                <Link to="/teacher/dashboard" className="hover:text-gray-300">Teacher Dashboard</Link>
              )}
              {role === 'admin' && (
                <Link to="/admin/dashboard" className="hover:text-gray-300">Admin</Link>
              )}
              <button onClick={handleLogout} className="hover:text-gray-300">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-gray-300">Login</Link>
              <Link to="/signup" className="hover:text-gray-300">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
