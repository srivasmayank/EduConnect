import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';

function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    API.get(`/courses/${courseId}`)
      .then((res) => {
        setCourse(res.data);
        if (res.data.access === 'full' && res.data.lectures && res.data.lectures.length > 0) {
          setCurrentLecture(res.data.lectures[0]);
        }
      })
      .catch((err) => console.error('Error fetching course details:', err));
  }, [courseId]);

  const handleRatingChange = (e) => {
    setUserRating(Number(e.target.value));
  };

  const submitRating = async () => {
    try {
      const res = await API.post(`/courses/${courseId}/rate`, { rating: userRating });
      alert('Rating submitted! New average: ' + res.data.averageRating.toFixed(1));
      // Refresh course details to update average rating display
      const updatedCourse = await API.get(`/courses/${courseId}`);
      setCourse(updatedCourse.data);
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Error submitting rating');
    }
  };

  if (!course) {
    return <div className="p-8">Loading course details...</div>;
  }

  if (course.access === 'demo') {
    return (
      <div className="p-8">
        <h2 className="text-3xl font-semibold mb-4">{course.title}</h2>
        <p className="mb-4">{course.description}</p>
        {course.demoVideoUrl && (
          <div className="mb-6">
            <h3 className="font-bold text-xl mb-2">Course Demo</h3>
            <video controls className="w-full max-h-96">
              <source src={course.demoVideoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <p className="text-sm text-gray-600 mt-2">
              Watch the demo video to get an overview of the course.
            </p>
          </div>
        )}
        <button
          onClick={() => navigate(`/payment?courseId=${courseId}`)}
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Purchase Course
        </button>
        <div className="mt-6">
          <h3 className="font-bold text-xl mb-2">Course Materials (Demo)</h3>
          <ul className="list-disc ml-6">
            {course.resources && course.resources.map((res, index) => (
              <li key={index}>
                <a href={res} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                  Resource {index + 1}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-3xl font-semibold mb-4">{course.title}</h2>
      <p className="mb-4">{course.description}</p>
      
      {course.lectures && course.lectures.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-xl mb-2">Recorded Lectures</h3>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {course.lectures.map((lecture, index) => (
              <div
                key={index}
                onClick={() => setCurrentLecture(lecture)}
                className={`cursor-pointer border p-2 rounded ${
                  currentLecture && currentLecture.videoUrl === lecture.videoUrl ? 'border-blue-500' : ''
                }`}
              >
                {lecture.thumbnail ? (
                  <img src={lecture.thumbnail} alt={lecture.title} className="w-40 h-24 object-cover rounded" />
                ) : (
                  <div className="w-40 h-24 bg-gray-200 flex items-center justify-center rounded">
                    <span className="text-sm">{lecture.title}</span>
                  </div>
                )}
                <p className="mt-2 text-sm text-center">{lecture.title}</p>
              </div>
            ))}
          </div>
          {currentLecture && (
            <div className="mt-4">
              <h4 className="font-bold text-lg mb-2">{currentLecture.title}</h4>
              <video controls className="w-full max-h-96">
                <source src={currentLecture.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>
      )}
      
      {/* Display Course Materials */}
      <div>
        <h3 className="font-bold text-xl mb-2">Course Materials</h3>
        <ul className="list-disc ml-6">
          {course.resources && course.resources.map((res, index) => (
            <li key={index}>
              <a href={res} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                Resource {index + 1}
              </a>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Rating Section */}
      <div className="mt-8">
        <h3 className="font-bold text-xl mb-2">Rate this Course</h3>
        <div className="flex items-center space-x-2">
          <select value={userRating} onChange={handleRatingChange} className="p-2 border rounded">
            <option value={0}>Select Rating</option>
            {[1,2,3,4,5].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
          <button 
            onClick={submitRating} 
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Submit Rating
          </button>
        </div>
        <p className="mt-2">Average Rating: {course.averageRating ? course.averageRating.toFixed(1) : 'No ratings yet'}</p>
      </div>
    </div>
  );
}

export default CoursePage;
