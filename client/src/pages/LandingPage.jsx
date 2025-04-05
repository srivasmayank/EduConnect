import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="text-center py-16">
      <h1 className="text-5xl font-bold mb-6">Welcome to Your Learning Journey</h1>
      <p className="text-xl mb-8">Explore top courses, join live classes, and track your progress seamlessly.</p>
      <div className="space-x-4">
        <Link to="/courses" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">Browse Courses</Link>
        <Link to="/signup" className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded">Get Started</Link>
      </div>
    </div>
  );
}

export default LandingPage;
