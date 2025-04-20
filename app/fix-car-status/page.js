'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function FixCarStatus() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFixStatus = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      const response = await fetch('/api/fix-car-status', {
        method: 'POST'
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Car statuses have been fixed successfully!');
      } else {
        setMessage(`Error: ${data.error || 'Failed to fix car statuses'}`);
      }
    } catch (error) {
      setMessage('Error: Failed to fix car statuses');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Fix Car Statuses</h1>
        <p className="text-gray-600 mb-6">
          This will update the status of all cars that are marked as rented but don't have any active reservations.
        </p>
        
        <Button
          onClick={handleFixStatus}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Fixing...' : 'Fix Car Statuses'}
        </Button>

        {message && (
          <p className={`mt-4 text-center ${
            message.includes('Error') ? 'text-red-500' : 'text-green-500'
          }`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
} 