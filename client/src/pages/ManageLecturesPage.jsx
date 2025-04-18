import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';

export default function ManageLecturesPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [lectures, setLectures] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newFile, setNewFile] = useState(null);

  useEffect(() => {
    API.get(`/courses/${courseId}`).then(res => {
      setLectures(res.data.lectures || []);
    });
  }, [courseId]);

  const uploadNew = async () => {
    if (!newTitle || !newFile) return alert('Title & video required');
    const form = new FormData();
    form.append('title', newTitle);
    form.append('video', newFile);
    const res = await API.post(`/courses/${courseId}/lectures`, form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setLectures(res.data.lectures);
    setNewTitle('');
    setNewFile(null);
  };

  const deleteLecture = async (id) => {
    if (!window.confirm('Delete this lecture?')) return;
    const res = await API.delete(`/courses/${courseId}/lectures/${id}`);
    setLectures(res.data.lectures);
  };

  const replaceLecture = async (id, file, title) => {
    const form = new FormData();
    if (title) form.append('title', title);
    if (file) form.append('video', file);
    const res = await API.put(`/courses/${courseId}/lectures/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setLectures(res.data.lectures);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Manage Lectures</h2>

      {/* ➕ Add new lecture */}
      <div className="mb-6 p-4 border rounded">
        <input
          className="w-full mb-2 p-2 border rounded"
          placeholder="Lecture Title"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
        />
        <input
          type="file"
          accept="video/*"
          onChange={e => setNewFile(e.target.files[0])}
          className="mb-2"
        />
        <button
          onClick={uploadNew}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Add Lecture
        </button>
      </div>

      {/* 📋 Existing lectures */}
      <ul className="space-y-4">
        {lectures.map(lec => (
          <li key={lec._id} className="p-4 border rounded">
            <div className="flex justify-between items-center">
              <strong>{lec.title}</strong>
              <div className="space-x-2">
                <button
                  onClick={() => deleteLecture(lec._id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
            <video
              src={lec.videoUrl}
              controls
              className="w-full my-2 max-h-44"
            />

            {/* 📌 Rename / replace controls */}
            <LectureEditor
              lecture={lec}
              onSave={(title, file) => replaceLecture(lec._id, file, title)}
            />
          </li>
        ))}
      </ul>

      <button
        onClick={() => navigate(-1)}
        className="mt-6 text-blue-500 hover:underline"
      >
        ← Back to Course
      </button>
    </div>
  );
}

// A small inline component to rename / replace a single lecture
function LectureEditor({ lecture, onSave }) {
  const [title, setTitle] = useState(lecture.title);
  const [file, setFile] = useState(null);

  return (
    <div className="mt-2 space-y-2">
      <input
        className="w-full p-1 border rounded"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <input
        type="file"
        accept="video/*"
        onChange={e => setFile(e.target.files[0])}
      />
      <button
        onClick={() => onSave(title, file)}
        className="bg-blue-500 text-white px-3 py-1 rounded"
      >
        Save Changes
      </button>
    </div>
  );
}
