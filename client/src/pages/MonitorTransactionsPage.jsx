import React, { useEffect, useState } from 'react';
import API from '../api';

function MonitorTransactionsPage() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    API.get('/admin/transactions')
      .then(res => setTransactions(res.data.transactions))
      .catch(err => console.error('Error fetching transactions:', err));
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-3xl font-semibold mb-4">Monitor Transactions</h2>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2 border">Transaction ID</th>
            <th className="px-4 py-2 border">User</th>
            <th className="px-4 py-2 border">Amount</th>
            <th className="px-4 py-2 border">Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <tr key={tx._id}>
              <td className="px-4 py-2 border">{tx._id}</td>
              <td className="px-4 py-2 border">{tx.userId}</td>
              <td className="px-4 py-2 border">${tx.amount}</td>
              <td className="px-4 py-2 border">{new Date(tx.date).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MonitorTransactionsPage;
