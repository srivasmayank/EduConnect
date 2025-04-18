import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce';
import API from '../api';

export default function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const teacherId = localStorage.getItem('currentTeacherId');

  const [course, setCourse] = useState(null);
  const [lecture, setLecture] = useState(null);
  const [savedTime, setSavedTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);

  const videoRef = useRef();
  const containerRef = useRef();

  // Debounced progress reporter
  const reportProgress = useRef(
    debounce((time, lectureId) => {
      if (!lectureId) return;
      API.post(
        `/courses/${courseId}/lectures/${lectureId}/progress`,
        { time },
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(console.error);
    }, 500)
  ).current;

  // Load course
  useEffect(() => {
    API.get(`/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setCourse(res.data);
        if (res.data.access === 'full' && res.data.lectures.length) {
          setLecture(res.data.lectures[0]);
        }
      })
      .catch(console.error);
  }, [courseId, token]);

  // On lecture change
  useEffect(() => {
    if (!lecture) return;
    videoRef.current?.pause();
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    API.get(`/courses/${courseId}/progress`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        const rec = res.data.find(r => r.lectureId === lecture._id);
        setSavedTime(rec?.time || 0);
      })
      .catch(console.error);
  }, [lecture, courseId, token]);

  // Metadata loaded
  const handleLoadedMetadata = () => {
    const v = videoRef.current;
    if (!v) return;
    setDuration(v.duration);
    v.currentTime = savedTime;
    setCurrentTime(savedTime);
  };

  // Re-seek if savedTime updates
  useEffect(() => {
    const v = videoRef.current;
    if (v && duration > 0) {
      v.currentTime = savedTime;
      setCurrentTime(savedTime);
    }
  }, [savedTime, duration]);

  // Play/pause toggle
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) v.pause();
    else v.play();
    setPlaying(!playing);
  };

  // Fullscreen
  const handleFullscreen = () => {
    if (containerRef.current.requestFullscreen) {
      containerRef.current.requestFullscreen();
    }
  };

  // On time update
  const onTimeUpdate = () => {
    if (!lecture) return;
    const t = videoRef.current.currentTime;
    setCurrentTime(t);
    reportProgress(t, lecture._id);
  };

  // Seek via progress bar
  const onSeek = e => {
    if (!lecture || !duration) return;
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - left) / width;
    const newT = pct * duration;
    videoRef.current.currentTime = newT;
    setCurrentTime(newT);
    reportProgress(newT, lecture._id);
  };

  if (!course) return <div className="p-8">Loading course…</div>;

  if (course.access === 'demo') {
    return (
      <div className="p-8">
        <h2 className="text-3xl mb-4">{course.title}</h2>
        <p className="mb-4">{course.description}</p>
        {course.demoVideoUrl && (
          <>
            <h3 className="text-xl font-bold mb-2">Preview</h3>
            <video controls className="w-full rounded shadow mb-2">
              <source src={course.demoVideoUrl} type="video/mp4" />
            </video>
          </>
        )}
        <button
          onClick={() => navigate(`/payment?courseId=${courseId}`)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Purchase
        </button>
      </div>
    );
  }

  // Full view
  const percent = duration ? (currentTime / duration) * 100 : 0;
  const fmt = s => new Date(s * 1000).toISOString().substr(14, 5);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-semibold">{course.title}</h1>
      <p className="text-gray-700">{course.description}</p>
      {teacherId === course.teacherId && (
        <button
          onClick={() => navigate(`/courses/${courseId}/manage`)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
        >
          Manage Lectures
        </button>
      )}

      {lecture && (
        <div ref={containerRef} className="relative rounded-lg overflow-hidden">
          <video
            key={lecture._id}
            ref={videoRef}
            src={lecture.videoUrl}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={onTimeUpdate}
            className="w-full h-auto"
            playsInline
          />

          {/* center play/pause overlay */}
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center focus:outline-none"
          >
            {playing ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="white" viewBox="0 0 20 20">
                <path d="M6 4l12 6-12 6z" />
              </svg>
            )}
          </button>

          {/* bottom overlay controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-50 flex items-center space-x-4">
            {/* progress bar container */}
            <div
              onClick={onSeek}
              className="relative flex-1 h-2 bg-gray-300 rounded cursor-pointer"
            >
              <div
                className="absolute inset-y-0 left-0 bg-violet-600 rounded"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-sm text-white">
              {fmt(currentTime)} / {fmt(duration)}
            </span>
            <button onClick={handleFullscreen} className="focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3H5a2 2 0 00-2 2v3m0 8v3a2 2 0 002 2h3m8-16h3a2 2 0 012 2v3m0 8v3a2 2 0 01-2 2h-3" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <CourseContent
        lectures={course.lectures}
        currentId={lecture?._id}
        onSelect={lec => setLecture(lec)}
      />

      {course.resources?.length > 0 && (
        <CourseMaterials resources={course.resources} />
      )}

      <CourseRating
        course={course}
        teacherId={teacherId}
        courseId={courseId}
      />
    </div>
  );
}

// ——————————————————————————
// Sub-components
// ——————————————————————————

function CourseContent({ lectures, currentId, onSelect }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Course Content</h3>
        <button
          onClick={() => setOpen(o => !o)}
          className="text-purple-600 hover:underline"
        >
          {open ? 'Collapse' : 'Expand'}
        </button>
      </div>
      {open && (
        <div className="border rounded overflow-hidden">
          {lectures.map((lec, i) => (
            <div
              key={lec._id}
              onClick={() => onSelect(lec)}
              className={
                `flex justify-between items-center px-4 py-2 border-t cursor-pointer ` +
                (lec._id === currentId ? 'bg-gray-200' : 'hover:bg-gray-50')
              }
            >
              <span>{`${i + 1}. ${lec.title}`}</span>
              <span>▶︎</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CourseMaterials({ resources }) {
  return (
    <div>
      <h3 className="font-bold text-xl mb-2">Course Materials</h3>
      <ul className="list-disc ml-6">
        {resources.map((res, i) => (
          <li key={i}>
            <a
              href={res}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500"
            >
              Resource {i + 1}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CourseRating({ course, teacherId, courseId }) {
  const token = localStorage.getItem('token');
  const [userRating, setUserRating] = useState(0);

  const submitRating = async () => {
    try {
      const res = await API.post(
        `/courses/${courseId}/rate`,
        { rating: userRating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Rating submitted! New average: ${res.data.averageRating.toFixed(1)}`);
    } catch {
      alert('Error submitting rating');
    }
  };

  if (teacherId === course.teacherId) return null;

  return (
    <div className="mt-8">
      <h3 className="font-bold text-xl mb-2">Rate this Course</h3>
      <div className="flex items-center space-x-2">
        <select
          value={userRating}
          onChange={e => setUserRating(Number(e.target.value))}
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
          Submit
        </button>
      </div>
      <p className="mt-2">
        Average Rating:{' '}
        {course.averageRating ? course.averageRating.toFixed(1) : 'No ratings yet'}
      </p>
    </div>
  );
}
