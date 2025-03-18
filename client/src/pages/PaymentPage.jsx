import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../api';

function PaymentPage() {
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const courseId = query.get('courseId');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Simulate payment. In a real app, integrate with a payment gateway.
      const userId = localStorage.getItem('userId'); // Assume userId is stored after login
      const amount = 100; // Example course price
      await API.post('/payments', { userId, courseId, amount });
      alert('Payment successful! You are now enrolled.');
      navigate(`/courses/${courseId}`);
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed, please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8">
      <h2 className="text-3xl font-semibold mb-4">Course Payment</h2>
      <p className="mb-4">Course ID: {courseId}</p>
      <p className="mb-4">Amount: $100</p>
      <button 
        onClick={handlePayment} 
        className="w-full bg-green-500 text-white p-2 rounded" 
        disabled={loading}
      >
        {loading ? 'Processing Payment...' : 'Pay Now'}
      </button>
    </div>
  );
}

export default PaymentPage;
