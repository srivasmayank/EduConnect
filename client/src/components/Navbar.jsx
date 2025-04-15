import React, { use } from 'react';
import { useState, useRef,useEffect } from 'react';
import API from '../api';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef()
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  useEffect(() => {
    function onClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)

  }, [])


  const handleChange = async e => {
    const q = e.target.value
    setQuery(q)
    if (q.trim()) {
      try {
        const res = await API.get('/search', { params: { query: q } })
        setResults(res.data.results || [])
        setShowDropdown(true)
      } catch (err) {
        console.error(err)
        setResults([])
      }
    } else {
      setResults([])
      setShowDropdown(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.get('/search', { params: { query } });
      setResults(res.data.results);
      setShowDropdown(true)
      console.log("results", res.data.results)
    } catch (err) {
      console.error('Search error:', err);
      // setShowDropdown(true)
    }
  }

  console.log("jjjj", role)
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
        <div className="flex space-x-4 items-center">
          {/* <Link to="/search" className="hover:text-gray-300">Search</Link> */}
          <form
            onSubmit={handleSubmit}
            className="relative"
            ref={dropdownRef}
          >
            <input
              type="text"
              value={query}
              onChange={handleChange}
              placeholder="Search courses…"
              className="p-2 rounded-l bg-gray-700 text-white focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-r bg-gray-600 hover:bg-gray-500"
            >
              🔍
            </button>

            {/* Suggestions dropdown */}
            {showDropdown && results.length > 0 && (
              <ul className="absolute right-0 left-0 bg-white text-black mt-1 max-h-60 overflow-auto rounded shadow-lg z-10">
                {results.map(course => (
                  <li
                    key={course.courseId}
                    onClick={() => {
                      navigate(`/courses/${course.courseId}`)
                      setShowDropdown(false)
                    }}
                    className="p-2 hover:bg-gray-200 cursor-pointer"
                  >
                    {course.title}
                  </li>
                ))}
              </ul>
            )}

          </form>
          <Link to="/" className="hover:text-gray-300">Home</Link>
          <Link to="/courses" className="hover:text-gray-300">Courses</Link>

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
