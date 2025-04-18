import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce';
import API from '../api';

function ProgressCircle({ percent, size = 60, strokeWidth = 6 }) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <svg width={size} height={size}>
      {/* background ring */}
      <circle
        cx={size/2}
        cy={size/2}
        r={r}
        stroke="#e5e7eb"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* progress ring */}
      <circle
        cx={size/2}
        cy={size/2}
        r={r}
        stroke="#4f46e5"
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
      />
      {/* percentage text */}
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={size * 0.3}
        fill="#4f46e5"
      >
        {Math.round(percent)}%
      </text>
    </svg>
  );
}

export default function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const teacherId = localStorage.getItem('currentTeacherId');

  const [course, setCourse] = useState(null);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [percent, setPercent] = useState(0);
  const [savedTime, setSavedTime] = useState(0);
  const [contentOpen, setContentOpen] = useState(true);
  const [userRating, setUserRating] = useState(0);

  const videoRef = useRef();

  // Debounced function to report progress
  const reportProgress = useRef(
    debounce(time => {
      API.post(
        `/courses/${courseId}/lectures/${currentLecture._id}/progress`,
        { time },
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(console.error);
    }, 1000)
  ).current;

  // Fetch course data
  useEffect(() => {
    API.get(`/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setCourse(res.data);
        if (res.data.access === 'full' && res.data.lectures.length) {
          setCurrentLecture(res.data.lectures[0]);
        }
      })
      .catch(console.error);
  }, [courseId, token]);

  // When lecture changes, fetch saved progress
  useEffect(() => {
    if (!currentLecture) return;
    API.get(`/courses/${courseId}/progress`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        const rec = res.data.find(d => d.lectureId === currentLecture._id);
        const t = rec?.time || 0;
        setSavedTime(t);
        setPercent((rec?.time || 0) / (videoRef.current?.duration || 1) * 100);
        if (videoRef.current) {
          videoRef.current.currentTime = t;
        }
      })
      .catch(console.error);
  }, [currentLecture, courseId, token]);

  // Handle time updates
  const handleTimeUpdate = () => {
    if (!videoRef.current || !currentLecture) return;
    const t = videoRef.current.currentTime;
    const d = videoRef.current.duration || 1;
    setPercent((t / d) * 100);
    reportProgress(t);
  };

  // Handle rating
  const handleRatingChange = e => setUserRating(Number(e.target.value));
  const submitRating = async () => {
    try {
      const res = await API.post(
        `/courses/${courseId}/rate`,
        { rating: userRating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Rating submitted! New average: ${res.data.averageRating.toFixed(1)}`);
      const updated = await API.get(`/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourse(updated.data);
    } catch (err) {
      console.error(err);
      alert('Error submitting rating');
    }
  };

  if (!course) return <div className="p-8">Loading course details...</div>;

  // Demo view
  if (course.access === 'demo') {
    return (
      <div className="p-8">
        <h2 className="text-3xl font-semibold mb-4">{course.title}</h2>
        <p className="mb-4">{course.description}</p>
        {course.demoVideoUrl && (
          <div className="mb-6">
            <h3 className="font-bold text-xl mb-2">Course Demo</h3>
            <video controls className="w-full max-h-96 rounded shadow">
              <source src={course.demoVideoUrl} type="video/mp4" />
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
      </div>
    );
  }

  // Helper to format time
  const fmt = s => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Title & Description */}
      <h1 className="text-3xl font-semibold">{course.title}</h1>
      <p className="text-gray-700">{course.description}</p>

      {/* Manage Lectures Button */}
      {teacherId === course.teacherId && (
        <button
          onClick={() => navigate(`/courses/${courseId}/manage`)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
        >
          Manage Lectures
        </button>
      )}

      {/* Progress Indicator */}
      {currentLecture && (
        <div className="flex items-center space-x-4">
          <ProgressCircle percent={percent} />
          {savedTime > 0 && (
            <span className="text-sm text-gray-600">
              You left off at <strong>{fmt(savedTime)}</strong>
            </span>
          )}
        </div>
      )}

      {/* Video Player */}
      {currentLecture && (
        <video
          key={currentLecture._id}
          ref={videoRef}
          controls
          onTimeUpdate={handleTimeUpdate}
          className="w-full rounded shadow-lg"
        >
          <source src={currentLecture.videoUrl} type="video/mp4" />
        </video>
      )}

      {/* Collapsible Course Content */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Course Content</h3>
          <button
            onClick={() => setContentOpen(o => !o)}
            className="text-purple-600 hover:underline"
          >
            {contentOpen ? 'Collapse' : 'Expand'}
          </button>
        </div>
        {contentOpen && (
          <div className="border rounded overflow-hidden">
            {course.lectures.map((lec, idx) => (
              <div
                key={lec._id}
                onClick={() => setCurrentLecture(lec)}
                className={`
                  flex justify-between items-center px-4 py-2 border-t cursor-pointer
                  ${currentLecture?._id === lec._id ? 'bg-gray-200' : 'hover:bg-gray-50'}
                `}
              >
                <span>{`${idx + 1}. ${lec.title}`}</span>
                <span>▶︎</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Course Materials */}
      <div>
        <h3 className="font-bold text-xl mb-2">Course Materials</h3>
        <ul className="list-disc ml-6">
          {course.resources?.map((res, i) => (
            <li key={i}>
              <a href={res} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                Resource {i + 1}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Rating Section */}
      {teacherId !== course.teacherId && (
        <div className="mt-8">
          <h3 className="font-bold text-xl mb-2">Rate this Course</h3>
          <div className="flex items-center space-x-2">
            <select
              value={userRating}
              onChange={handleRatingChange}
              className="p-2 border rounded"
            >
              <option value={0}>Select Rating</option>
              {[1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <button
              onClick={submitRating}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Submit Rating
            </button>
          </div>
          <p className="mt-2">
            Average Rating: {course.averageRating ? course.averageRating.toFixed(1) : 'No ratings yet'}
          </p>
        </div>
      )}
    </div>
  );
}
