import React, { useState, useEffect } from 'react';
import { useLogin } from '../components/LoginContext';
import { api } from '../utils/api';
import Swal from 'sweetalert2';
import {useNavigate} from 'react-router-dom'

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
  const [checkingShopStatus, setCheckingShopStatus] = useState(true); // Add loading state for shop check
  
  const fetchAppointments = async () => {
    try {
      const response = await api.get(`/appoint/barber-appointments/${user.shop._id}`);
      console.log('Appointments response:', response.data);
      if (response.data.success) {
        const todaysAppts = response.data.todaysAppointments || [];
        const upcomingAppts = response.data.upcomingAppointments || []; // Changed from currentAppointments
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
        setCurrentAppointments(upcomingAppts); // This now contains only upcoming (tomorrow+)
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
        // Use todaysAppointments from your API response
        const todayAppts = response.data.todaysAppointments || [];
        console.log('Setting today appointments:', todayAppts.length);
        setTodaysAppointments(todayAppts);
        // setTodaysAppointments(response.data.appointments || []);
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
        // console.log('User data:', user);
        // console.log('User shop ID:', user.shop?._id);
        // console.log('User shop object:', user.shop);
        
        if (user.shop?._id) {
          setShopId(user.shop._id);
          
          try {
            // Fetch the latest shop data to get current status
            const shopRes = await api.get(`/shop/by-email/${user.email}`);
            const latestShopData = shopRes.data;
            
            // console.log('Latest shop data:', latestShopData);
            const isApproved = latestShopData?.isApproved || false;
            setShopStatus(isApproved ? 'approved' : 'pending');
            setShop(latestShopData);
            
            // Only fetch barber data if shop is approved
            if (isApproved) {
              await fetchBarberData();
            } else {
              setLoading(false);
            }
          } catch (error) {
            console.error('Error fetching shop data:', error);
            setShopStatus('pending');
            setLoading(false);
          }
        } else {
          console.error('No shop found in user data');
          setShopStatus('none');
          setLoading(false);
        }
      }
      setCheckingShopStatus(false);
    };

    checkShopStatus();
  }, [user, navigate]);

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

  // Show shop status message if not approved
  if (shopStatus && shopStatus !== "approved") {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-yellow-500 text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {shopStatus === "pending" ? "Shop Under Review" : "Shop Not Approved"}
          </h2>
          <p className="text-gray-600 mb-6">
            {shopStatus === "pending" 
              ? "Your shop registration is under review. Please wait for approval to access the dashboard."
              : "Your shop registration was not approved. Please contact support for more information."}
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition duration-200"
          >
            Go to Home
          </button>
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
          fetchBarberData();
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    // Remove time-based logic, only use status
    if (status === 'cancelled') {
      return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">Cancelled</span>;
    }

    if (status === 'completed') {
      return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">Completed</span>;
    }

    if (status === 'confirmed') {
      return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Confirmed</span>;
    }

    return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">Pending</span>;
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
      .reduce((total, apt) => total + (apt.totalAmount || 0), 0);
  };

  const AppointmentCard = ({ appointment, showActions = true }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 hover:shadow-md transition-shadow">
      {/* Compact Layout - All in one compact row */}
      <div className="flex items-center justify-between">
        {/* Left: Customer Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-base">
                  {(appointment.userId?.name || appointment.customerName || 'C')[0].toUpperCase()}
                </span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-gray-800 truncate">
                {appointment.userId?.name || appointment.customerName || 'Customer'}
              </h3>
              {appointment.userId?.phone && (
                <p className="text-sm text-gray-500 truncate">{appointment.userId.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Middle: Services */}
        <div className="flex-1 px-4 min-w-0">
          <div className="flex flex-wrap gap-2 justify-center">
            {appointment.showtimes && appointment.showtimes.map((showtime, index) => (
              <div key={index} className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded text-sm">
                <span className="font-medium text-gray-700 truncate max-w-[90px]">
                  {showtime.service?.name || 'Service'}
                </span>
                <span className="text-green-600 font-semibold">
                  ₹{showtime.service?.price || 0}
                </span>
                <span className="text-gray-400 text-xs">
                  {showtime.date ? formatTime(showtime.date) : ''}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Status and Actions */}
        <div className="flex items-center space-x-4">
          {/* Appointment Date & Time */}
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-600">
              {appointment.timeSlot?.date ? formatDate(appointment.timeSlot.date) : 'N/A'}
            </p>
            <p className="text-sm font-semibold text-black-500">
              {appointment.showtimes?.[0]?.date ? formatTime(appointment.showtimes[0].date) : 'N/A'}
            </p>
          </div>

          {/* Status Badge */}
          {getStatusBadge(appointment.status)}

          {/* Status Dropdown */}
          {showActions && (
            <div className="relative">
              <select
                value=""
                onChange={(e) => updateAppointmentStatus(appointment._id, e.target.value)}
                className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const totalEarnings = calculateTotalEarnings();

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mt-12">Barber Dashboard</h1>
          {/* <p className="text-gray-600 mt-1 text-base">
            Welcome back, {user?.name}!
          </p>
          {shop.name && (
            <p className="text-gray-500 text-sm mt-1">
              {shop.name} - {shop.city} {shop.address && `- ${shop.address}`}
            </p>
          )} */}
        </div>


        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('today')}
              className={`flex-1 py-4 px-4 text-center font-medium text-base ${
                activeTab === 'today'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Today ({todaysAppointments.length})
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 py-4 px-4 text-center font-medium text-base ${
                activeTab === 'upcoming'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Upcoming ({currentAppointments.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-4 px-4 text-center font-medium text-base ${
                activeTab === 'history'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              History ({pastAppointments.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === 'today' ? (
              <div>
                {todaysAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-3">📅</div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-1">No Appointments Today</h3>
                    <p className="text-gray-500 text-base">You don't have any appointments scheduled for today.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
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
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-3">⏰</div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-1">No Upcoming Appointments</h3>
                    <p className="text-gray-500 text-base">You don't have any upcoming appointments.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
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
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-3">📋</div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-1">No Past Appointments</h3>
                    <p className="text-gray-500 text-base">Your appointment history will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
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
        
        
        {/* Stats - Compact */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-purple-600 text-xl">📌</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-xl font-bold text-gray-900">{stats.today || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-xl">⏰</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-xl font-bold text-gray-900">{stats.upcoming || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <span className="text-gray-600 text-xl">✅</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-xl font-bold text-gray-900">{stats.completed || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-red-600 text-xl">❌</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-xl font-bold text-gray-900">{stats.cancelled || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-xl">📅</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-xl font-bold text-gray-900">{stats.total || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-xl">💰</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Earnings</p>
                <p className="text-xl font-bold text-gray-900">₹{totalEarnings}</p>
              </div>
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

// const BarberDashboard = () => {
//   const { user } = useLogin();
//   const [currentAppointments, setCurrentAppointments] = useState([]);
//   const [pastAppointments, setPastAppointments] = useState([]);
//   const [todaysAppointments, setTodaysAppointments] = useState([]);
//   const [stats, setStats] = useState({});
//   const [shop, setShop] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('today');
//   const [shopId, setShopId] = useState('');

//   useEffect(() => {
//     if (user) {
//       console.log('User data:', user);
//       console.log('User shop ID:', user.shop?._id);
//       console.log('User shop object:', user.shop);
      
//       if (user.shop?._id) {
//         setShopId(user.shop._id);
//         fetchBarberData();
//       } else {
//         console.error('No shop found in user data');
//         Swal.fire({
//           title: 'Error',
//           text: 'No shop associated with your account. Please contact support.',
//           icon: 'error',
//           confirmButtonText: 'OK'
//         });
//       }
//     }
//   }, [user]);

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

//   const fetchAppointments = async () => {
//     try {
//       const response = await api.get(`/appoint/barber-appointments/${user.shop._id}`);
//       console.log('Appointments response:', response.data);
//       if (response.data.success) {
//         setCurrentAppointments(response.data.currentAppointments || []);
//         setPastAppointments(response.data.pastAppointments || []);
//         setStats(response.data.stats || {});
//         setShop(response.data.shop || {});
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
//         setTodaysAppointments(response.data.appointments || []);
//       }
//     } catch (error) {
//       console.error('Error fetching today\'s appointments:', error);
//     }
//   };

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
//           fetchBarberData();
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
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
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

//   const formatDateTime = (dateString) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const getStatusBadge = (status) => {
//     const statusConfig = {
//       confirmed: { color: 'bg-green-100 text-green-800', text: 'Confirmed' },
//       pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
//       cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' },
//       completed: { color: 'bg-blue-100 text-blue-800', text: 'Completed' }
//     };

//     const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
//     return (
//       <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
//         {config.text}
//       </span>
//     );
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
//     <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-4 hover:shadow-lg transition-shadow">
//       {/* Header with Customer Name and Status */}
//       <div className="flex justify-between items-start mb-6">
//         <div className="flex-1">
//           <h3 className="text-xl font-semibold text-gray-800 mb-2">
//             Customer: {appointment.userId?.name || appointment.customerName || 'N/A'}
//           </h3>
//           {appointment.userId?.phone && (
//             <p className="text-gray-600">
//               <span className="font-medium">Phone:</span> {appointment.userId.phone}
//             </p>
//           )}
//         </div>
//         <div className="text-right">
//           {getStatusBadge(appointment.status)}
//           {showActions && (
//             <div className="mt-2 relative">
//               <select
//                 value=""
//                 onChange={(e) => updateAppointmentStatus(appointment._id, e.target.value)}
//                 className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="">Change Status</option>
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

//       {/* Services Section */}
//       <div className="mb-6">
//         <p className="text-sm text-gray-600 font-medium mb-3">Services Booked</p>
//         <div className="space-y-3">
//           {appointment.showtimes && appointment.showtimes.map((showtime, index) => (
//             <div key={index} className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-lg">
//               <div className="flex-1">
//                 <div className="flex items-center space-x-4">
//                   <span className="font-medium text-gray-800">
//                     {showtime.service?.name || 'Hair Service'}
//                   </span>
//                   <span className="text-sm text-gray-500">
//                     {showtime.date ? formatTime(showtime.date) : 'N/A'}
//                   </span>
//                 </div>
//               </div>
//               <div className="text-right">
//                 <span className="font-semibold text-green-600 text-lg">
//                   ₹{showtime.service?.price || 0}
//                 </span>
//               </div>
//             </div>
//           ))}
//         </div>
        
//         {/* Total Amount */}
//         {appointment.totalAmount && (
//           <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-300">
//             <span className="font-semibold text-gray-800 text-lg">Total Amount:</span>
//             <span className="font-bold text-xl text-green-600">₹{appointment.totalAmount}</span>
//           </div>
//         )}
//       </div>

//       {/* Appointment Details in Single Row */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 bg-blue-50 rounded-lg">
//         <div className="text-center">
//           <p className="text-sm text-gray-600 font-medium mb-1">Appointment Date</p>
//           <p className="font-semibold text-gray-800">
//             {appointment.timeSlot?.date ? formatDate(appointment.timeSlot.date) : 'N/A'}
//           </p>
//         </div>

//         <div className="text-center">
//           <p className="text-sm text-gray-600 font-medium mb-1">Booked On</p>
//           <p className="font-semibold text-gray-800">
//             {formatDateTime(appointment.bookedAt)}
//           </p>
//         </div>

//         <div className="text-center">
//           <p className="text-sm text-gray-600 font-medium mb-1">Scheduled Time</p>
//           <div className="space-y-1">
//             {appointment.showtimes && appointment.showtimes.map((showtime, index) => (
//               <div key={index}>
//                 <span className="font-semibold text-gray-800">
//                   {showtime.date ? formatTime(showtime.date) : 'N/A'}
//                 </span>
//               </div>
//             ))}
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
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">Barber Dashboard</h1>
//           <p className="text-gray-600 mt-2">
//             Welcome back, {user?.name}! Manage your salon appointments.
//           </p>
//           {shop.name && (
//             <p className="text-gray-500 mt-1">
//               {shop.name} - {shop.city} {shop.address && `- ${shop.address}`}
//             </p>
//           )}
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//             <div className="flex items-center">
//               <div className="p-3 bg-purple-100 rounded-lg">
//                 <span className="text-purple-600 text-2xl">📌</span>
//               </div>
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-gray-600">Today</p>
//                 <p className="text-2xl font-bold text-gray-900">{stats.today || 0}</p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//             <div className="flex items-center">
//               <div className="p-3 bg-green-100 rounded-lg">
//                 <span className="text-green-600 text-2xl">⏰</span>
//               </div>
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-gray-600">Upcoming</p>
//                 <p className="text-2xl font-bold text-gray-900">{stats.upcoming || 0}</p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//             <div className="flex items-center">
//               <div className="p-3 bg-gray-100 rounded-lg">
//                 <span className="text-gray-600 text-2xl">✅</span>
//               </div>
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-gray-600">Completed</p>
//                 <p className="text-2xl font-bold text-gray-900">{stats.completed || 0}</p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//             <div className="flex items-center">
//               <div className="p-3 bg-red-100 rounded-lg">
//                 <span className="text-red-600 text-2xl">❌</span>
//               </div>
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-gray-600">Cancelled</p>
//                 <p className="text-2xl font-bold text-gray-900">{stats.cancelled || 0}</p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//             <div className="flex items-center">
//               <div className="p-3 bg-blue-100 rounded-lg">
//                 <span className="text-blue-600 text-2xl">📅</span>
//               </div>
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-gray-600">Total</p>
//                 <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//             <div className="flex items-center">
//               <div className="p-3 bg-green-100 rounded-lg">
//                 <span className="text-green-600 text-2xl">💰</span>
//               </div>
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-gray-600">Earnings</p>
//                 <p className="text-2xl font-bold text-gray-900">₹{totalEarnings}</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
//           <div className="flex border-b border-gray-200">
//             <button
//               onClick={() => setActiveTab('today')}
//               className={`flex-1 py-4 px-6 text-center font-medium ${
//                 activeTab === 'today'
//                   ? 'text-blue-600 border-b-2 border-blue-600'
//                   : 'text-gray-500 hover:text-gray-700'
//               }`}
//             >
//               Today's Appointments ({todaysAppointments.length})
//             </button>
//             <button
//               onClick={() => setActiveTab('upcoming')}
//               className={`flex-1 py-4 px-6 text-center font-medium ${
//                 activeTab === 'upcoming'
//                   ? 'text-blue-600 border-b-2 border-blue-600'
//                   : 'text-gray-500 hover:text-gray-700'
//               }`}
//             >
//               Upcoming ({currentAppointments.length})
//             </button>
//             <button
//               onClick={() => setActiveTab('history')}
//               className={`flex-1 py-4 px-6 text-center font-medium ${
//                 activeTab === 'history'
//                   ? 'text-blue-600 border-b-2 border-blue-600'
//                   : 'text-gray-500 hover:text-gray-700'
//               }`}
//             >
//               History ({pastAppointments.length})
//             </button>
//           </div>

//           {/* Tab Content */}
//           <div className="p-6">
//             {activeTab === 'today' ? (
//               <div>
//                 {todaysAppointments.length === 0 ? (
//                   <div className="text-center py-12">
//                     <div className="text-gray-400 text-6xl mb-4">📅</div>
//                     <h3 className="text-xl font-semibold text-gray-600 mb-2">No Appointments Today</h3>
//                     <p className="text-gray-500">You don't have any appointments scheduled for today.</p>
//                   </div>
//                 ) : (
//                   <div>
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
//                   <div className="text-center py-12">
//                     <div className="text-gray-400 text-6xl mb-4">⏰</div>
//                     <h3 className="text-xl font-semibold text-gray-600 mb-2">No Upcoming Appointments</h3>
//                     <p className="text-gray-500">You don't have any upcoming appointments.</p>
//                   </div>
//                 ) : (
//                   <div>
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
//                   <div className="text-center py-12">
//                     <div className="text-gray-400 text-6xl mb-4">📋</div>
//                     <h3 className="text-xl font-semibold text-gray-600 mb-2">No Past Appointments</h3>
//                     <p className="text-gray-500">Your appointment history will appear here.</p>
//                   </div>
//                 ) : (
//                   <div>
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
//       </div>
//     </div>
//   );
// };

// export default BarberDashboard;









