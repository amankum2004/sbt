import React, { useState, useEffect } from 'react';
import { useLogin } from '../components/LoginContext';
import { api } from '../utils/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const BarberDashboard = () => {
  const { user } = useLogin();
  const navigate = useNavigate();
  const [currentAppointments, setCurrentAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [stats, setStats] = useState({});
  const [shop, setShop] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');
  const [shopId, setShopId] = useState('');
  const [shopStatus, setShopStatus] = useState('');
  const [checkingShopStatus, setCheckingShopStatus] = useState(true);

  const fetchAppointments = async () => {
    try {
      const response = await api.get(`/appoint/barber-appointments/${user.shop._id}`);
      console.log('Appointments response:', response.data);
      if (response.data.success) {
        const todaysAppts = response.data.todaysAppointments || [];
        const upcomingAppts = response.data.upcomingAppointments || [];
        const pastAppts = response.data.pastAppointments || [];
        const stats = response.data.stats || {};
        const shop = response.data.shop || {};
        
        console.log('Setting appointments:', {
          today: todaysAppts.length,
          upcoming: upcomingAppts.length,
          past: pastAppts.length,
          stats: stats,
          shop: shop
        });
        
        setTodaysAppointments(todaysAppts);
        setCurrentAppointments(upcomingAppts);
        setPastAppointments(pastAppts);
        setStats(stats);
        setShop(shop);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to load appointments',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };
  
  const fetchTodaysAppointments = async () => {
    try {
      const response = await api.get(`/appoint/barber-appointments/${user.shop._id}/today`);
      console.log("Today's Appointments response:", response.data);
      if (response.data.success) {
        const todayAppts = response.data.todaysAppointments || [];
        console.log('Setting today appointments:', todayAppts.length);
        setTodaysAppointments(todayAppts);
      }
    } catch (error) {
      console.error('Error fetching today\'s appointments:', error);
    }
  };

  const fetchBarberData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchAppointments(),
        fetchTodaysAppointments()
      ]);
    } catch (error) {
      console.error('Error fetching barber data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkShopStatus = async () => {
      if (user) {
        try {
          const shopRes = await api.get(`/shop/by-email/${user.email}`);
          const latestShopData = shopRes.data;
          console.log('Latest shop data:', latestShopData);
          setShopId(latestShopData._id);

          const isApproved = latestShopData?.isApproved || false;
          setShopStatus(isApproved ? 'approved' : 'pending');
          setShop(latestShopData);
          
          if (isApproved) {
            await fetchBarberData();
          } else {
            setLoading(false);
          }
        } catch (error) {
          console.error('Error fetching shop data:', error);
          setShopStatus('none');
          setLoading(false);
        }
      }
      setCheckingShopStatus(false);
    };

    checkShopStatus();
  }, [user, navigate]);

  // Enhanced time formatting function
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    
    // If it's already in AM/PM format, return as is
    if (typeof timeString === 'string' && (timeString.includes('AM') || timeString.includes('PM'))) {
      return timeString;
    }
    
    // If it's a date string, format it
    try {
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }
    } catch (error) {
      console.log('Error formatting date:', error);
    }
    
    // If it's just a time string like "08:00", convert to AM/PM
    if (typeof timeString === 'string' && timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minutes} ${ampm}`;
    }
    
    return 'N/A';
  };

  // Enhanced date formatting function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Check if it's today
      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      }
      
      // Check if it's tomorrow
      if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
      }
      
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.log('Error formatting date:', error);
      return 'N/A';
    }
  };

  // Get appointment time from various possible properties
  const getAppointmentTime = (appointment) => {
    // Check multiple possible locations for time data
    const possibleTimePaths = [
      appointment.time, // Direct time property
      appointment.appointmentTime, // Alternative time property
      appointment.timeSlot?.time, // Time from timeSlot
      appointment.timeSlot?.startTime, // Start time from timeSlot
      appointment.showtimes?.[0]?.time, // Time from first showtime
      appointment.showtimes?.[0]?.startTime, // Start time from first showtime
      appointment.showtimes?.[0]?.date, // Date from showtime (will be formatted)
      appointment.date, // Direct date property
      appointment.startTime, // Start time property
    ];
    
    for (const time of possibleTimePaths) {
      if (time) {
        const formattedTime = formatTime(time);
        if (formattedTime !== 'N/A') {
          return formattedTime;
        }
      }
    }
    
    return 'N/A';
  };

  // Get appointment date from various possible properties
  const getAppointmentDate = (appointment) => {
    const possibleDatePaths = [
      appointment.date,
      appointment.appointmentDate,
      appointment.timeSlot?.date,
      appointment.showtimes?.[0]?.date,
      appointment.createdAt,
    ];
    
    for (const date of possibleDatePaths) {
      if (date) {
        const formattedDate = formatDate(date);
        if (formattedDate !== 'N/A') {
          return formattedDate;
        }
      }
    }
    
    return 'N/A';
  };

  // Show loading while checking shop status
  if (checkingShopStatus) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-xl text-gray-700 flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Checking shop status...
        </div>
      </div>
    );
  }

  // Show shop status message if not approved or no shop exists
  if (shopStatus && shopStatus !== "approved") {
    let title, message, icon;
    
    switch (shopStatus) {
      case "none":
        title = "Shop Not Registered";
        message = "You need to register your shop first before setting up time templates.";
        icon = "🏪";
        break;
      case "pending":
        title = "Shop Under Review";
        message = "Your shop registration is under review. Please wait for approval to access this page.";
        icon = "⏳";
        break;
      case "rejected":
        title = "Shop Not Approved";
        message = "Your shop registration was not approved. Please contact support for more information.";
        icon = "❌";
        break;
      default:
        title = "Shop Status Unknown";
        message = "Unable to determine your shop status. Please contact support.";
        icon = "❓";
    }

    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 px-4">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-6xl mb-4">{icon}</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">{title}</h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">{message}</p>
          <div className="flex flex-col space-y-3">
            {shopStatus === "none" && (
              <button
                onClick={() => navigate('/registershop')}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition duration-200 text-sm sm:text-base"
              >
                Register Your Shop
              </button>
            )}
            <button
              onClick={() => navigate('/')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition duration-200 text-sm sm:text-base"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const result = await Swal.fire({
        title: 'Update Status?',
        text: `Change appointment status to ${newStatus}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, update it!'
      });

      if (result.isConfirmed) {
        const response = await api.put(`/appoint/barber-appointments/${appointmentId}/status`, {
          status: newStatus
        });

        if (response.data.success) {
          Swal.fire({
            title: 'Updated!',
            text: response.data.message,
            icon: 'success',
            confirmButtonText: 'OK'
          });

          await fetchBarberData();
          
          // Update local state immediately for better UX
          if (newStatus === 'completed') {
            // Find the appointment in current arrays and move it to past
            const allAppointments = [...todaysAppointments, ...currentAppointments, ...pastAppointments];
            const updatedAppointment = allAppointments.find(apt => apt._id === appointmentId);
            
            if (updatedAppointment) {
              // Update the appointment status
              updatedAppointment.status = 'completed';
              
              // Remove from current arrays
              const newTodaysAppointments = todaysAppointments.filter(apt => apt._id !== appointmentId);
              const newCurrentAppointments = currentAppointments.filter(apt => apt._id !== appointmentId);
              
              // Add to past appointments
              const newPastAppointments = [updatedAppointment, ...pastAppointments];
              
              // Update state
              setTodaysAppointments(newTodaysAppointments);
              setCurrentAppointments(newCurrentAppointments);
              setPastAppointments(newPastAppointments);
              
              // Switch to history tab to show the completed appointment
              setActiveTab('history');
            }
          } else {
            // For other status changes, just refetch data
            fetchBarberData();
          }
        }
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.error || 'Failed to update status',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'cancelled') {
      return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Cancelled</span>;
    }

    if (status === 'completed') {
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Completed</span>;
    }

    if (status === 'confirmed') {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Confirmed</span>;
    }

    return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>;
  };

  const getStatusOptions = (currentStatus) => {
    const allStatuses = [
      { value: 'confirmed', label: 'Confirmed', color: 'text-green-600' },
      { value: 'pending', label: 'Pending', color: 'text-yellow-600' },
      { value: 'cancelled', label: 'Cancelled', color: 'text-red-600' },
      { value: 'completed', label: 'Completed', color: 'text-blue-600' }
    ];

    return allStatuses.filter(status => status.value !== currentStatus);
  };

  // Calculate total earnings
  const calculateTotalEarnings = () => {
    const allAppointments = [...todaysAppointments, ...currentAppointments, ...pastAppointments];
    return allAppointments
      .filter(apt => apt.status === 'completed')
      .reduce((total, apt) => total + (apt.totalAmount || apt.amount || 0), 0);
  };

  const AppointmentCard = ({ appointment, showActions = true }) => {
    const appointmentTime = getAppointmentTime(appointment);
    const appointmentDate = getAppointmentDate(appointment);
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-3 hover:shadow-md transition-shadow">
        {/* Mobile: Stacked layout, Desktop: Horizontal layout */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Customer Info */}
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm sm:text-base">
                  {(appointment.userId?.name || appointment.customerName || 'C')[0].toUpperCase()}
                </span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-semibold text-gray-800 truncate">
                {appointment.userId?.name || appointment.customerName || 'Customer'}
              </h3>
              {appointment.userId?.phone && (
                <p className="text-xs sm:text-sm text-gray-500 truncate">{appointment.userId.phone}</p>
              )}
            </div>
          </div>

          {/* Services - Hidden on small mobile, shown on larger screens */}
          <div className="hidden xs:flex flex-1 px-2 min-w-0">
            <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
              {appointment.showtimes && appointment.showtimes.slice(0, 2).map((showtime, index) => (
                <div key={index} className="flex items-center space-x-1 sm:space-x-2 bg-gray-50 px-2 sm:px-3 py-1 rounded text-xs">
                  <span className="font-medium text-gray-700 truncate max-w-[60px] sm:max-w-[90px]">
                    {showtime.service?.name || 'Service'}
                  </span>
                  <span className="text-green-600 font-semibold text-xs">
                    ₹{showtime.service?.price || 0}
                  </span>
                </div>
              ))}
              {appointment.showtimes && appointment.showtimes.length > 2 && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  +{appointment.showtimes.length - 2} more
                </span>
              )}
            </div>
          </div>

          {/* Date, Time, Status and Actions */}
          <div className="flex items-center justify-between sm:justify-end sm:space-x-3 gap-2">
            {/* Date & Time - Hidden on very small screens */}
            <div className="hidden xs:block text-right">
              <p className="text-xs sm:text-sm font-semibold text-gray-600">
                {appointmentDate}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-black-500">
                {appointmentTime}
              </p>
            </div>

            {/* Status Badge */}
            <div className="flex-shrink-0">
              {getStatusBadge(appointment.status)}
            </div>

            {/* Status Dropdown - Only show for non-completed appointments */}
            {showActions && appointment.status !== 'completed' && (
              <div className="relative flex-shrink-0">
                <select
                  value=""
                  onChange={(e) => updateAppointmentStatus(appointment._id, e.target.value)}
                  className="text-xs sm:text-sm border border-gray-300 rounded px-2 sm:px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Change</option>
                  {getStatusOptions(appointment.status).map(option => (
                    <option key={option.value} value={option.value} className={option.color}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Mobile-only: Services and Date/Time */}
        <div className="xs:hidden mt-2 pt-2 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <div className="flex flex-wrap gap-1">
              {appointment.showtimes && appointment.showtimes.slice(0, 1).map((showtime, index) => (
                <div key={index} className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded text-xs">
                  <span className="font-medium text-gray-700">
                    {showtime.service?.name || 'Service'}
                  </span>
                  <span className="text-green-600 font-semibold">
                    ₹{showtime.service?.price || 0}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">
                {appointmentDate}
              </p>
              <p className="text-xs text-black-500">
                {appointmentTime}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const totalEarnings = calculateTotalEarnings();

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="mb-4 px-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-12 sm:mt-12">Customer Appointments</h1>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Scrollable tabs for mobile */}
          <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
            <button
              onClick={() => setActiveTab('today')}
              className={`flex-shrink-0 py-3 px-4 text-center font-medium text-sm sm:text-base ${
                activeTab === 'today'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Today ({todaysAppointments.length})
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-shrink-0 py-3 px-4 text-center font-medium text-sm sm:text-base ${
                activeTab === 'upcoming'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Upcoming ({currentAppointments.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-shrink-0 py-3 px-4 text-center font-medium text-sm sm:text-base ${
                activeTab === 'history'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              History ({pastAppointments.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-3 sm:p-4">
            {activeTab === 'today' ? (
              <div>
                {todaysAppointments.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <div className="text-gray-400 text-3xl sm:text-4xl mb-2 sm:mb-3">📅</div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-1">No Appointments Today</h3>
                    <p className="text-gray-500 text-sm sm:text-base">You don't have any appointments scheduled for today.</p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {todaysAppointments.map((appointment) => (
                      <AppointmentCard 
                        key={appointment._id} 
                        appointment={appointment} 
                        showActions={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : activeTab === 'upcoming' ? (
              <div>
                {currentAppointments.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <div className="text-gray-400 text-3xl sm:text-4xl mb-2 sm:mb-3">⏰</div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-1">No Upcoming Appointments</h3>
                    <p className="text-gray-500 text-sm sm:text-base">You don't have any upcoming appointments.</p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {currentAppointments.map((appointment) => (
                      <AppointmentCard 
                        key={appointment._id} 
                        appointment={appointment} 
                        showActions={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {pastAppointments.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <div className="text-gray-400 text-3xl sm:text-4xl mb-2 sm:mb-3">📋</div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-1">No Past Appointments</h3>
                    <p className="text-gray-500 text-sm sm:text-base">Your appointment history will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {pastAppointments.map((appointment) => (
                      <AppointmentCard 
                        key={appointment._id} 
                        appointment={appointment} 
                        showActions={false}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Stats - Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-purple-600 text-lg sm:text-xl">📌</span>
              </div>
              <div className="ml-2 sm:ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Today</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.today || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-lg sm:text-xl">⏰</span>
              </div>
              <div className="ml-2 sm:ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.upcoming || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <span className="text-gray-600 text-lg sm:text-xl">✅</span>
              </div>
              <div className="ml-2 sm:ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Completed</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.completed || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-red-600 text-lg sm:text-xl">❌</span>
              </div>
              <div className="ml-2 sm:ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.cancelled || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-lg sm:text-xl">📅</span>
              </div>
              <div className="ml-2 sm:ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.total || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-lg sm:text-xl">💰</span>
              </div>
              <div className="ml-2 sm:ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Earnings</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">₹{totalEarnings}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarberDashboard;











// import React, { useState, useEffect } from 'react';
// import { useLogin } from '../components/LoginContext';
// import { api } from '../utils/api';
// import Swal from 'sweetalert2';
// import { useNavigate } from 'react-router-dom';

// const BarberDashboard = () => {
//   const { user } = useLogin();
//   const navigate = useNavigate();
//   const [currentAppointments, setCurrentAppointments] = useState([]);
//   const [pastAppointments, setPastAppointments] = useState([]);
//   const [todaysAppointments, setTodaysAppointments] = useState([]);
//   const [stats, setStats] = useState({});
//   const [shop, setShop] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('today');
//   const [shopId, setShopId] = useState('');
//   const [shopStatus, setShopStatus] = useState('');
//   const [checkingShopStatus, setCheckingShopStatus] = useState(true);

//   const fetchAppointments = async () => {
//     try {
//       const response = await api.get(`/appoint/barber-appointments/${user.shop._id}`);
//       console.log('Appointments response:', response.data);
//       if (response.data.success) {
//         const todaysAppts = response.data.todaysAppointments || [];
//         const upcomingAppts = response.data.upcomingAppointments || [];
//         const pastAppts = response.data.pastAppointments || [];
//         const stats = response.data.stats || {};
//         const shop = response.data.shop || {};
        
//         console.log('Setting appointments:', {
//           today: todaysAppts.length,
//           upcoming: upcomingAppts.length,
//           past: pastAppts.length,
//           stats: stats,
//           shop: shop
//         });
        
//         setTodaysAppointments(todaysAppts);
//         setCurrentAppointments(upcomingAppts);
//         setPastAppointments(pastAppts);
//         setStats(stats);
//         setShop(shop);
//       }
//     } catch (error) {
//       console.error('Error fetching appointments:', error);
//       Swal.fire({
//         title: 'Error',
//         text: 'Failed to load appointments',
//         icon: 'error',
//         confirmButtonText: 'OK'
//       });
//     }
//   };
  
//   const fetchTodaysAppointments = async () => {
//     try {
//       const response = await api.get(`/appoint/barber-appointments/${user.shop._id}/today`);
//       console.log("Today's Appointments response:", response.data);
//       if (response.data.success) {
//         const todayAppts = response.data.todaysAppointments || [];
//         console.log('Setting today appointments:', todayAppts.length);
//         setTodaysAppointments(todayAppts);
//       }
//     } catch (error) {
//       console.error('Error fetching today\'s appointments:', error);
//     }
//   };

//   const fetchBarberData = async () => {
//     try {
//       setLoading(true);
//       await Promise.all([
//         fetchAppointments(),
//         fetchTodaysAppointments()
//       ]);
//     } catch (error) {
//       console.error('Error fetching barber data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const checkShopStatus = async () => {
//       if (user) {
//         try {
//           const shopRes = await api.get(`/shop/by-email/${user.email}`);
//           const latestShopData = shopRes.data;
//           console.log('Latest shop data:', latestShopData);
//           setShopId(latestShopData._id);

//           const isApproved = latestShopData?.isApproved || false;
//           setShopStatus(isApproved ? 'approved' : 'pending');
//           setShop(latestShopData);
          
//           if (isApproved) {
//             await fetchBarberData();
//           } else {
//             setLoading(false);
//           }
//         } catch (error) {
//           console.error('Error fetching shop data:', error);
//           setShopStatus('none');
//           setLoading(false);
//         }
//       }
//       setCheckingShopStatus(false);
//     };

//     checkShopStatus();
//   }, [user, navigate]);

//   // Show loading while checking shop status
//   if (checkingShopStatus) {
//     return (
//       <div className="flex justify-center items-center h-screen bg-gray-100">
//         <div className="text-xl text-gray-700 flex items-center">
//           <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//           </svg>
//           Checking shop status...
//         </div>
//       </div>
//     );
//   }

//   // Show shop status message if not approved or no shop exists
//   if (shopStatus && shopStatus !== "approved") {
//     let title, message, icon;
    
//     switch (shopStatus) {
//       case "none":
//         title = "Shop Not Registered";
//         message = "You need to register your shop first before setting up time templates.";
//         icon = "🏪";
//         break;
//       case "pending":
//         title = "Shop Under Review";
//         message = "Your shop registration is under review. Please wait for approval to access this page.";
//         icon = "⏳";
//         break;
//       case "rejected":
//         title = "Shop Not Approved";
//         message = "Your shop registration was not approved. Please contact support for more information.";
//         icon = "❌";
//         break;
//       default:
//         title = "Shop Status Unknown";
//         message = "Unable to determine your shop status. Please contact support.";
//         icon = "❓";
//     }

//     return (
//       <div className="flex justify-center items-center h-screen bg-gray-100 px-4">
//         <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md max-w-md w-full text-center">
//           <div className="text-6xl mb-4">{icon}</div>
//           <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">{title}</h2>
//           <p className="text-gray-600 mb-6 text-sm sm:text-base">{message}</p>
//           <div className="flex flex-col space-y-3">
//             {shopStatus === "none" && (
//               <button
//                 onClick={() => navigate('/registershop')}
//                 className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition duration-200 text-sm sm:text-base"
//               >
//                 Register Your Shop
//               </button>
//             )}
//             <button
//               onClick={() => navigate('/')}
//               className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition duration-200 text-sm sm:text-base"
//             >
//               Go to Home
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const updateAppointmentStatus = async (appointmentId, newStatus) => {
//     try {
//       const result = await Swal.fire({
//         title: 'Update Status?',
//         text: `Change appointment status to ${newStatus}?`,
//         icon: 'question',
//         showCancelButton: true,
//         confirmButtonColor: '#3085d6',
//         cancelButtonColor: '#d33',
//         confirmButtonText: 'Yes, update it!'
//       });

//       if (result.isConfirmed) {
//         const response = await api.put(`/appoint/barber-appointments/${appointmentId}/status`, {
//           status: newStatus
//         });

//         if (response.data.success) {
//           Swal.fire({
//             title: 'Updated!',
//             text: response.data.message,
//             icon: 'success',
//             confirmButtonText: 'OK'
//           });

//           await fetchBarberData();
          
//           // Update local state immediately for better UX
//           if (newStatus === 'completed') {
//             // Find the appointment in current arrays and move it to past
//             const allAppointments = [...todaysAppointments, ...currentAppointments, ...pastAppointments];
//             const updatedAppointment = allAppointments.find(apt => apt._id === appointmentId);
            
//             if (updatedAppointment) {
//               // Update the appointment status
//               updatedAppointment.status = 'completed';
              
//               // Remove from current arrays
//               const newTodaysAppointments = todaysAppointments.filter(apt => apt._id !== appointmentId);
//               const newCurrentAppointments = currentAppointments.filter(apt => apt._id !== appointmentId);
              
//               // Add to past appointments
//               const newPastAppointments = [updatedAppointment, ...pastAppointments];
              
//               // Update state
//               setTodaysAppointments(newTodaysAppointments);
//               setCurrentAppointments(newCurrentAppointments);
//               setPastAppointments(newPastAppointments);
              
//               // Switch to history tab to show the completed appointment
//               setActiveTab('history');
//             }
//           } else {
//             // For other status changes, just refetch data
//             fetchBarberData();
//           }
//         }
//       }
//     } catch (error) {
//       console.error('Error updating appointment status:', error);
//       Swal.fire({
//         title: 'Error',
//         text: error.response?.data?.error || 'Failed to update status',
//         icon: 'error',
//         confirmButtonText: 'OK'
//       });
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleDateString('en-US', {
//       weekday: 'short',
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   const formatTime = (dateString) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const getStatusBadge = (status) => {
//     if (status === 'cancelled') {
//       return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Cancelled</span>;
//     }

//     if (status === 'completed') {
//       return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Completed</span>;
//     }

//     if (status === 'confirmed') {
//       return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Confirmed</span>;
//     }

//     return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>;
//   };

//   const getStatusOptions = (currentStatus) => {
//     const allStatuses = [
//       { value: 'confirmed', label: 'Confirmed', color: 'text-green-600' },
//       { value: 'pending', label: 'Pending', color: 'text-yellow-600' },
//       { value: 'cancelled', label: 'Cancelled', color: 'text-red-600' },
//       { value: 'completed', label: 'Completed', color: 'text-blue-600' }
//     ];

//     return allStatuses.filter(status => status.value !== currentStatus);
//   };

//   // Calculate total earnings
//   const calculateTotalEarnings = () => {
//     const allAppointments = [...todaysAppointments, ...currentAppointments, ...pastAppointments];
//     return allAppointments
//       .filter(apt => apt.status === 'completed')
//       .reduce((total, apt) => total + (apt.totalAmount || 0), 0);
//   };

//   const AppointmentCard = ({ appointment, showActions = true }) => (
//     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-3 hover:shadow-md transition-shadow">
//       {/* Mobile: Stacked layout, Desktop: Horizontal layout */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//         {/* Customer Info */}
//         <div className="flex items-center space-x-3 min-w-0 flex-1">
//           <div className="flex-shrink-0">
//             <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
//               <span className="text-blue-600 font-semibold text-sm sm:text-base">
//                 {(appointment.userId?.name || appointment.customerName || 'C')[0].toUpperCase()}
//               </span>
//             </div>
//           </div>
//           <div className="min-w-0 flex-1">
//             <h3 className="text-sm sm:text-base font-semibold text-gray-800 truncate">
//               {appointment.userId?.name || appointment.customerName || 'Customer'}
//             </h3>
//             {appointment.userId?.phone && (
//               <p className="text-xs sm:text-sm text-gray-500 truncate">{appointment.userId.phone}</p>
//             )}
//           </div>
//         </div>

//         {/* Services - Hidden on small mobile, shown on larger screens */}
//         <div className="hidden xs:flex flex-1 px-2 min-w-0">
//           <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
//             {appointment.showtimes && appointment.showtimes.slice(0, 2).map((showtime, index) => (
//               <div key={index} className="flex items-center space-x-1 sm:space-x-2 bg-gray-50 px-2 sm:px-3 py-1 rounded text-xs">
//                 <span className="font-medium text-gray-700 truncate max-w-[60px] sm:max-w-[90px]">
//                   {showtime.service?.name || 'Service'}
//                 </span>
//                 <span className="text-green-600 font-semibold text-xs">
//                   ₹{showtime.service?.price || 0}
//                 </span>
//               </div>
//             ))}
//             {appointment.showtimes && appointment.showtimes.length > 2 && (
//               <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
//                 +{appointment.showtimes.length - 2} more
//               </span>
//             )}
//           </div>
//         </div>

//         {/* Date, Time, Status and Actions */}
//         <div className="flex items-center justify-between sm:justify-end sm:space-x-3 gap-2">
//           {/* Date & Time - Hidden on very small screens */}
//           <div className="hidden xs:block text-right">
//             <p className="text-xs sm:text-sm font-semibold text-gray-600">
//               {appointment.timeSlot?.date ? formatDate(appointment.timeSlot.date) : 'N/A'}
//             </p>
//             <p className="text-xs sm:text-sm font-semibold text-black-500">
//               {appointment.showtimes?.[0]?.date ? formatTime(appointment.showtimes[0].date) : 'N/A'}
//             </p>
//           </div>

//           {/* Status Badge */}
//           <div className="flex-shrink-0">
//             {getStatusBadge(appointment.status)}
//           </div>

//           {/* Status Dropdown - Only show for non-completed appointments */}
//           {showActions && appointment.status !== 'completed' && (
//             <div className="relative flex-shrink-0">
//               <select
//                 value=""
//                 onChange={(e) => updateAppointmentStatus(appointment._id, e.target.value)}
//                 className="text-xs sm:text-sm border border-gray-300 rounded px-2 sm:px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
//               >
//                 <option value="">Change</option>
//                 {getStatusOptions(appointment.status).map(option => (
//                   <option key={option.value} value={option.value} className={option.color}>
//                     {option.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Mobile-only: Services and Date/Time */}
//       <div className="xs:hidden mt-2 pt-2 border-t border-gray-100">
//         <div className="flex justify-between items-center">
//           <div className="flex flex-wrap gap-1">
//             {appointment.showtimes && appointment.showtimes.slice(0, 1).map((showtime, index) => (
//               <div key={index} className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded text-xs">
//                 <span className="font-medium text-gray-700">
//                   {showtime.service?.name || 'Service'}
//                 </span>
//                 <span className="text-green-600 font-semibold">
//                   ₹{showtime.service?.price || 0}
//                 </span>
//               </div>
//             ))}
//           </div>
//           <div className="text-right">
//             <p className="text-xs text-gray-600">
//               {appointment.timeSlot?.date ? formatDate(appointment.timeSlot.date) : 'N/A'}
//             </p>
//             <p className="text-xs text-black-500">
//               {appointment.showtimes?.[0]?.date ? formatTime(appointment.showtimes[0].date) : 'N/A'}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   const totalEarnings = calculateTotalEarnings();

//   return (
//     <div className="min-h-screen bg-gray-50 py-4 sm:py-6">
//       <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
//         {/* Header */}
//         <div className="mb-4 px-1">
//           <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-12 sm:mt-12">Appointments</h1>
//         </div>


//         {/* Tabs */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200">
//           {/* Scrollable tabs for mobile */}
//           <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
//             <button
//               onClick={() => setActiveTab('today')}
//               className={`flex-shrink-0 py-3 px-4 text-center font-medium text-sm sm:text-base ${
//                 activeTab === 'today'
//                   ? 'text-blue-600 border-b-2 border-blue-600'
//                   : 'text-gray-500 hover:text-gray-700'
//               }`}
//             >
//               Today ({todaysAppointments.length})
//             </button>
//             <button
//               onClick={() => setActiveTab('upcoming')}
//               className={`flex-shrink-0 py-3 px-4 text-center font-medium text-sm sm:text-base ${
//                 activeTab === 'upcoming'
//                   ? 'text-blue-600 border-b-2 border-blue-600'
//                   : 'text-gray-500 hover:text-gray-700'
//               }`}
//             >
//               Upcoming ({currentAppointments.length})
//             </button>
//             <button
//               onClick={() => setActiveTab('history')}
//               className={`flex-shrink-0 py-3 px-4 text-center font-medium text-sm sm:text-base ${
//                 activeTab === 'history'
//                   ? 'text-blue-600 border-b-2 border-blue-600'
//                   : 'text-gray-500 hover:text-gray-700'
//               }`}
//             >
//               History ({pastAppointments.length})
//             </button>
//           </div>

//           {/* Tab Content */}
//           <div className="p-3 sm:p-4">
//             {activeTab === 'today' ? (
//               <div>
//                 {todaysAppointments.length === 0 ? (
//                   <div className="text-center py-6 sm:py-8">
//                     <div className="text-gray-400 text-3xl sm:text-4xl mb-2 sm:mb-3">📅</div>
//                     <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-1">No Appointments Today</h3>
//                     <p className="text-gray-500 text-sm sm:text-base">You don't have any appointments scheduled for today.</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-2 sm:space-y-3">
//                     {todaysAppointments.map((appointment) => (
//                       <AppointmentCard 
//                         key={appointment._id} 
//                         appointment={appointment} 
//                         showActions={true}
//                       />
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ) : activeTab === 'upcoming' ? (
//               <div>
//                 {currentAppointments.length === 0 ? (
//                   <div className="text-center py-6 sm:py-8">
//                     <div className="text-gray-400 text-3xl sm:text-4xl mb-2 sm:mb-3">⏰</div>
//                     <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-1">No Upcoming Appointments</h3>
//                     <p className="text-gray-500 text-sm sm:text-base">You don't have any upcoming appointments.</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-2 sm:space-y-3">
//                     {currentAppointments.map((appointment) => (
//                       <AppointmentCard 
//                         key={appointment._id} 
//                         appointment={appointment} 
//                         showActions={true}
//                       />
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <div>
//                 {pastAppointments.length === 0 ? (
//                   <div className="text-center py-6 sm:py-8">
//                     <div className="text-gray-400 text-3xl sm:text-4xl mb-2 sm:mb-3">📋</div>
//                     <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-1">No Past Appointments</h3>
//                     <p className="text-gray-500 text-sm sm:text-base">Your appointment history will appear here.</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-2 sm:space-y-3">
//                     {pastAppointments.map((appointment) => (
//                       <AppointmentCard 
//                         key={appointment._id} 
//                         appointment={appointment} 
//                         showActions={false}
//                       />
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
        
//         {/* Stats - Responsive Grid */}
//         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 mb-4 sm:mb-6">
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
//             <div className="flex items-center">
//               <div className="p-2 bg-purple-100 rounded-lg">
//                 <span className="text-purple-600 text-lg sm:text-xl">📌</span>
//               </div>
//               <div className="ml-2 sm:ml-3">
//                 <p className="text-xs sm:text-sm font-medium text-gray-600">Today</p>
//                 <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.today || 0}</p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
//             <div className="flex items-center">
//               <div className="p-2 bg-green-100 rounded-lg">
//                 <span className="text-green-600 text-lg sm:text-xl">⏰</span>
//               </div>
//               <div className="ml-2 sm:ml-3">
//                 <p className="text-xs sm:text-sm font-medium text-gray-600">Upcoming</p>
//                 <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.upcoming || 0}</p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
//             <div className="flex items-center">
//               <div className="p-2 bg-gray-100 rounded-lg">
//                 <span className="text-gray-600 text-lg sm:text-xl">✅</span>
//               </div>
//               <div className="ml-2 sm:ml-3">
//                 <p className="text-xs sm:text-sm font-medium text-gray-600">Completed</p>
//                 <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.completed || 0}</p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
//             <div className="flex items-center">
//               <div className="p-2 bg-red-100 rounded-lg">
//                 <span className="text-red-600 text-lg sm:text-xl">❌</span>
//               </div>
//               <div className="ml-2 sm:ml-3">
//                 <p className="text-xs sm:text-sm font-medium text-gray-600">Cancelled</p>
//                 <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.cancelled || 0}</p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
//             <div className="flex items-center">
//               <div className="p-2 bg-blue-100 rounded-lg">
//                 <span className="text-blue-600 text-lg sm:text-xl">📅</span>
//               </div>
//               <div className="ml-2 sm:ml-3">
//                 <p className="text-xs sm:text-sm font-medium text-gray-600">Total</p>
//                 <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.total || 0}</p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
//             <div className="flex items-center">
//               <div className="p-2 bg-green-100 rounded-lg">
//                 <span className="text-green-600 text-lg sm:text-xl">💰</span>
//               </div>
//               <div className="ml-2 sm:ml-3">
//                 <p className="text-xs sm:text-sm font-medium text-gray-600">Earnings</p>
//                 <p className="text-lg sm:text-xl font-bold text-gray-900">₹{totalEarnings}</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BarberDashboard;































