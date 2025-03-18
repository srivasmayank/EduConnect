import React, { useState,useEffect } from 'react';
import API from '../api';
import { Link } from 'react-router-dom';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await API.get('/search', { params: { query } });
      setResults(res.data.results);
      
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  useEffect(() => {
    // Effect logic here
   console.log("chhhuckk",results)
    return () => {
      // Cleanup (optional)
    };
  }, [results]);
  

  return (
    <div className="p-8">
      <h2 className="text-3xl font-semibold mb-4">Search Courses</h2>
      <form onSubmit={handleSearch} className="mb-6">
        <input 
          type="text" 
          placeholder="Enter keywords..." 
          className="w-full p-2 border rounded" 
          value={query}
          onChange={e => setQuery(e.target.value)}
          required
        />
        <button type="submit" className="mt-2 bg-blue-500 text-white p-2 rounded">Search</button>
      </form>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {results.map((course, index) => (
          <div key={index} className="border rounded shadow p-4">
            <h3 className="font-bold text-xl">{course.title}</h3>
            <p className="text-gray-600">{course.shortDescription}</p>
            <Link to={`/courses/${course.courseId}`} className="text-blue-500">View Details</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchPage;
