import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';

function StudentDashboard() {
  const [data, setData] = useState({
    enrolledCourses: [],
    upcomingClasses: [],
    notifications: []
  });

  useEffect(() => {
    API.get('/dashboard/student')
      .then(res => setData(res.data))
      .catch(err => console.error('Error fetching dashboard data:', err));
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-3xl font-semibold mb-4">Student Dashboard</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 border rounded">
          <h3 className="font-bold mb-2">Enrolled Courses</h3>
          <ul>
            {data.enrolledCourses.map(course => (
              <li key={course._id}>
                <Link to={`/courses/${course._id}`} className="text-blue-500">{course.title}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 border rounded">
          <h3 className="font-bold mb-2">Upcoming Classes</h3>
          <ul>
            {data.upcomingClasses.map(cls => (
              <li key={cls.id}>{cls.title} on {cls.date}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-6 p-4 border rounded">
        <h3 className="font-bold mb-2">Notifications</h3>
        <ul>
          {data.notifications.map((note, index) => (
            <li key={index}>{note}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default StudentDashboard;
