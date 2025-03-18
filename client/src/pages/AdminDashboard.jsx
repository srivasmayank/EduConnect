import React, { useEffect, useState } from 'react';
import API from '../api';

function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    totalTransactions: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/metrics')
      .then(res => {
        setMetrics(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching metrics", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8">Loading admin metrics...</div>;

  return (
    <div className="p-8">
      <h2 className="text-3xl font-semibold mb-6">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white shadow rounded">
          <h3 className="text-xl font-bold">Total Users</h3>
          <p className="text-3xl">{metrics.totalUsers}</p>
        </div>
        <div className="p-6 bg-white shadow rounded">
          <h3 className="text-xl font-bold">Pending Approvals</h3>
          <p className="text-3xl">{metrics.pendingUsers}</p>
        </div>
        <div className="p-6 bg-white shadow rounded">
          <h3 className="text-xl font-bold">Total Transactions</h3>
          <p className="text-3xl">{metrics.totalTransactions}</p>
        </div>
        <div className="p-6 bg-white shadow rounded">
          <h3 className="text-xl font-bold">Total Revenue</h3>
          <p className="text-3xl">${metrics.totalRevenue}</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
