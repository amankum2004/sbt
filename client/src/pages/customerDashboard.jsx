import React, { useState, useEffect } from 'react';
import { useLogin } from '../components/LoginContext';
import { FaMapMarkerAlt } from "react-icons/fa";
import { api } from '../utils/api';
import Swal from 'sweetalert2';

const CustomerDashboard = () => {
  const { user } = useLogin();
  const [currentAppointments, setCurrentAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');

  useEffect(() => {
    if (user?.email) {
      fetchAppointments();
    }
  }, [user]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  // Function to sort appointments by date and time
  const sortAppointmentsByDateTime = (appointments, isReverse = false) => {
    return appointments.sort((a, b) => {
      const getAppointmentDate = (appointment) => {
        return appointment.showtimes && appointment.showtimes.length > 0
          ? appointment.showtimes[0].date
          : appointment.timeSlot?.date;
      };

      const dateA = new Date(getAppointmentDate(a) || 0);
      const dateB = new Date(getAppointmentDate(b) || 0);

      return isReverse ? dateB - dateA : dateA - dateB;
    });
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/appoint/appointments/${user.email}`);

      if (response.data.success) {
        const sortedCurrent = sortAppointmentsByDateTime(response.data.currentAppointments || [], false);
        const sortedPast = sortAppointmentsByDateTime(response.data.pastAppointments || [], true);

        setCurrentAppointments(sortedCurrent);
        setPastAppointments(sortedPast);
      } else {
        throw new Error(response.data.message || 'Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to load appointments',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to cancel this appointment?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, cancel it!'
      });

      if (result.isConfirmed) {
        await api.put(`/appoint/appointments/${appointmentId}/cancel`);

        Swal.fire({
          title: 'Cancelled!',
          text: 'Your appointment has been cancelled.',
          icon: 'success',
          confirmButtonText: 'OK'
        });

        fetchAppointments();
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to cancel appointment',
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
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusBadge = (status, appointment) => {
    const now = new Date();
    const appointmentDate = appointment.showtimes && appointment.showtimes[0]
      ? appointment.showtimes[0].date
      : appointment.timeSlot?.date;

    const appointmentDateTime = new Date(appointmentDate);

    if (status === 'cancelled') {
      return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Cancelled</span>;
    }

    if (appointmentDateTime < now) {
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Completed</span>;
    }

    if (status === 'confirmed') {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Confirmed</span>;
    }

    return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>;
  };

  // Function to generate Google Maps directions URL
  const getGoogleMapsUrl = (shop) => {
    if (!shop) return '#';

    const { street, city, state, pin, lat, lng } = shop;

    if (lat && lng) {
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }

    const address = `${street}, ${city}, ${state} ${pin}`;
    const encodedAddress = encodeURIComponent(address);
    return `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
  };

  // Function to format complete address
  const getCompleteAddress = (shop) => {
    if (!shop) return 'Location not available';

    const { street, city, district, state, pin } = shop;
    const addressParts = [];

    if (street) addressParts.push(street);
    if (city) addressParts.push(city);
    if (district && district !== city) addressParts.push(district);
    if (state) addressParts.push(state);
    if (pin) addressParts.push(pin);

    return addressParts.length > 0 ? addressParts.join(', ') : 'Location not available';
  };

  const AppointmentCard = ({ appointment, isCurrent }) => {
    const shop = appointment.shopId;
    const googleMapsUrl = getGoogleMapsUrl(shop);
    const completeAddress = getCompleteAddress(shop);

    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6 mb-4 hover:shadow-lg transition-shadow">
        {/* Header Section - Stacked on mobile, horizontal on desktop */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4 sm:mb-6">
          {/* Shop Info */}
          <div className="flex-1">
            {/* Shop Name and Status */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                {shop?.shopname || 'Salon Name Not Available'}
              </h3>
              
              {/* Shop Status Badge */}
              {shop?.status && (
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                  shop.status === 'open' 
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : shop.status === 'break'
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {shop.status === 'open' ? '✅ Open' : 
                  shop.status === 'break' ? '⏸️ On Break' : '❌ Closed'}
                </span>
              )}
            </div>

            <div className="space-y-2">
              {/* Shop Owner Name */}
              {shop?.name && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600 text-sm sm:text-base">
                    <span className="font-medium">Owner:</span> {shop.name}
                  </span>
                </div>
              )}

              {/* Contact Information */}
              {shop?.phone && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600 text-sm sm:text-base">
                    <span className="font-medium">Phone:</span> {shop.phone}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Address & Directions */}
          <div className="flex-1 sm:text-right">
            <div className="text-gray-600">
              <div className="flex items-start sm:items-center sm:justify-end space-x-2">
                <FaMapMarkerAlt className="text-lg sm:text-xl text-blue-600 hover:text-blue-800 mt-1 sm:mt-0 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm mb-1 line-clamp-2">{completeAddress}</p>
                  {completeAddress !== 'Location not available' && (
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium transition-colors"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707.293A1 1 0 002 1v14a1 1 0 00.293.707l4 4A1 1 0 007 20h10a1 1 0 001-1V1a1 1 0 00-1-1H7a1 1 0 00-.707.293l-4 4z" clipRule="evenodd" />
                      </svg>
                      Get Directions
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Status Badge */}
          <div className="sm:ml-4 self-start sm:self-auto">
            {getStatusBadge(appointment.status, appointment)}
          </div>
        </div>

        {/* Appointment Details - Stacked on mobile, grid on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
          {/* Booked On */}
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Booked On</p>
            <p className="text-sm sm:text-base font-semibold text-gray-800">
              {formatDateTime(appointment.bookedAt)}
            </p>
          </div>

          {/* Appointment Date */}
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Appointment Date</p>
            <p className="text-sm sm:text-base font-semibold text-gray-800">
              {appointment.timeSlot?.date ? formatDate(appointment.timeSlot.date) : 'N/A'}
            </p>
          </div>

          {/* Scheduled Time(s) */}
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Scheduled Time</p>
            <div className="space-y-1">
              {appointment.showtimes && appointment.showtimes.length > 0 ? (
                appointment.showtimes.map((showtime, index) => (
                  <div key={index} className="flex items-center justify-center space-x-2">
                    <span className="text-sm sm:text-base font-semibold text-gray-800">
                      {showtime.date ? formatTime(showtime.date) : 'N/A'}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-gray-500 text-xs sm:text-sm">No times scheduled</span>
              )}
            </div>
          </div>

          {/* Cancel Appointment Button */}
          <div className="text-center flex items-center justify-center">
            {isCurrent && appointment.status === 'confirmed' ? (
              <button
                onClick={() => cancelAppointment(appointment._id)}
                className="px-3 sm:px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-xs sm:text-sm font-medium w-full max-w-[120px] sm:max-w-[150px]"
              >
                Cancel
              </button>
            ) : (
              <div className="h-10 flex items-center justify-center">
                <span className="text-gray-400 text-xs sm:text-sm">Not available</span>
              </div>
            )}
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

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-12 sm:mt-12">My Appointments</h1>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('current')}
              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-center font-medium text-sm sm:text-base ${
                activeTab === 'current'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Upcoming ({currentAppointments.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-center font-medium text-sm sm:text-base ${
                activeTab === 'history'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              History ({pastAppointments.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {activeTab === 'current' ? (
              <div>
                {currentAppointments.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="text-gray-400 text-4xl sm:text-6xl mb-3 sm:mb-4">📅</div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-1 sm:mb-2">No Current Appointments</h3>
                    <p className="text-gray-500 text-sm sm:text-base">You don't have any upcoming appointments.</p>
                  </div>
                ) : (
                  <div>
                    {currentAppointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment._id}
                        appointment={appointment}
                        isCurrent={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {pastAppointments.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="text-gray-400 text-4xl sm:text-6xl mb-3 sm:mb-4">📋</div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-1 sm:mb-2">No Past Appointments</h3>
                    <p className="text-gray-500 text-sm sm:text-base">Your appointment history will appear here.</p>
                  </div>
                ) : (
                  <div>
                    {pastAppointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment._id}
                        appointment={appointment}
                        isCurrent={false}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-xl sm:text-2xl">📅</span>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{currentAppointments.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <span className="text-green-600 text-xl sm:text-2xl">✅</span>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Completed</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {pastAppointments.filter(apt =>
                    new Date(apt.timeSlot?.date) < new Date() && apt.status !== 'cancelled'
                  ).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-red-100 rounded-lg">
                <span className="text-red-600 text-xl sm:text-2xl">❌</span>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {pastAppointments.filter(apt => apt.status === 'cancelled').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;








// import React, { useState, useEffect } from 'react';
// import { useLogin } from '../components/LoginContext';
// import { FaMapMarkerAlt } from "react-icons/fa";
// import { api } from '../utils/api';
// import Swal from 'sweetalert2';
// // import CustomerNotifications from '../components/CustomerNotification'; // Add this import

// const CustomerDashboard = () => {
//   const { user } = useLogin();
//   const [currentAppointments, setCurrentAppointments] = useState([]);
//   const [pastAppointments, setPastAppointments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('current');

//   useEffect(() => {
//     if (user?.email) {
//       fetchAppointments();
//     }
//   }, [user]);

//   // Request notification permission
//   useEffect(() => {
//     if ('Notification' in window && Notification.permission === 'default') {
//       Notification.requestPermission().then(permission => {
//         console.log('Notification permission:', permission);
//       });
//     }
//   }, []);

//   // Function to sort appointments by date and time
//   const sortAppointmentsByDateTime = (appointments, isReverse = false) => {
//     return appointments.sort((a, b) => {
//       // Use showtime date for comparison, fallback to timeSlot date
//       const getAppointmentDate = (appointment) => {
//         return appointment.showtimes && appointment.showtimes.length > 0
//           ? appointment.showtimes[0].date
//           : appointment.timeSlot?.date;
//       };

//       const dateA = new Date(getAppointmentDate(a) || 0);
//       const dateB = new Date(getAppointmentDate(b) || 0);

//       // For reverse order (most recent first), use dateB - dateA
//       // For normal order (chronological), use dateA - dateB
//       return isReverse ? dateB - dateA : dateA - dateB;
//     });
//   };

//   const fetchAppointments = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get(`/appoint/appointments/${user.email}`);

//       if (response.data.success) {
//         // Sort current appointments in chronological order (earliest first)
//         const sortedCurrent = sortAppointmentsByDateTime(response.data.currentAppointments || [], false);

//         // Sort past appointments in reverse chronological order (most recent first)
//         const sortedPast = sortAppointmentsByDateTime(response.data.pastAppointments || [], true);

//         setCurrentAppointments(sortedCurrent);
//         setPastAppointments(sortedPast);
//       } else {
//         throw new Error(response.data.message || 'Failed to fetch appointments');
//       }
//     } catch (error) {
//       console.error('Error fetching appointments:', error);
//       Swal.fire({
//         title: 'Error',
//         text: error.response?.data?.message || 'Failed to load appointments',
//         icon: 'error',
//         confirmButtonText: 'OK'
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const cancelAppointment = async (appointmentId) => {
//     try {
//       const result = await Swal.fire({
//         title: 'Are you sure?',
//         text: 'Do you want to cancel this appointment?',
//         icon: 'warning',
//         showCancelButton: true,
//         confirmButtonColor: '#d33',
//         cancelButtonColor: '#3085d6',
//         confirmButtonText: 'Yes, cancel it!'
//       });

//       if (result.isConfirmed) {
//         await api.put(`/appoint/appointments/${appointmentId}/cancel`);

//         Swal.fire({
//           title: 'Cancelled!',
//           text: 'Your appointment has been cancelled.',
//           icon: 'success',
//           confirmButtonText: 'OK'
//         });

//         fetchAppointments(); // Refresh the list
//       }
//     } catch (error) {
//       console.error('Error cancelling appointment:', error);
//       Swal.fire({
//         title: 'Error',
//         text: error.response?.data?.message || 'Failed to cancel appointment',
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
//       minute: '2-digit',
//       hour12: true
//     });
//   };

//   const formatDateTime = (dateString) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true
//     });
//   };

//   const getStatusBadge = (status, appointment) => {
//     const now = new Date();

//     // Use the showtime date instead of timeSlot date for comparison
//     const appointmentDate = appointment.showtimes && appointment.showtimes[0]
//       ? appointment.showtimes[0].date
//       : appointment.timeSlot?.date;

//     const appointmentDateTime = new Date(appointmentDate);

//     if (status === 'cancelled') {
//       return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">Cancelled</span>;
//     }

//     if (appointmentDateTime < now) {
//       return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">Completed</span>;
//     }

//     if (status === 'confirmed') {
//       return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Confirmed</span>;
//     }

//     return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">Pending</span>;
//   };

//   // Function to generate Google Maps directions URL
//   const getGoogleMapsUrl = (shop) => {
//     if (!shop) return '#';

//     const { street, city, state, pin, lat, lng } = shop;

//     // If we have coordinates, use them for precise location
//     if (lat && lng) {
//       return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
//     }

//     // Otherwise use address
//     const address = `${street}, ${city}, ${state} ${pin}`;
//     const encodedAddress = encodeURIComponent(address);
//     return `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
//   };

//   // Function to format complete address
//   const getCompleteAddress = (shop) => {
//     if (!shop) return 'Location not available';

//     const { street, city, district, state, pin } = shop;
//     const addressParts = [];

//     if (street) addressParts.push(street);
//     if (city) addressParts.push(city);
//     if (district && district !== city) addressParts.push(district);
//     if (state) addressParts.push(state);
//     if (pin) addressParts.push(pin);

//     return addressParts.length > 0 ? addressParts.join(', ') : 'Location not available';
//   };

//   const AppointmentCard = ({ appointment, isCurrent }) => {
//     const shop = appointment.shopId;
//     const googleMapsUrl = getGoogleMapsUrl(shop);
//     const completeAddress = getCompleteAddress(shop);

//     return (
//       <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-4 hover:shadow-lg transition-shadow">
//         {/* Header Section */}
//         <div className="flex justify-between items-start mb-6">
//           {/* Left Side - Shop Info */}
//           <div className="flex-1">
//             {/* Shop Name and Status in same row */}
//             <div className="flex items-center gap-6 mb-3">
//               <h3 className="text-xl font-semibold text-gray-800">
//                 {shop?.shopname || 'Salon Name Not Available'}
//               </h3>
              
//               {/* Shop Status Badge - Now on the right side of shop name */}
//               {shop?.status && (
//                 <span className={`px-3 py-1 rounded-full text-sm font-medium ${
//                   shop.status === 'open' 
//                     ? 'bg-green-100 text-green-800 border border-green-200'
//                     : shop.status === 'break'
//                     ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
//                     : 'bg-red-100 text-red-800 border border-red-200'
//                 }`}>
//                   {shop.status === 'open' ? '✅ Open' : 
//                   shop.status === 'break' ? '⏸️ On Break' : '❌ Closed'}
//                 </span>
//               )}
//             </div>

//             <div className="space-y-2">
//               {/* Shop Owner Name */}
//               {shop?.name && (
//                 <div className="flex items-center">
//                   <svg className="w-4 h-4 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
//                   </svg>
//                   <span className="text-gray-600">
//                     <span className="font-medium">Owner:</span> {shop.name}
//                   </span>
//                 </div>
//               )}

//               {/* Contact Information */}
//               {shop?.phone && (
//                 <div className="flex items-center">
//                   <svg className="w-4 h-4 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" clipRule="evenodd" />
//                   </svg>
//                   <span className="text-gray-600">
//                     <span className="font-medium">Phone:</span> {shop.phone}
//                   </span>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Right Side - Address & Directions */}
//           <div className="flex-1 text-right">
//             <div className="text-gray-600">
//               <div className="flex items-center justify-end space-x-2 mb-2">
//                 <FaMapMarkerAlt className="text-xl text-blue-600 hover:text-blue-800" />
//                 <div>
//                   <p className="mb-1 text-sm">{completeAddress}</p>
//                   {completeAddress !== 'Location not available' && (
//                     <a
//                       href={googleMapsUrl}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
//                     >
//                       <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707.293A1 1 0 002 1v14a1 1 0 00.293.707l4 4A1 1 0 007 20h10a1 1 0 001-1V1a1 1 0 00-1-1H7a1 1 0 00-.707.293l-4 4z" clipRule="evenodd" />
//                       </svg>
//                       Get Directions
//                     </a>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Appointment Status Badge - This stays on the far right */}
//           <div className="ml-4">
//             {getStatusBadge(appointment.status, appointment)}
//           </div>
//         </div>

//         {/* Rest of your appointment details */}
//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
//           {/* Booked On */}
//           <div className="text-center">
//             <p className="text-sm text-gray-600 font-medium mb-1">Booked On</p>
//             <p className="font-semibold text-gray-800">
//               {formatDateTime(appointment.bookedAt)}
//             </p>
//           </div>

//           {/* Appointment Date */}
//           <div className="text-center">
//             <p className="text-sm text-gray-600 font-medium mb-1">Appointment Date</p>
//             <p className="font-semibold text-gray-800">
//               {appointment.timeSlot?.date ? formatDate(appointment.timeSlot.date) : 'N/A'}
//             </p>
//           </div>

//           {/* Scheduled Time(s) */}
//           <div className="text-center">
//             <p className="text-sm text-gray-600 font-medium mb-1">Scheduled Time(s)</p>
//             <div className="space-y-1">
//               {appointment.showtimes && appointment.showtimes.length > 0 ? (
//                 appointment.showtimes.map((showtime, index) => (
//                   <div key={index} className="flex items-center justify-center space-x-2">
//                     <span className="font-semibold text-gray-800">
//                       {showtime.date ? formatTime(showtime.date) : 'N/A'}
//                     </span>
//                     <span className={`px-2 py-1 rounded text-xs ${showtime.showtimeId?.is_booked
//                         ? 'bg-green-100 text-green-800'
//                         : 'bg-gray-100 text-gray-800'
//                       }`}>
//                       {/* {showtime.showtimeId?.is_booked ? 'Booked' : 'Available'} */}
//                     </span>
//                   </div>
//                 ))
//               ) : (
//                 <span className="text-gray-500 text-sm">No times scheduled</span>
//               )}
//             </div>
//           </div>

//           {/* Cancel Appointment Button */}
//           <div className="text-center flex items-center justify-center">
//             {isCurrent && appointment.status === 'confirmed' ? (
//               <button
//                 onClick={() => cancelAppointment(appointment._id)}
//                 className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium w-full max-w-[150px]"
//               >
//                 Cancel Appointment
//               </button>
//             ) : (
//               <div className="h-10 flex items-center justify-center">
//                 <span className="text-gray-400 text-sm">Not available</span>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
      
//       <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-3xl font-bold text-gray-900 mt-12">My Appointments</h1>
//           {/* <p className="text-gray-600 mt-2">Manage your current and past appointments</p> */}
//         </div>

//         {/* Tabs */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
//           <div className="flex border-b border-gray-200">
//             <button
//               onClick={() => setActiveTab('current')}
//               className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'current'
//                   ? 'text-blue-600 border-b-2 border-blue-600'
//                   : 'text-gray-500 hover:text-gray-700'
//                 }`}
//             >
//               Upcoming Appointments ({currentAppointments.length})
//             </button>
//             <button
//               onClick={() => setActiveTab('history')}
//               className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'history'
//                   ? 'text-blue-600 border-b-2 border-blue-600'
//                   : 'text-gray-500 hover:text-gray-700'
//                 }`}
//             >
//               Appointment History ({pastAppointments.length})
//             </button>
//           </div>

//           {/* Tab Content */}
//           <div className="p-6">
//             {activeTab === 'current' ? (
//               <div>
//                 {currentAppointments.length === 0 ? (
//                   <div className="text-center py-12">
//                     <div className="text-gray-400 text-6xl mb-4">📅</div>
//                     <h3 className="text-xl font-semibold text-gray-600 mb-2">No Current Appointments</h3>
//                     <p className="text-gray-500">You don't have any upcoming appointments.</p>
//                   </div>
//                 ) : (
//                   <div>
//                     {currentAppointments.map((appointment) => (
//                       <AppointmentCard
//                         key={appointment._id}
//                         appointment={appointment}
//                         isCurrent={true}
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
//                         isCurrent={false}
//                       />
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//             <div className="flex items-center">
//               <div className="p-3 bg-blue-100 rounded-lg">
//                 <span className="text-blue-600 text-2xl">📅</span>
//               </div>
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-gray-600">Upcoming</p>
//                 <p className="text-2xl font-bold text-gray-900">{currentAppointments.length}</p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//             <div className="flex items-center">
//               <div className="p-3 bg-green-100 rounded-lg">
//                 <span className="text-green-600 text-2xl">✅</span>
//               </div>
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-gray-600">Completed</p>
//                 <p className="text-2xl font-bold text-gray-900">
//                   {pastAppointments.filter(apt =>
//                     new Date(apt.timeSlot?.date) < new Date() && apt.status !== 'cancelled'
//                   ).length}
//                 </p>
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
//                 <p className="text-2xl font-bold text-gray-900">
//                   {pastAppointments.filter(apt => apt.status === 'cancelled').length}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CustomerDashboard;






