import React, { useState, useEffect } from 'react';
import API from '../api';

// Component for creating or editing a batch
const BatchForm = ({ onSubmit, initialData = {}, onCancel }) => {
  const [batchData, setBatchData] = useState({
    courseTitle: '',
    batchTitle: '',
    scheduledDate: '',
    scheduledTime: '',
    capacity: '',
    description: '',
    ...initialData,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBatchData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!batchData.courseTitle || !batchData.batchTitle || !batchData.scheduledDate || !batchData.scheduledTime || !batchData.capacity) {
      alert('Please fill in all required fields.');
      return;
    }
    onSubmit(batchData);
    setBatchData({
      courseTitle: '',
      batchTitle: '',
      scheduledDate: '',
      scheduledTime: '',
      capacity: '',
      description: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6">
      <h3 className="text-xl font-bold mb-4">{initialData._id ? 'Edit Batch' : 'Create New Batch'}</h3>
      <div className="grid grid-cols-1 gap-4">
        <input
          type="text"
          name="courseTitle"
          value={batchData.courseTitle}
          onChange={handleChange}
          placeholder="Course Title (Required)"
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          name="batchTitle"
          value={batchData.batchTitle}
          onChange={handleChange}
          placeholder="Batch Title (Required)"
          className="p-2 border rounded"
          required
        />
        <div className="flex space-x-4">
          <input
            type="date"
            name="scheduledDate"
            value={batchData.scheduledDate}
            onChange={handleChange}
            className="p-2 border rounded flex-1"
            required
          />
          <input
            type="time"
            name="scheduledTime"
            value={batchData.scheduledTime}
            onChange={handleChange}
            className="p-2 border rounded flex-1"
            required
          />
        </div>
        <input
          type="number"
          name="capacity"
          value={batchData.capacity}
          onChange={handleChange}
          placeholder="Capacity (Required)"
          className="p-2 border rounded"
          required
        />
        <textarea
          name="description"
          value={batchData.description}
          onChange={handleChange}
          placeholder="Description (Optional)"
          className="p-2 border rounded"
        />
      </div>
      <div className="mt-4 flex space-x-4">
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {initialData._id ? 'Update Batch' : 'Create Batch'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="bg-gray-500 text-white px-4 py-2 rounded">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

// Component for listing batches with edit and delete actions
const BatchList = ({ batches, onEdit, onDelete }) => {
  if (!batches.length) {
    return <p>No batches scheduled yet.</p>;
  }
  return (
    <div className="space-y-4">
      {batches.map((batch) => (
        <div key={batch._id} className="p-4 border rounded shadow flex flex-col md:flex-row md:justify-between">
          <div>
            <h4 className="font-bold text-lg">{batch.batchTitle}</h4>
            <p className="text-sm">Course: {batch.courseTitle}</p>
            <p className="text-sm">
              Scheduled: {batch.scheduledDate} at {batch.scheduledTime}
            </p>
            <p className="text-sm">Capacity: {batch.capacity}</p>
            {batch.description && <p className="text-sm">Description: {batch.description}</p>}
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <button onClick={() => onEdit(batch)} className="bg-yellow-500 text-white px-3 py-1 rounded">
              Edit
            </button>
            <button onClick={() => onDelete(batch._id)} className="bg-red-500 text-white px-3 py-1 rounded">
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

function BatchManagementPage() {
  const [batches, setBatches] = useState([]);
  const [editingBatch, setEditingBatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await API.get('/teacher/batches', { params: { teacherId: 'currentTeacherId' } });
      setBatches(res.data.batches);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching batches:', error);
      setLoading(false);
    }
  };

  const createBatch = async (batchData) => {
    try {
      const res = await API.post('/teacher/batches', { ...batchData, teacherId: 'currentTeacherId' });
      setBatches([res.data.batch, ...batches]);
      alert('Batch created successfully!');
    } catch (error) {
      console.error('Error creating batch:', error);
      alert('Failed to create batch.');
    }
  };

  const updateBatch = async (batchData) => {
    try {
      const res = await API.put(`/teacher/batches/${batchData._id}`, batchData);
      setBatches(batches.map(b => (b._id === batchData._id ? res.data.batch : b)));
      setEditingBatch(null);
      alert('Batch updated successfully!');
    } catch (error) {
      console.error('Error updating batch:', error);
      alert('Failed to update batch.');
    }
  };

  const deleteBatch = async (batchId) => {
    try {
      await API.delete(`/teacher/batches/${batchId}`);
      setBatches(batches.filter(b => b._id !== batchId));
      alert('Batch deleted successfully!');
    } catch (error) {
      console.error('Error deleting batch:', error);
      alert('Failed to delete batch.');
    }
  };

  const handleFormSubmit = (batchData) => {
    if (editingBatch) {
      updateBatch({ ...editingBatch, ...batchData });
    } else {
      createBatch(batchData);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-semibold mb-6">Batch Management</h2>
      <BatchForm
        onSubmit={handleFormSubmit}
        initialData={editingBatch || {}}
        onCancel={() => setEditingBatch(null)}
      />
      {loading ? (
        <p>Loading batches...</p>
      ) : (
        <BatchList
          batches={batches}
          onEdit={(batch) => setEditingBatch(batch)}
          onDelete={deleteBatch}
        />
      )}
    </div>
  );
}

export default BatchManagementPage;
