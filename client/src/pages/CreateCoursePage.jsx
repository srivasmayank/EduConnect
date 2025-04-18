import React, { useState, useEffect } from 'react';
import API from '../api';

// Reusable Dropzone with preview and remove
const Dropzone = ({
  id,
  accept,
  previewSrc,
  onFileChange,
  uploading,
  onUploadClick,
  uploadLabel,
  title,
  hint,
  onRemove
}) => (
  <div className="space-y-2">
    <p className="block text-lg font-semibold">{title}</p>

    {previewSrc ? (
      <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-gray-100">
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full w-6 h-6 flex items-center justify-center hover:bg-opacity-75"
        >
          &times;
        </button>
        {accept.startsWith('video') ? (
          <video
            src={previewSrc}
            controls
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={previewSrc}
            alt={`${title} preview`}
            className="w-full h-full object-cover"
          />
        )}
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl bg-white hover:bg-gray-50 transition-shadow shadow-sm hover:shadow-lg cursor-pointer">
        <label htmlFor={id} className="flex flex-col items-center justify-center w-full h-full p-4">
          <svg className="w-10 h-10 mb-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
          </svg>
          <p className="text-sm text-gray-600"><span className="font-medium">Click to select</span> or drag and drop</p>
          <p className="text-xs text-gray-500">{hint}</p>
          <input
            id={id}
            type="file"
            accept={accept}
            className="hidden"
            onChange={onFileChange}
          />
        </label>
      </div>
    )}

    <button
      type="button"
      onClick={onUploadClick}
      disabled={uploading || !previewSrc}
      className={`w-full py-2 rounded-lg text-white transition-all duration-200 
        ${uploading || !previewSrc
          ? 'bg-gray-300 cursor-not-allowed'
          : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'}`}
    >
      {uploading ? 'Uploading...' : uploadLabel}
    </button>
  </div>
);

function CreateCoursePage() {
  const teacherId = localStorage.getItem('currentTeacherId');

  const [courseData, setCourseData] = useState({
    title: '', description: '', videoUrl: '', demoVideoUrl: '', thumbnail: '', shortDescription: ''
  });

  // Local file and preview states
  const [fullVideoFile, setFullVideoFile] = useState(null);
  const [fullVideoPreview, setFullVideoPreview] = useState('');

  const [demoVideoFile, setDemoVideoFile] = useState(null);
  const [demoVideoPreview, setDemoVideoPreview] = useState('');

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');

  const [uploadingFull, setUploadingFull] = useState(false);
  const [uploadingDemo, setUploadingDemo] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  // Generate previews when files are selected
  useEffect(() => {
    if (fullVideoFile) {
      const url = URL.createObjectURL(fullVideoFile);
      setFullVideoPreview(url);
      return () => URL.revokeObjectURL(url);
    } else setFullVideoPreview('');
  }, [fullVideoFile]);

  useEffect(() => {
    if (demoVideoFile) {
      const url = URL.createObjectURL(demoVideoFile);
      setDemoVideoPreview(url);
      return () => URL.revokeObjectURL(url);
    } else setDemoVideoPreview('');
  }, [demoVideoFile]);

  useEffect(() => {
    if (thumbnailFile) {
      const url = URL.createObjectURL(thumbnailFile);
      setThumbnailPreview(url);
      return () => URL.revokeObjectURL(url);
    } else setThumbnailPreview('');
  }, [thumbnailFile]);

  const uploadFile = async (file, endpoint, fieldName) => {
    const formData = new FormData();
    formData.append(fieldName, file);
    const res = await API.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data[Object.keys(res.data)[0]];
  };

  const handleFullVideoFileChange = e => setFullVideoFile(e.target.files[0]);
  const handleDemoVideoFileChange = e => setDemoVideoFile(e.target.files[0]);
  const handleThumbnailFileChange = e => setThumbnailFile(e.target.files[0]);

  const handleFullVideoUpload = async () => {
    setUploadingFull(true);
    try {
      const url = await uploadFile(fullVideoFile, '/courses/upload', 'video');
      setCourseData(cd => ({ ...cd, videoUrl: url }));
      setFullVideoFile(null); setFullVideoPreview('');
    } catch (err) { console.error(err); alert('Full video upload failed.'); }
    finally { setUploadingFull(false); }
  };

  const handleDemoVideoUpload = async () => {
    setUploadingDemo(true);
    try {
      const url = await uploadFile(demoVideoFile, '/courses/upload', 'video');
      setCourseData(cd => ({ ...cd, demoVideoUrl: url }));
      setDemoVideoFile(null); setDemoVideoPreview('');
    } catch (err) { console.error(err); alert('Demo video upload failed.'); }
    finally { setUploadingDemo(false); }
  };

  const handleThumbnailUpload = async () => {
    setUploadingThumb(true);
    try {
      const url = await uploadFile(thumbnailFile, '/courses/upload-image', 'image');
      setCourseData(cd => ({ ...cd, thumbnail: url }));
      setThumbnailFile(null); setThumbnailPreview('');
    } catch (err) { console.error(err); alert('Thumbnail upload failed.'); }
    finally { setUploadingThumb(false); }
  };

  const removeFullVideo = () => { setFullVideoFile(null); setFullVideoPreview(''); };
  const removeDemoVideo = () => { setDemoVideoFile(null); setDemoVideoPreview(''); };
  const removeThumbnail = () => { setThumbnailFile(null); setThumbnailPreview(''); };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!teacherId) return alert('Please log in as teacher!');
    try {
      await API.post('/courses', { ...courseData, teacherId });
      alert('Course created!');
      setCourseData({ title: '', description: '', videoUrl: '', demoVideoUrl: '', thumbnail: '', shortDescription: '' });
    } catch (err) { console.error(err); alert('Error creating course.'); }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-gray-50 rounded-2xl shadow-md">
      <h2 className="text-4xl font-bold mb-6 text-center">Create New Course</h2>
      <form onSubmit={handleSubmit} className="space-y-6">

        <input
          type="text"
          placeholder="Course Title"
          className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={courseData.title}
          onChange={e => setCourseData({ ...courseData, title: e.target.value })}
          required
        />

        <textarea
          placeholder="Course Description"
          className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 h-32"
          value={courseData.description}
          onChange={e => setCourseData({ ...courseData, description: e.target.value })}
          required
        />

        {/* Full Video Dropzone */}
        {/* <Dropzone
          id="full-video"
          accept="video/*"
          previewSrc={fullVideoPreview}
          onFileChange={handleFullVideoFileChange}
          uploading={uploadingFull}
          onUploadClick={handleFullVideoUpload}
          uploadLabel="Upload Full Video"
          title="Full Course Video"
          hint="MP4, MOV (max 500MB)"
          onRemove={removeFullVideo}
        /> */}

        {/* Demo Video Dropzone */}
        <Dropzone
          id="demo-video"
          accept="video/*"
          previewSrc={demoVideoPreview}
          onFileChange={handleDemoVideoFileChange}
          uploading={uploadingDemo}
          onUploadClick={handleDemoVideoUpload}
          uploadLabel="Upload Demo Video"
          title="Demo Video"
          hint="MP4, MOV (max 100MB)"
          onRemove={removeDemoVideo}
        />

        {/* Thumbnail Dropzone */}
        <Dropzone
          id="thumbnail"
          accept="image/*"
          previewSrc={thumbnailPreview}
          onFileChange={handleThumbnailFileChange}
          uploading={uploadingThumb}
          onUploadClick={handleThumbnailUpload}
          uploadLabel="Upload Thumbnail"
          title="Course Thumbnail"
          hint="PNG, JPG (800x400px max)"
          onRemove={removeThumbnail}
        />

        <input
          type="text"
          placeholder="Short Description"
          className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={courseData.shortDescription}
          onChange={e => setCourseData({ ...courseData, shortDescription: e.target.value })}
        />

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-lg rounded-lg shadow-md hover:from-green-600 hover:to-green-700 transition-all duration-200"
        >
          Create Course
        </button>
      </form>
    </div>
  );
}

export default CreateCoursePage;
