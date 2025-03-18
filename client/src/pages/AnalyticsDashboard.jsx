import React, { useEffect, useState } from 'react';
import API from '../api';

function AnalyticsDashboard() {
  const [engagementReport, setEngagementReport] = useState({});
  const [revenueReport, setRevenueReport] = useState({});

  useEffect(() => {
    API.get('/analytics/report/engagement')
      .then(res => setEngagementReport(res.data))
      .catch(err => console.error('Error fetching engagement report:', err));
    API.get('/analytics/report/revenue')
      .then(res => setRevenueReport(res.data))
      .catch(err => console.error('Error fetching revenue report:', err));
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-3xl font-semibold mb-4">Analytics Dashboard</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 bg-white shadow rounded">
          <h3 className="text-xl font-bold">Total Users</h3>
          <p className="text-3xl">{engagementReport.totalUsers || 0}</p>
        </div>
        <div className="p-6 bg-white shadow rounded">
          <h3 className="text-xl font-bold">Pending Approvals</h3>
          <p className="text-3xl">{engagementReport.pendingUsers || 0}</p>
        </div>
        <div className="p-6 bg-white shadow rounded">
          <h3 className="text-xl font-bold">Total Transactions</h3>
          <p className="text-3xl">{engagementReport.totalTransactions || 0}</p>
        </div>
        <div className="p-6 bg-white shadow rounded">
          <h3 className="text-xl font-bold">Total Revenue</h3>
          <p className="text-3xl">${revenueReport.totalRevenue || 0}</p>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
