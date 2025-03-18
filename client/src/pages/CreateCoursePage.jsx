import React, { useState } from 'react';
import API from '../api';

function CreateCoursePage() {
  // Retrieve teacherId from localStorage (set during login)
  const teacherId = localStorage.getItem('currentTeacherId');
  
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    demoVideoUrl: '',
    thumbnail: '',
    shortDescription: ''
  });
  const [fullVideoFile, setFullVideoFile] = useState(null);
  const [demoVideoFile, setDemoVideoFile] = useState(null);
  const [uploadingFull, setUploadingFull] = useState(false);
  const [uploadingDemo, setUploadingDemo] = useState(false);

  const handleFullVideoFileChange = (e) => {
    setFullVideoFile(e.target.files[0]);
  };

  const handleDemoVideoFileChange = (e) => {
    setDemoVideoFile(e.target.files[0]);
  };

  const uploadVideo = async (file) => {
    const formData = new FormData();
    formData.append("video", file);
    try {
      const res = await API.post('/courses/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data.videoUrl;
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  };

  const handleFullVideoUpload = async () => {
    if (!fullVideoFile) {
      alert('Please select a full course video file to upload.');
      return;
    }
    setUploadingFull(true);
    try {
      const url = await uploadVideo(fullVideoFile);
      setCourseData({ ...courseData, videoUrl: url });
      alert('Full course video uploaded successfully!');
    } catch (error) {
      alert('Full video upload failed');
    } finally {
      setUploadingFull(false);
    }
  };

  const handleDemoVideoUpload = async () => {
    if (!demoVideoFile) {
      alert('Please select a demo video file to upload.');
      return;
    }
    setUploadingDemo(true);
    try {
      const url = await uploadVideo(demoVideoFile);
      setCourseData({ ...courseData, demoVideoUrl: url });
      alert('Demo video uploaded successfully!');
    } catch (error) {
      alert('Demo video upload failed');
    } finally {
      setUploadingDemo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teacherId) {
      alert('Teacher ID not found. Please log in as a teacher.');
      return;
    }
    try {
      // Include the teacherId retrieved from localStorage in the payload
      const res = await API.post('/courses', { ...courseData, teacherId });
      alert('Course created and video queued for processing!');
      setCourseData({
        title: '',
        description: '',
        videoUrl: '',
        demoVideoUrl: '',
        thumbnail: '',
        shortDescription: ''
      });
      setFullVideoFile(null);
      setDemoVideoFile(null);
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Error creating course');
    }
  };

  return (
    <div className="max-w-lg mx-auto p-8">
      <h2 className="text-3xl font-semibold mb-4">Create Course</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="text"
          placeholder="Course Title"
          className="w-full p-2 border rounded"
          value={courseData.title}
          onChange={e => setCourseData({ ...courseData, title: e.target.value })}
          required
        />
        <textarea 
          placeholder="Course Description"
          className="w-full p-2 border rounded"
          value={courseData.description}
          onChange={e => setCourseData({ ...courseData, description: e.target.value })}
          required
        />
        {/* Full Course Video Upload */}
        <div className="space-y-2">
          <label className="block font-bold">Upload Full Course Video</label>
          <input type="file" onChange={handleFullVideoFileChange} accept="video/*" />
          <button 
            type="button" 
            onClick={handleFullVideoUpload} 
            className="bg-blue-500 text-white px-4 py-2 rounded" 
            disabled={uploadingFull}
          >
            {uploadingFull ? 'Uploading...' : 'Upload Full Video'}
          </button>
          {courseData.videoUrl && (
            <p className="text-green-600">Full video uploaded successfully.</p>
          )}
        </div>
        {/* Demo Video Upload */}
        <div className="space-y-2">
          <label className="block font-bold">Upload Demo Video</label>
          <input type="file" onChange={handleDemoVideoFileChange} accept="video/*" />
          <button 
            type="button" 
            onClick={handleDemoVideoUpload} 
            className="bg-blue-500 text-white px-4 py-2 rounded" 
            disabled={uploadingDemo}
          >
            {uploadingDemo ? 'Uploading...' : 'Upload Demo Video'}
          </button>
          {courseData.demoVideoUrl && (
            <p className="text-green-600">Demo video uploaded successfully.</p>
          )}
        </div>
        <input 
          type="text"
          placeholder="Thumbnail URL"
          className="w-full p-2 border rounded"
          value={courseData.thumbnail}
          onChange={e => setCourseData({ ...courseData, thumbnail: e.target.value })}
        />
        <input 
          type="text"
          placeholder="Short Description"
          className="w-full p-2 border rounded"
          value={courseData.shortDescription}
          onChange={e => setCourseData({ ...courseData, shortDescription: e.target.value })}
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Create Course</button>
      </form>
    </div>
  );
}

export default CreateCoursePage;
