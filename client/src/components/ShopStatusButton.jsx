import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import Swal from 'sweetalert2';
import { useLogin } from '../components/LoginContext'; // Import the context

const ShopStatusButton = ({ shopId, currentStatus }) => {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const { refreshShopData } = useLogin(); // Get refresh function from context

  const statusConfig = {
    open: {
      label: 'Open',
      color: 'bg-green-500 hover:bg-green-600',
      text: 'text-white',
      icon: '✅',
      confirmColor: '#10B981' // Green
    },
    break: {
      label: 'On Break',
      color: 'bg-yellow-500 hover:bg-yellow-600',
      text: 'text-white',
      icon: '⏸️',
      confirmColor: '#F59E0B' // Yellow
    },
    closed: {
      label: 'Closed',
      color: 'bg-red-500 hover:bg-red-600',
      text: 'text-white',
      icon: '❌',
      confirmColor: '#EF4444' // Red
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      setLoading(true);

      const config = statusConfig[newStatus];
      
      const result = await Swal.fire({
        title: 'Change Shop Status?',
        text: `Are you sure you want to set your shop status to "${newStatus}"? This will notify customers with upcoming appointments.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: config.confirmColor,
        cancelButtonColor: '#6b7280',
        confirmButtonText: `Yes, set to ${newStatus}`,
        cancelButtonText: 'Cancel',
         reverseButtons: true // Add this line to swap button positions
      });

      if (result.isConfirmed) {
        const response = await api.put(`/shop/${shopId}/status`, { status: newStatus });
        
        if (response.data.success) {
          // Update local state
          setStatus(newStatus);
          
          // Refresh shop data in context to get updated status
          await refreshShopData();
          
          Swal.fire({
            title: 'Success!',
            text: `Shop status updated to ${newStatus}`,
            icon: 'success',
            confirmButtonText: 'OK',
            reverseButtons: true // Also add to success popup for consistency
          });
        }
      }
    } catch (error) {
      console.error('Error updating shop status:', error);
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to update status',
        icon: 'error',
        confirmButtonText: 'OK',
        reverseButtons: true // Also add to success popup for consistency
      });
    } finally {
      setLoading(false);
    }
  };

  const currentConfig = statusConfig[status] || statusConfig.closed;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* <h3 className="text-lg font-semibold text-gray-800 mb-3">Shop Status</h3> */}
      
      <div className="flex flex-wrap gap-3">
        {Object.entries(statusConfig).map(([statusKey, config]) => (
          <button
            key={statusKey}
            onClick={() => updateStatus(statusKey)}
            disabled={loading || status === statusKey}
            className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
              status === statusKey 
                ? `${config.color} ${config.text} ring-2 ring-offset-2 ring-opacity-50`
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span className="mr-2">{config.icon}</span>
            {config.label}
            {status === statusKey && (
              <span className="ml-2 text-sm">✓</span>
            )}
          </button>
        ))}
      </div>
      
      <p className="text-sm text-gray-500 mt-2">
        Current status: <span className="font-medium capitalize">{status}</span>
      </p>
      
      {loading && (
        <p className="text-sm text-blue-500 mt-2">Updating status...</p>
      )}
    </div>
  );
};

export default ShopStatusButton;















