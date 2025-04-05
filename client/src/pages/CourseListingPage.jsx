import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';

function CourseListingPage() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    API.get('/courses')
      .then(res => setCourses(res.data.courses))
      .catch(err => console.error('Error fetching courses:', err));
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-3xl font-semibold mb-4">All Courses</h2>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {courses.map(course => (
          <div key={course._id} className="border rounded shadow p-4">
            <img src={course.thumbnail || "https://via.placeholder.com/300x200"} alt="Course Thumbnail" className="w-full h-40 object-cover rounded" />
            <h3 className="mt-2 font-bold text-xl">{course.title}</h3>
            <p className="text-gray-600">{course.shortDescription}</p>
            <Link to={`/courses/${course._id}`} className="text-blue-500 mt-2 inline-block">View Details</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CourseListingPage;
