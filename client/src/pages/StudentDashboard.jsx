import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    enrolledCourses: [],
    upcomingClasses: [],
    notifications: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // not logged in
      navigate('/login');
      return;
    }
    API.get('/dashboard/student', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching dashboard data:', err);
        setLoading(false);
      });
  }, [navigate]);

  if (loading) return <div className="p-8">Loading dashboard…</div>;

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-semibold">Student Dashboard</h2>

      {/* Enrolled Courses */}
      <section>
        <h3 className="text-2xl font-bold mb-4">Your Enrolled Courses</h3>
        {data.enrolledCourses.length === 0 ? (
          <p>You haven’t enrolled in any courses yet.</p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {data.enrolledCourses.map(course => (
              <div key={course._id} className="border rounded shadow p-4 flex flex-col">
                <img
                  src={course.thumbnail || 'https://via.placeholder.com/300x200'}
                  alt="Course thumbnail"
                  className="w-full h-40 object-cover rounded mb-4"
                />
                <h4 className="font-bold text-lg">{course.title}</h4>
                <p className="text-gray-600 flex-grow">{course.shortDescription}</p>
                <p className="mt-2 text-sm">
                  ⭐ {course.averageRating ? course.averageRating.toFixed(1) : 'No ratings yet'}
                </p>
                <Link
                  to={`/courses/${course._id}`}
                  className="mt-4 bg-blue-500 text-white text-center py-2 rounded hover:bg-blue-600"
                >
                  Go to Course
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Classes (placeholder) */}
      <section>
        <h3 className="text-2xl font-bold mb-4">Upcoming Classes</h3>
        {data.upcomingClasses.length === 0 ? (
          <p>No upcoming classes scheduled.</p>
        ) : (
          <ul className="list-disc ml-6">
            {data.upcomingClasses.map(cls => (
              <li key={cls.id}>
                {cls.title} on {cls.date}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Notifications (placeholder) */}
      <section>
        <h3 className="text-2xl font-bold mb-4">Notifications</h3>
        {data.notifications.length === 0 ? (
          <p>No new notifications.</p>
        ) : (
          <ul className="list-disc ml-6">
            {data.notifications.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
