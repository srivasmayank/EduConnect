import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';

function TeacherDashboard() {
  // Retrieve the teacher's ID from localStorage
  const teacherId = localStorage.getItem('currentTeacherId');
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [metrics, setMetrics] = useState({
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teacherId) {
      // If teacherId is not available, redirect to login or show an error
      console.error('No teacher ID found. Please log in as a teacher.');
      navigate('/login');
      return;
    }

    API.get('/courses', { params: { teacherId } })
      .then(res => {
        const teacherCourses = res.data.courses || [];
        setCourses(teacherCourses);
        let totalEnrollments = 0;
        teacherCourses.forEach(course => {
          // Use enrollmentCount if provided; otherwise, simulate
          totalEnrollments += course.enrollmentCount || Math.floor(Math.random() * 50);
        });
        const totalRevenue = totalEnrollments * 20;
        setMetrics({
          totalCourses: teacherCourses.length,
          totalEnrollments,
          totalRevenue
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching teacher courses:', err);
        setLoading(false);
      });
  }, [teacherId, navigate]);

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold">Teacher Dashboard</h2>
        {/* Button to navigate to create course page */}
        <Link 
          to="/teacher/create-course" 
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Create Course
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-white shadow rounded">
          <h3 className="text-xl font-bold">Total Courses</h3>
          <p className="text-3xl">{metrics.totalCourses}</p>
        </div>
        <div className="p-6 bg-white shadow rounded">
          <h3 className="text-xl font-bold">Total Enrollments</h3>
          <p className="text-3xl">{metrics.totalEnrollments}</p>
        </div>
        <div className="p-6 bg-white shadow rounded">
          <h3 className="text-xl font-bold">Total Revenue</h3>
          <p className="text-3xl">${metrics.totalRevenue}</p>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold mb-4">Your Courses</h3>
        {courses.length === 0 ? (
          <p>No courses found. Create a new course!</p>
        ) : (
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
            {courses.map(course => (
              <div key={course._id} className="border rounded shadow p-4">
                <img 
                  src={course.thumbnail || "https://via.placeholder.com/300x200"} 
                  alt="Course Thumbnail" 
                  className="w-full h-40 object-cover rounded" 
                />
                <h4 className="mt-2 font-bold text-xl">{course.title}</h4>
                <p className="text-gray-600">{course.shortDescription}</p>
                <p className="text-gray-600">
                  Average Rating: {course.averageRating ? course.averageRating.toFixed(1) : 'N/A'}
                </p>
                <Link to={`/courses/${course._id}`} className="text-blue-500 mt-2 inline-block">
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherDashboard;
