import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { useLogin } from '../components/LoginContext';
import { api } from '../utils/api';
import { useLoading } from "../components/Loading";
import RatingSummary from "../components/RatingSummary";
import ReviewList from "../components/ReviewList";
import { Link } from 'react-router-dom';

const DateTimeSelection = () => {
  const { showLoading, hideLoading } = useLoading();
  const { shopId } = useParams();
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedShowtimes, setSelectedShowtimes] = useState([]);
  const [showtimeServices, setShowtimeServices] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [shopDetails, setShopDetails] = useState({});
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const { user } = useLogin();

  useEffect(() => {
    fetchTimeSlots();
    fetchShopDetails();
    fetchCustomerEmail();
    
    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    // Poll for time slot updates every 30 seconds
    const slotTimer = setInterval(() => {
    fetchTimeSlots(true);
  }, 30000); // Refresh every 30 seconds

    return () => clearInterval(timer);
  }, [shopId]);

  const fetchTimeSlots = async () => {
    showLoading('Fetching details...');
    try {
      const response = await api.get(`/time/shops/${shopId}/available`);
      const slots = response.data || [];

      // Sort timeSlots by date (ascending)
      slots.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Then, for each timeSlot, sort its showtimes by time
      const sortedSlots = slots.map(slot => ({
        ...slot,
        showtimes: slot.showtimes.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        ),
      }));

      setTimeSlots(sortedSlots);
      
      // Set today's date as default selected date
      const today = new Date().toISOString().split('T')[0];
      const todayTimeSlot = sortedSlots.find(slot => 
        new Date(slot.date).toDateString() === new Date().toDateString()
      );
      
      if (todayTimeSlot) {
        setSelectedDate(todayTimeSlot.date);
      } else if (sortedSlots.length > 0) {
        // If today is not available, select the first available date
        setSelectedDate(sortedSlots[0].date);
      }
    } catch (error) {
      setTimeSlots([]);
    } finally {
      hideLoading();
    }
  };

  const fetchShopDetails = async () => {
    showLoading('Fetching details...');
    try {
      const response = await api.get(`/shop/shoplists/${shopId}`);
      setShopDetails(response.data || {});
    } catch (error) {
      console.error('Failed to fetch shop details:', error.response ? error.response.data : error.message);
      setShopDetails({});
    } finally {
      hideLoading();
    }
  };

  const fetchCustomerEmail = async () => {
    setCustomerEmail(user.email);
    setCustomerName(user.name);
  };

  // Check if a time slot is in the past (for today's date only)
  const isTimeSlotInPast = (showtimeDate) => {
    try {
      const today = new Date();
      const slotDate = new Date(showtimeDate);
      
      // Only check for today's dates
      if (slotDate.toDateString() !== today.toDateString()) {
        return false;
      }
      
      // Compare the time slot with current time
      return slotDate < currentTime;
    } catch (error) {
      console.error('Error checking if time slot is in past:', error);
      return false;
    }
  };

  const handleShowtimeSelect = (timeSlotId, showtimeId, showtimeDate) => {
    // Check if the slot is in the past
    if (isTimeSlotInPast(showtimeDate)) {
      return; // Don't allow selection of past time slots
    }

    const isAlreadySelected = selectedShowtimes.some(slot => slot.showtimeId === showtimeId);
    if (isAlreadySelected) {
      const updatedShowtimes = selectedShowtimes.filter(slot => slot.showtimeId !== showtimeId);
      const { [showtimeId]: removedService, ...remainingServices } = showtimeServices;
      setSelectedShowtimes(updatedShowtimes);
      setShowtimeServices(remainingServices);
      setTotalAmount(totalAmount - parseInt(removedService?.price || 0));
    } else {
      setSelectedShowtimes([...selectedShowtimes, { timeSlotId, showtimeId, showtimeDate }]);
    }
  };

  const handleServiceSelect = (showtimeId, service) => {
    const updatedServices = { ...showtimeServices, [showtimeId]: service };
    setShowtimeServices(updatedServices);
    const servicePrices = Object.values(updatedServices).map(service => parseInt(service.price));
    setTotalAmount(servicePrices.reduce((sum, price) => sum + price, 0));
  };

  const handleBookAppointment = () => {
    const unselectedServices = selectedShowtimes.filter(
      ({ showtimeId }) => !showtimeServices[showtimeId]
    );

    if (selectedShowtimes.length === 0) {
      alert("Please select at least one time slot before booking.");
      return;
    }

    if (unselectedServices.length > 0) {
      alert("Please select a service for each selected time slot.");
      return;
    }

    navigate('/payment', {
      state: {
        selectedShowtimes,
        totalAmount,
        customerEmail,
        customerName,
        shopName: shopDetails.shopname,
        shopPhone: shopDetails.phone,
        location: `${shopDetails.street}, ${shopDetails.city}, ${shopDetails.district}, ${shopDetails.state} - ${shopDetails.pin}`,
        shopId: shopId,
        showtimeServices,
      },
    });
  };

  useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // User returned to the page, refresh slots
      fetchTimeSlots();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, []);

  // Calendar functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getAvailableDates = () => {
    return timeSlots.map(slot => new Date(slot.date).toDateString());
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const isDateAvailable = (date) => {
    const dateString = new Date(date).toDateString();
    return getAvailableDates().includes(dateString);
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(date) < today;
  };

  const formatDateDisplay = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateShort = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      days.push(date);
    }

    return days;
  };

  const handleDateSelect = (date) => {
    if (isDateAvailable(date) && !isPastDate(date)) {
      setSelectedDate(date.toISOString());
      setShowCalendar(false);
    }
  };

  const calendarDays = generateCalendarDays();
  const availableDates = getAvailableDates();
  
  // FIX: Ensure selectedDate is properly converted to string for comparison
  const selectedDateString = selectedDate ? new Date(selectedDate).toDateString() : null;
  const selectedTimeSlot = timeSlots.find(slot => 
    new Date(slot.date).toDateString() === selectedDateString
  );

  // Get button styling based on slot status
  const getTimeSlotButtonStyle = (showtime) => {
    if (showtime.is_booked) {
      return 'bg-red-400 cursor-not-allowed opacity-60';
    }
    
    if (isTimeSlotInPast(showtime.date)) {
      return 'bg-gray-400 cursor-not-allowed opacity-50';
    }
    
    if (selectedShowtimes.some(slot => slot.showtimeId === showtime._id)) {
      return 'bg-orange-500 shadow-md';
    }
    
    return 'bg-green-500 hover:bg-green-600 shadow-sm';
  };

  // Get button text based on slot status
  const getTimeSlotButtonText = (showtime) => {
    if (showtime.is_booked) {
      return 'Booked';
    }
    
    if (isTimeSlotInPast(showtime.date)) {
      return 'Past';
    }
    
    return new Date(showtime.date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-4 mx-auto max-w-6xl">
      <h2 className="text-2xl font-bold mb-6 text-center">Book Your Time Slot</h2>
      
      {/* Current Time Display */}
      {/* <div className="text-center mb-4">
        <div className="inline-block bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
          <p className="text-sm text-blue-800 font-medium">
            Current Time: {currentTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            })}
          </p>
          <p className="text-xs text-blue-600">
            Past time slots for today are disabled automatically
          </p>
        </div>
      </div> */}

      {/*  REVIEWS - Add to your shop details page */}
      <div className="mt-8">
        <RatingSummary
          averageRating={shopDetails.averageRating}
          totalReviews={shopDetails.totalReviews}
          ratingBreakdown={shopDetails.ratingBreakdown}
        />
        
        {/* <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Recent Reviews</h3>
            <Link
              to={`/shop/${shopId}/reviews`}
              className="text-blue-600 hover:text-blue-800"
            >
              View All Reviews
            </Link>
          </div>
          <ReviewList shopId={shopId} limit={3} />
        </div> */}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mt-2">
        {/* Left - Calendar & Services */}
        <div className="w-full lg:w-2/5 bg-white rounded-lg p-4 border border-gray-300 shadow-sm">
          {/* Date Selector Button */}
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2 text-gray-700 text-center">Select Date</h3>
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors flex justify-between items-center"
            >
              <span className="font-medium">
                {selectedDate ? formatDateShort(selectedDate) : "Select a date"}
              </span>
              <span className="text-gray-500">▼</span>
            </button>
          </div>

          {/* Calendar Dropdown */}
          {showCalendar && (
            <div className="mb-4 border border-gray-200 rounded-lg p-4 bg-white shadow-lg">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  ‹
                </button>
                <h4 className="text-lg font-semibold">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h4>
                <button 
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  ›
                </button>
              </div>

              {/* Calendar Days Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="h-10"></div>;
                  }

                  const isAvailable = isDateAvailable(date);
                  const isPast = isPastDate(date);
                  const isSelected = selectedDateString && date.toDateString() === selectedDateString;
                  const isToday = date.toDateString() === new Date().toDateString();

                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => handleDateSelect(date)}
                      disabled={!isAvailable || isPast}
                      className={`
                        h-10 rounded text-sm font-medium transition-colors
                        ${isSelected 
                          ? 'bg-blue-500 text-white' 
                          : isToday
                            ? 'bg-blue-100 text-blue-700 border border-blue-300'
                            : isAvailable && !isPast
                              ? 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }
                      `}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Date Display */}
          {selectedDate && (
            <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-blue-800 text-center font-medium">
                {formatDateDisplay(selectedDate)}
              </p>
            </div>
          )}

          {/* Available Services */}
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-2 text-gray-700 text-center">Available Services</h3>
            {shopDetails.services ? (
              <ul className="space-y-0">
                {shopDetails.services.map((service) => (
                  <li key={service.service} className="flex justify-between text-sm p-1 hover:bg-gray-50 rounded">
                    <span>{service.service}</span>
                    <span className="font-semibold">₹{service.price}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center">No services available.</p>
            )}
          </div>
        </div>

        {/* Middle - Time Slots for Selected Date */}
        <div className="w-full lg:w-2/5 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {selectedDate && `${formatDateDisplay(selectedDate)}`}
          </h3>
          
          {selectedTimeSlot ? (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              {/* Time Slot Legend */}
              <div className="flex flex-wrap gap-3 mb-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-400 rounded"></div>
                  <span>Booked</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-400 rounded"></div>
                  <span>Past Time</span>
                </div>
              </div>

              {/* Fixed 5 columns grid for all screen sizes */}
              <div className="grid grid-cols-5 gap-2">
                {selectedTimeSlot.showtimes.map((showtime) => {
                  const isPast = isTimeSlotInPast(showtime.date);
                  const isDisabled = showtime.is_booked || isPast;
                  
                  return (
                    <button
                      key={showtime._id}
                      className={`px-2 py-3 rounded-lg text-white text-xs font-medium transition-all duration-200 min-w-[60px] ${getTimeSlotButtonStyle(showtime)}`}
                      disabled={isDisabled}
                      onClick={() => handleShowtimeSelect(selectedTimeSlot._id, showtime._id, showtime.date)}
                      title={isPast ? "This time slot has passed" : showtime.is_booked ? "This slot is already booked" : "Click to select"}
                    >
                      {getTimeSlotButtonText(showtime)}
                    </button>
                  );
                })}
              </div>
              
              {/* Info message for today's date */}
              {/* {selectedDateString === new Date().toDateString() && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                  <p>Past time slots for today are automatically disabled based on current time.</p>
                </div>
              )} */}
            </div>
          ) : selectedDate ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">No available time slots for this date.</p>
              <p className="text-sm text-gray-400 mt-1">Please select another date.</p>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">Please select a date to view available time slots.</p>
            </div>
          )}
        </div>

        {/* Right - Selected Services */}
        <div className="w-full lg:w-1/5 bg-white p-4 border border-gray-300 rounded-lg shadow-sm sticky top-4">
          <h3 className="text-lg font-semibold mb-3 text-center">Selected Services</h3>
          
          {selectedShowtimes.length > 0 ? (
            <>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {selectedShowtimes.map(({ showtimeId, showtimeDate }) => (
                  <div key={showtimeId} className="border-b pb-2">
                    <p className="text-xs font-medium text-gray-700 mb-1">
                      {new Date(showtimeDate).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {shopDetails.services ? (
                      <select
                        onChange={(e) =>
                          handleServiceSelect(showtimeId, shopDetails.services.find(service => service.service === e.target.value))
                        }
                        value={showtimeServices[showtimeId]?.service || ""}
                        className="p-1 w-full border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Service</option>
                        {shopDetails.services.map((service) => (
                          <option key={service.service} value={service.service}>
                            {service.service} - ₹{service.price}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-xs text-red-500">No services available</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-gray-800">Total Amount:</span>
                  <span className="text-lg font-bold text-green-600">₹{totalAmount}</span>
                </div>
                <button
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  onClick={handleBookAppointment}
                  disabled={selectedShowtimes.length === 0 || Object.keys(showtimeServices).length !== selectedShowtimes.length}
                >
                  Book Appointment
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">No time slots selected</p>
              <p className="text-xs text-gray-400 mt-1">Select time slots from available dates</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateTimeSelection;










// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from 'react-router-dom';
// import { useLogin } from '../components/LoginContext';
// import { api } from '../utils/api';
// import { useLoading } from "../components/Loading";

// const DateTimeSelection = () => {
//   const { showLoading, hideLoading } = useLoading();
//   const { shopId } = useParams();
//   const [timeSlots, setTimeSlots] = useState([]);
//   const [selectedShowtimes, setSelectedShowtimes] = useState([]);
//   const [showtimeServices, setShowtimeServices] = useState({});
//   const [totalAmount, setTotalAmount] = useState(0);
//   const [shopDetails, setShopDetails] = useState({});
//   const [customerEmail, setCustomerEmail] = useState('');
//   const [customerName, setCustomerName] = useState('');
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [currentMonth, setCurrentMonth] = useState(new Date());
//   const [showCalendar, setShowCalendar] = useState(false);
//   const navigate = useNavigate();
//   const { user } = useLogin();

//   useEffect(() => {
//     fetchTimeSlots();
//     fetchShopDetails();
//     fetchCustomerEmail();
//   }, [shopId]);

//   const fetchTimeSlots = async () => {
//     showLoading('Fetching details...');
//     try {
//       const response = await api.get(`/time/shops/${shopId}/available`);
//       const slots = response.data || [];

//       // Sort timeSlots by date (ascending)
//       slots.sort((a, b) => new Date(a.date) - new Date(b.date));

//       // Then, for each timeSlot, sort its showtimes by time
//       const sortedSlots = slots.map(slot => ({
//         ...slot,
//         showtimes: slot.showtimes.sort(
//           (a, b) => new Date(a.date) - new Date(b.date)
//         ),
//       }));

//       setTimeSlots(sortedSlots);
      
//       // Set today's date as default selected date
//       const today = new Date().toISOString().split('T')[0];
//       const todayTimeSlot = sortedSlots.find(slot => 
//         new Date(slot.date).toDateString() === new Date().toDateString()
//       );
      
//       if (todayTimeSlot) {
//         setSelectedDate(todayTimeSlot.date);
//       } else if (sortedSlots.length > 0) {
//         // If today is not available, select the first available date
//         setSelectedDate(sortedSlots[0].date);
//       }
//     } catch (error) {
//       setTimeSlots([]);
//     } finally {
//       hideLoading();
//     }
//   };

//   const fetchShopDetails = async () => {
//     showLoading('Fetching details...');
//     try {
//       const response = await api.get(`/shop/shoplists/${shopId}`);
//       setShopDetails(response.data || {});
//     } catch (error) {
//       console.error('Failed to fetch shop details:', error.response ? error.response.data : error.message);
//       setShopDetails({});
//     } finally {
//       hideLoading();
//     }
//   };

//   const fetchCustomerEmail = async () => {
//     setCustomerEmail(user.email);
//     setCustomerName(user.name);
//   };

//   const handleShowtimeSelect = (timeSlotId, showtimeId, showtimeDate) => {
//     const isAlreadySelected = selectedShowtimes.some(slot => slot.showtimeId === showtimeId);
//     if (isAlreadySelected) {
//       const updatedShowtimes = selectedShowtimes.filter(slot => slot.showtimeId !== showtimeId);
//       const { [showtimeId]: removedService, ...remainingServices } = showtimeServices;
//       setSelectedShowtimes(updatedShowtimes);
//       setShowtimeServices(remainingServices);
//       setTotalAmount(totalAmount - parseInt(removedService?.price || 0));
//     } else {
//       setSelectedShowtimes([...selectedShowtimes, { timeSlotId, showtimeId, showtimeDate }]);
//     }
//   };

//   const handleServiceSelect = (showtimeId, service) => {
//     const updatedServices = { ...showtimeServices, [showtimeId]: service };
//     setShowtimeServices(updatedServices);
//     const servicePrices = Object.values(updatedServices).map(service => parseInt(service.price));
//     setTotalAmount(servicePrices.reduce((sum, price) => sum + price, 0));
//   };

//   const handleBookAppointment = () => {
//     const unselectedServices = selectedShowtimes.filter(
//       ({ showtimeId }) => !showtimeServices[showtimeId]
//     );

//     if (selectedShowtimes.length === 0) {
//       alert("Please select at least one time slot before booking.");
//       return;
//     }

//     if (unselectedServices.length > 0) {
//       alert("Please select a service for each selected time slot.");
//       return;
//     }

//     navigate('/payment', {
//       state: {
//         selectedShowtimes,
//         totalAmount,
//         customerEmail,
//         customerName,
//         shopName: shopDetails.shopname,
//         shopPhone: shopDetails.phone,
//         location: `${shopDetails.street}, ${shopDetails.city}, ${shopDetails.district}, ${shopDetails.state} - ${shopDetails.pin}`,
//         shopId: shopId,
//         showtimeServices,
//       },
//     });
//   };

//   // Calendar functions
//   const getDaysInMonth = (date) => {
//     return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
//   };

//   const getFirstDayOfMonth = (date) => {
//     return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
//   };

//   const getAvailableDates = () => {
//     return timeSlots.map(slot => new Date(slot.date).toDateString());
//   };

//   const navigateMonth = (direction) => {
//     setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
//   };

//   const isDateAvailable = (date) => {
//     const dateString = new Date(date).toDateString();
//     return getAvailableDates().includes(dateString);
//   };

//   const isPastDate = (date) => {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     return new Date(date) < today;
//   };

//   const formatDateDisplay = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-IN', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//   const formatDateShort = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-IN', {
//       day: 'numeric',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   // Generate calendar days
//   const generateCalendarDays = () => {
//     const daysInMonth = getDaysInMonth(currentMonth);
//     const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
//     const days = [];

//     // Add empty cells for days before the first day of the month
//     for (let i = 0; i < firstDayOfMonth; i++) {
//       days.push(null);
//     }

//     // Add days of the month
//     for (let day = 1; day <= daysInMonth; day++) {
//       const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
//       days.push(date);
//     }

//     return days;
//   };

//   const handleDateSelect = (date) => {
//     if (isDateAvailable(date) && !isPastDate(date)) {
//       setSelectedDate(date.toISOString());
//       setShowCalendar(false);
//     }
//   };

//   const calendarDays = generateCalendarDays();
//   const availableDates = getAvailableDates();
  
//   // FIX: Ensure selectedDate is properly converted to string for comparison
//   const selectedDateString = selectedDate ? new Date(selectedDate).toDateString() : null;
//   const selectedTimeSlot = timeSlots.find(slot => 
//     new Date(slot.date).toDateString() === selectedDateString
//   );

//   return (
//     <div className="p-4 mx-auto max-w-6xl">
//       <h2 className="text-2xl font-bold mb-6 text-center">Book Your Time Slot</h2>

//       <div className="flex flex-col lg:flex-row gap-6">
//         {/* Left - Calendar & Services */}
//         <div className="w-full lg:w-2/5 bg-white rounded-lg p-4 border border-gray-300 shadow-sm">
//           {/* Date Selector Button */}
//           <div className="mb-4">
//             <h3 className="text-lg font-bold mb-2 text-gray-700 text-center">Select Date</h3>
//             <button
//               onClick={() => setShowCalendar(!showCalendar)}
//               className="w-full p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors flex justify-between items-center"
//             >
//               <span className="font-medium">
//                 {selectedDate ? formatDateShort(selectedDate) : "Select a date"}
//               </span>
//               <span className="text-gray-500">▼</span>
//             </button>
//           </div>

//           {/* Calendar Dropdown */}
//           {showCalendar && (
//             <div className="mb-4 border border-gray-200 rounded-lg p-4 bg-white shadow-lg">
//               {/* Calendar Header */}
//               <div className="flex items-center justify-between mb-4">
//                 <button 
//                   onClick={() => navigateMonth(-1)}
//                   className="p-2 hover:bg-gray-100 rounded"
//                 >
//                   ‹
//                 </button>
//                 <h4 className="text-lg font-semibold">
//                   {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
//                 </h4>
//                 <button 
//                   onClick={() => navigateMonth(1)}
//                   className="p-2 hover:bg-gray-100 rounded"
//                 >
//                   ›
//                 </button>
//               </div>

//               {/* Calendar Days Header */}
//               <div className="grid grid-cols-7 gap-1 mb-2">
//                 {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
//                   <div key={day} className="text-center text-sm font-medium text-gray-500 py-1">
//                     {day}
//                   </div>
//                 ))}
//               </div>

//               {/* Calendar Days */}
//               <div className="grid grid-cols-7 gap-1">
//                 {calendarDays.map((date, index) => {
//                   if (!date) {
//                     return <div key={`empty-${index}`} className="h-10"></div>;
//                   }

//                   const isAvailable = isDateAvailable(date);
//                   const isPast = isPastDate(date);
//                   const isSelected = selectedDateString && date.toDateString() === selectedDateString;
//                   const isToday = date.toDateString() === new Date().toDateString();

//                   return (
//                     <button
//                       key={date.toISOString()}
//                       onClick={() => handleDateSelect(date)}
//                       disabled={!isAvailable || isPast}
//                       className={`
//                         h-10 rounded text-sm font-medium transition-colors
//                         ${isSelected 
//                           ? 'bg-blue-500 text-white' 
//                           : isToday
//                             ? 'bg-blue-100 text-blue-700 border border-blue-300'
//                             : isAvailable && !isPast
//                               ? 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
//                               : 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                         }
//                       `}
//                     >
//                       {date.getDate()}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//           )}

//           {/* Selected Date Display */}
//           {selectedDate && (
//             <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
//               <p className="text-sm text-blue-800 text-center font-medium">
//                 {formatDateDisplay(selectedDate)}
//               </p>
//             </div>
//           )}

//           {/* Available Services */}
//           <div className="mt-6">
//             <h3 className="text-lg font-bold mb-2 text-gray-700 text-center">Available Services</h3>
//             {shopDetails.services ? (
//               <ul className="space-y-0">
//                 {shopDetails.services.map((service) => (
//                   <li key={service.service} className="flex justify-between text-sm p-1 hover:bg-gray-50 rounded">
//                     <span>{service.service}</span>
//                     <span className="font-semibold">₹{service.price}</span>
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <p className="text-gray-500 text-center">No services available.</p>
//             )}
//           </div>
//         </div>

//         {/* Middle - Time Slots for Selected Date */}
//         <div className="w-full lg:w-2/5 space-y-4">
//           <h3 className="text-lg font-semibold text-gray-800 mb-4">
//             {selectedDate && `${formatDateDisplay(selectedDate)}`}
//           </h3>
          
//           {selectedTimeSlot ? (
//             <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
//               {/* Fixed 5 columns grid for all screen sizes */}
//               <div className="grid grid-cols-5 gap-2">
//                 {selectedTimeSlot.showtimes.map((showtime) => (
//                   <button
//                     key={showtime._id}
//                     className={`px-2 py-3 rounded-lg text-white text-xs font-medium transition-all duration-200 min-w-[60px] ${
//                       showtime.is_booked
//                         ? 'bg-red-400 cursor-not-allowed opacity-60'
//                         : selectedShowtimes.some(slot => slot.showtimeId === showtime._id)
//                           ? 'bg-orange-500 shadow-md'
//                           : 'bg-green-500 hover:bg-green-600 shadow-sm'
//                     }`}
//                     disabled={showtime.is_booked}
//                     onClick={() => handleShowtimeSelect(selectedTimeSlot._id, showtime._id, showtime.date)}
//                   >
//                     {new Date(showtime.date).toLocaleTimeString('en-US', {
//                       hour: '2-digit',
//                       minute: '2-digit',
//                     })}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           ) : selectedDate ? (
//             <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
//               <p className="text-gray-500">No available time slots for this date.</p>
//               <p className="text-sm text-gray-400 mt-1">Please select another date.</p>
//             </div>
//           ) : (
//             <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
//               <p className="text-gray-500">Please select a date to view available time slots.</p>
//             </div>
//           )}
//         </div>

//         {/* Right - Selected Services */}
//         <div className="w-full lg:w-1/5 bg-white p-4 border border-gray-300 rounded-lg shadow-sm sticky top-4">
//           <h3 className="text-lg font-semibold mb-3 text-center">Selected Services</h3>
          
//           {selectedShowtimes.length > 0 ? (
//             <>
//               <div className="space-y-3 max-h-60 overflow-y-auto">
//                 {selectedShowtimes.map(({ showtimeId, showtimeDate }) => (
//                   <div key={showtimeId} className="border-b pb-2">
//                     <p className="text-xs font-medium text-gray-700 mb-1">
//                       {new Date(showtimeDate).toLocaleTimeString('en-US', {
//                         hour: '2-digit',
//                         minute: '2-digit',
//                       })}
//                     </p>
//                     {shopDetails.services ? (
//                       <select
//                         onChange={(e) =>
//                           handleServiceSelect(showtimeId, shopDetails.services.find(service => service.service === e.target.value))
//                         }
//                         value={showtimeServices[showtimeId]?.service || ""}
//                         className="p-1 w-full border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                       >
//                         <option value="">Select Service</option>
//                         {shopDetails.services.map((service) => (
//                           <option key={service.service} value={service.service}>
//                             {service.service} - ₹{service.price}
//                           </option>
//                         ))}
//                       </select>
//                     ) : (
//                       <p className="text-xs text-red-500">No services available</p>
//                     )}
//                   </div>
//                 ))}
//               </div>

//               <div className="mt-4 pt-3 border-t">
//                 <div className="flex justify-between items-center mb-3">
//                   <span className="text-sm font-semibold text-gray-800">Total Amount:</span>
//                   <span className="text-lg font-bold text-green-600">₹{totalAmount}</span>
//                 </div>
//                 <button
//                   className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
//                   onClick={handleBookAppointment}
//                   disabled={selectedShowtimes.length === 0 || Object.keys(showtimeServices).length !== selectedShowtimes.length}
//                 >
//                   Book Appointment
//                 </button>
//               </div>
//             </>
//           ) : (
//             <div className="text-center py-4">
//               <p className="text-gray-500 text-sm">No time slots selected</p>
//               <p className="text-xs text-gray-400 mt-1">Select time slots from available dates</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DateTimeSelection;





// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from 'react-router-dom';
// import { useLogin } from '../components/LoginContext';
// import { api } from '../utils/api';
// import { useLoading } from "../components/Loading";

// const DateTimeSelection = () => {
//   const { showLoading, hideLoading } = useLoading();
//   const { shopId } = useParams();
//   const [timeSlots, setTimeSlots] = useState([]);
//   const [selectedShowtimes, setSelectedShowtimes] = useState([]);
//   const [showtimeServices, setShowtimeServices] = useState({});
//   const [totalAmount, setTotalAmount] = useState(0);
//   const [shopDetails, setShopDetails] = useState({});
//   const [customerEmail, setCustomerEmail] = useState('');
//   const [customerName, setCustomerName] = useState('');
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [currentMonth, setCurrentMonth] = useState(new Date());
//   const [showCalendar, setShowCalendar] = useState(false);
//   const navigate = useNavigate();
//   const { user } = useLogin();

//   useEffect(() => {
//     fetchTimeSlots();
//     fetchShopDetails();
//     fetchCustomerEmail();
//   }, [shopId]);

//   const fetchTimeSlots = async () => {
//     showLoading('Fetching details...');
//     try {
//       const response = await api.get(`/time/shops/${shopId}/available`);
//       const slots = response.data || [];

//       // Sort timeSlots by date (ascending)
//       slots.sort((a, b) => new Date(a.date) - new Date(b.date));

//       // Then, for each timeSlot, sort its showtimes by time
//       const sortedSlots = slots.map(slot => ({
//         ...slot,
//         showtimes: slot.showtimes.sort(
//           (a, b) => new Date(a.date) - new Date(b.date)
//         ),
//       }));

//       setTimeSlots(sortedSlots);
      
//       // Set today's date as default selected date
//       const today = new Date().toISOString().split('T')[0];
//       const todayTimeSlot = sortedSlots.find(slot => 
//         new Date(slot.date).toDateString() === new Date().toDateString()
//       );
      
//       if (todayTimeSlot) {
//         setSelectedDate(todayTimeSlot.date);
//       } else if (sortedSlots.length > 0) {
//         // If today is not available, select the first available date
//         setSelectedDate(sortedSlots[0].date);
//       }
//     } catch (error) {
//       setTimeSlots([]);
//     } finally {
//       hideLoading();
//     }
//   };

//   const fetchShopDetails = async () => {
//     showLoading('Fetching details...');
//     try {
//       const response = await api.get(`/shop/shoplists/${shopId}`);
//       setShopDetails(response.data || {});
//     } catch (error) {
//       console.error('Failed to fetch shop details:', error.response ? error.response.data : error.message);
//       setShopDetails({});
//     } finally {
//       hideLoading();
//     }
//   };

//   const fetchCustomerEmail = async () => {
//     setCustomerEmail(user.email);
//     setCustomerName(user.name);
//   };

//   const handleShowtimeSelect = (timeSlotId, showtimeId, showtimeDate) => {
//     const isAlreadySelected = selectedShowtimes.some(slot => slot.showtimeId === showtimeId);
//     if (isAlreadySelected) {
//       const updatedShowtimes = selectedShowtimes.filter(slot => slot.showtimeId !== showtimeId);
//       const { [showtimeId]: removedService, ...remainingServices } = showtimeServices;
//       setSelectedShowtimes(updatedShowtimes);
//       setShowtimeServices(remainingServices);
//       setTotalAmount(totalAmount - parseInt(removedService?.price || 0));
//     } else {
//       setSelectedShowtimes([...selectedShowtimes, { timeSlotId, showtimeId, showtimeDate }]);
//     }
//   };

//   const handleServiceSelect = (showtimeId, service) => {
//     const updatedServices = { ...showtimeServices, [showtimeId]: service };
//     setShowtimeServices(updatedServices);
//     const servicePrices = Object.values(updatedServices).map(service => parseInt(service.price));
//     setTotalAmount(servicePrices.reduce((sum, price) => sum + price, 0));
//   };

//   const handleBookAppointment = () => {
//     const unselectedServices = selectedShowtimes.filter(
//       ({ showtimeId }) => !showtimeServices[showtimeId]
//     );

//     if (selectedShowtimes.length === 0) {
//       alert("Please select at least one time slot before booking.");
//       return;
//     }

//     if (unselectedServices.length > 0) {
//       alert("Please select a service for each selected time slot.");
//       return;
//     }

//     navigate('/payment', {
//       state: {
//         selectedShowtimes,
//         totalAmount,
//         customerEmail,
//         customerName,
//         shopName: shopDetails.shopname,
//         shopPhone: shopDetails.phone,
//         location: `${shopDetails.street}, ${shopDetails.city}, ${shopDetails.district}, ${shopDetails.state} - ${shopDetails.pin}`,
//         shopId: shopId,
//         showtimeServices,
//       },
//     });
//   };

//   // Calendar functions
//   const getDaysInMonth = (date) => {
//     return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
//   };

//   const getFirstDayOfMonth = (date) => {
//     return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
//   };

//   const getAvailableDates = () => {
//     return timeSlots.map(slot => new Date(slot.date).toDateString());
//   };

//   const navigateMonth = (direction) => {
//     setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
//   };

//   const isDateAvailable = (date) => {
//     const dateString = new Date(date).toDateString();
//     return getAvailableDates().includes(dateString);
//   };

//   const isPastDate = (date) => {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     return new Date(date) < today;
//   };

//   const formatDateDisplay = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-IN', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//   const formatDateShort = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-IN', {
//       day: 'numeric',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   // Generate calendar days
//   const generateCalendarDays = () => {
//     const daysInMonth = getDaysInMonth(currentMonth);
//     const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
//     const days = [];

//     // Add empty cells for days before the first day of the month
//     for (let i = 0; i < firstDayOfMonth; i++) {
//       days.push(null);
//     }

//     // Add days of the month
//     for (let day = 1; day <= daysInMonth; day++) {
//       const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
//       days.push(date);
//     }

//     return days;
//   };

//   const handleDateSelect = (date) => {
//     if (isDateAvailable(date) && !isPastDate(date)) {
//       setSelectedDate(date.toISOString());
//       setShowCalendar(false);
//     }
//   };

//   const calendarDays = generateCalendarDays();
//   const availableDates = getAvailableDates();
  
//   // FIX: Ensure selectedDate is properly converted to string for comparison
//   const selectedDateString = selectedDate ? new Date(selectedDate).toDateString() : null;
//   const selectedTimeSlot = timeSlots.find(slot => 
//     new Date(slot.date).toDateString() === selectedDateString
//   );

//   return (
//     <div className="p-4 mx-auto max-w-6xl">
//       <h2 className="text-2xl font-bold mb-6 text-center">Book Your Time Slot</h2>

//       <div className="flex flex-col lg:flex-row gap-6">
//         {/* Left - Calendar & Services */}
//         <div className="w-full lg:w-2/5 bg-white rounded-lg p-4 border border-gray-300 shadow-sm">
//           {/* Date Selector Button */}
//           <div className="mb-4">
//             <h3 className="text-lg font-bold mb-2 text-gray-700 text-center">Select Date</h3>
//             <button
//               onClick={() => setShowCalendar(!showCalendar)}
//               className="w-full p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors flex justify-between items-center"
//             >
//               <span className="font-medium">
//                 {selectedDate ? formatDateShort(selectedDate) : "Select a date"}
//               </span>
//               <span className="text-gray-500">▼</span>
//             </button>
//           </div>

//           {/* Calendar Dropdown */}
//           {showCalendar && (
//             <div className="mb-4 border border-gray-200 rounded-lg p-4 bg-white shadow-lg">
//               {/* Calendar Header */}
//               <div className="flex items-center justify-between mb-4">
//                 <button 
//                   onClick={() => navigateMonth(-1)}
//                   className="p-2 hover:bg-gray-100 rounded"
//                 >
//                   ‹
//                 </button>
//                 <h4 className="text-lg font-semibold">
//                   {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
//                 </h4>
//                 <button 
//                   onClick={() => navigateMonth(1)}
//                   className="p-2 hover:bg-gray-100 rounded"
//                 >
//                   ›
//                 </button>
//               </div>

//               {/* Calendar Days Header */}
//               <div className="grid grid-cols-7 gap-1 mb-2">
//                 {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
//                   <div key={day} className="text-center text-sm font-medium text-gray-500 py-1">
//                     {day}
//                   </div>
//                 ))}
//               </div>

//               {/* Calendar Days */}
//               <div className="grid grid-cols-7 gap-1">
//                 {calendarDays.map((date, index) => {
//                   if (!date) {
//                     return <div key={`empty-${index}`} className="h-10"></div>;
//                   }

//                   const isAvailable = isDateAvailable(date);
//                   const isPast = isPastDate(date);
//                   const isSelected = selectedDateString && date.toDateString() === selectedDateString;
//                   const isToday = date.toDateString() === new Date().toDateString();

//                   return (
//                     <button
//                       key={date.toISOString()}
//                       onClick={() => handleDateSelect(date)}
//                       disabled={!isAvailable || isPast}
//                       className={`
//                         h-10 rounded text-sm font-medium transition-colors
//                         ${isSelected 
//                           ? 'bg-blue-500 text-white' 
//                           : isToday
//                             ? 'bg-blue-100 text-blue-700 border border-blue-300'
//                             : isAvailable && !isPast
//                               ? 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
//                               : 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                         }
//                       `}
//                     >
//                       {date.getDate()}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//           )}

//           {/* Selected Date Display */}
//           {selectedDate && (
//             <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
//               <p className="text-sm text-blue-800 text-center font-medium">
//                 {formatDateDisplay(selectedDate)}
//               </p>
//             </div>
//           )}

//           {/* Available Services */}
//           <div className="mt-6">
//             <h3 className="text-lg font-bold mb-2 text-gray-700 text-center">Available Services</h3>
//             {shopDetails.services ? (
//               <ul className="space-y-2">
//                 {shopDetails.services.map((service) => (
//                   <li key={service.service} className="flex justify-between text-sm p-2 hover:bg-gray-50 rounded">
//                     <span>{service.service}</span>
//                     <span className="font-semibold">₹{service.price}</span>
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <p className="text-gray-500 text-center">No services available.</p>
//             )}
//           </div>
//         </div>

//         {/* Middle - Time Slots for Selected Date */}
//         <div className="w-full lg:w-2/5 space-y-4">
//           <h3 className="text-lg font-semibold text-gray-800 mb-4">
//             Available Time Slots {selectedDate && `for ${formatDateDisplay(selectedDate)}`}
//           </h3>
          
//           {selectedTimeSlot ? (
//             <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
//               <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-2">
//                 {selectedTimeSlot.showtimes.map((showtime) => (
//                   <button
//                     key={showtime._id}
//                     className={`px-3 py-3 rounded-lg text-white text-sm font-medium transition-all duration-200 min-w-[70px] ${
//                       showtime.is_booked
//                         ? 'bg-red-400 cursor-not-allowed opacity-60'
//                         : selectedShowtimes.some(slot => slot.showtimeId === showtime._id)
//                           ? 'bg-orange-500 shadow-md'
//                           : 'bg-green-500 hover:bg-green-600 shadow-sm'
//                     }`}
//                     disabled={showtime.is_booked}
//                     onClick={() => handleShowtimeSelect(selectedTimeSlot._id, showtime._id, showtime.date)}
//                   >
//                     {new Date(showtime.date).toLocaleTimeString('en-US', {
//                       hour: '2-digit',
//                       minute: '2-digit',
//                     })}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           ) : selectedDate ? (
//             <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
//               <p className="text-gray-500">No available time slots for this date.</p>
//               <p className="text-sm text-gray-400 mt-1">Please select another date.</p>
//             </div>
//           ) : (
//             <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
//               <p className="text-gray-500">Please select a date to view available time slots.</p>
//             </div>
//           )}
//         </div>

//         {/* Right - Selected Services */}
//         <div className="w-full lg:w-1/5 bg-white p-4 border border-gray-300 rounded-lg shadow-sm sticky top-4">
//           <h3 className="text-lg font-semibold mb-3 text-center">Selected Services</h3>
          
//           {selectedShowtimes.length > 0 ? (
//             <>
//               <div className="space-y-3 max-h-60 overflow-y-auto">
//                 {selectedShowtimes.map(({ showtimeId, showtimeDate }) => (
//                   <div key={showtimeId} className="border-b pb-2">
//                     <p className="text-xs font-medium text-gray-700 mb-1">
//                       {new Date(showtimeDate).toLocaleTimeString('en-US', {
//                         hour: '2-digit',
//                         minute: '2-digit',
//                       })}
//                     </p>
//                     {shopDetails.services ? (
//                       <select
//                         onChange={(e) =>
//                           handleServiceSelect(showtimeId, shopDetails.services.find(service => service.service === e.target.value))
//                         }
//                         value={showtimeServices[showtimeId]?.service || ""}
//                         className="p-1 w-full border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                       >
//                         <option value="">Select Service</option>
//                         {shopDetails.services.map((service) => (
//                           <option key={service.service} value={service.service}>
//                             {service.service} - ₹{service.price}
//                           </option>
//                         ))}
//                       </select>
//                     ) : (
//                       <p className="text-xs text-red-500">No services available</p>
//                     )}
//                   </div>
//                 ))}
//               </div>

//               <div className="mt-4 pt-3 border-t">
//                 <div className="flex justify-between items-center mb-3">
//                   <span className="text-sm font-semibold text-gray-800">Total Amount:</span>
//                   <span className="text-lg font-bold text-green-600">₹{totalAmount}</span>
//                 </div>
//                 <button
//                   className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
//                   onClick={handleBookAppointment}
//                   disabled={selectedShowtimes.length === 0 || Object.keys(showtimeServices).length !== selectedShowtimes.length}
//                 >
//                   Book Appointment
//                 </button>
//               </div>
//             </>
//           ) : (
//             <div className="text-center py-4">
//               <p className="text-gray-500 text-sm">No time slots selected</p>
//               <p className="text-xs text-gray-400 mt-1">Select time slots from available dates</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DateTimeSelection;





// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from 'react-router-dom';
// import { useLogin } from '../components/LoginContext';
// import { api } from '../utils/api';
// import { useLoading } from "../components/Loading";

// const DateTimeSelection = () => {
//   const { showLoading, hideLoading } = useLoading();
//   const { shopId } = useParams();
//   const [timeSlots, setTimeSlots] = useState([]);
//   const [selectedShowtimes, setSelectedShowtimes] = useState([]);
//   const [showtimeServices, setShowtimeServices] = useState({});
//   const [totalAmount, setTotalAmount] = useState(0);
//   const [shopDetails, setShopDetails] = useState({});
//   const [customerEmail, setCustomerEmail] = useState('');
//   const [customerName, setCustomerName] = useState('');
//   const navigate = useNavigate();
//   const { user } = useLogin();

//   useEffect(() => {
//     fetchTimeSlots();
//     fetchShopDetails();
//     fetchCustomerEmail();
//   }, [shopId]);

//   const fetchTimeSlots = async () => {
//     showLoading('Fetching details...');
//     try {
//       const response = await api.get(`/time/shops/${shopId}/available`);
//       const slots = response.data || [];

//       // Sort timeSlots by date (ascending)
//       slots.sort((a, b) => new Date(a.date) - new Date(b.date));

//       // Then, for each timeSlot, sort its showtimes by time
//       const sortedSlots = slots.map(slot => ({
//         ...slot,
//         showtimes: slot.showtimes.sort(
//           (a, b) => new Date(a.date) - new Date(b.date)
//         ),
//       }));

//       setTimeSlots(sortedSlots);
//     } catch (error) {
//       setTimeSlots([]);
//     } finally {
//       hideLoading();
//     }
//   };

//   const fetchShopDetails = async () => {
//     showLoading('Fetching details...');
//     try {
//       const response = await api.get(`/shop/shoplists/${shopId}`);
//       setShopDetails(response.data || {});
//     } catch (error) {
//       console.error('Failed to fetch shop details:', error.response ? error.response.data : error.message);
//       setShopDetails({});
//     } finally {
//       hideLoading();
//     }
//   };

//   const fetchCustomerEmail = async () => {
//     setCustomerEmail(user.email);
//     setCustomerName(user.name);
//   };

//   const handleShowtimeSelect = (timeSlotId, showtimeId, showtimeDate) => {
//     const isAlreadySelected = selectedShowtimes.some(slot => slot.showtimeId === showtimeId);
//     if (isAlreadySelected) {
//       const updatedShowtimes = selectedShowtimes.filter(slot => slot.showtimeId !== showtimeId);
//       const { [showtimeId]: removedService, ...remainingServices } = showtimeServices;
//       setSelectedShowtimes(updatedShowtimes);
//       setShowtimeServices(remainingServices);
//       setTotalAmount(totalAmount - parseInt(removedService?.price || 0));
//     } else {
//       setSelectedShowtimes([...selectedShowtimes, { timeSlotId, showtimeId, showtimeDate }]);
//     }
//   };

//   const handleServiceSelect = (showtimeId, service) => {
//     const updatedServices = { ...showtimeServices, [showtimeId]: service };
//     setShowtimeServices(updatedServices);
//     const servicePrices = Object.values(updatedServices).map(service => parseInt(service.price));
//     setTotalAmount(servicePrices.reduce((sum, price) => sum + price, 0));
//   };

//   const handleBookAppointment = () => {
//     const unselectedServices = selectedShowtimes.filter(
//       ({ showtimeId }) => !showtimeServices[showtimeId]
//     );

//     if (selectedShowtimes.length === 0) {
//       alert("Please select at least one time slot before booking.");
//       return;
//     }

//     if (unselectedServices.length > 0) {
//       alert("Please select a service for each selected time slot.");
//       return;
//     }

//     navigate('/payment', {
//       state: {
//         selectedShowtimes,
//         totalAmount,
//         customerEmail,
//         customerName,
//         shopName: shopDetails.shopname,
//         shopPhone: shopDetails.phone,
//         location: `${shopDetails.street}, ${shopDetails.city}, ${shopDetails.district}, ${shopDetails.state} - ${shopDetails.pin}`,
//         shopId: shopId,
//         showtimeServices,
//       },
//     });
//   };

//   return (
//     <div className="p-4 mx-auto">
//       <h2 className="text-2xl font-bold mb-6 text-center">Book Your Time Slot</h2>

//       <div className="flex flex-col lg:flex-row gap-4">
//         {/* Left - Available Services */}
//         <div className="w-full lg:w-1/4 bg-white rounded-lg p-3 border border-gray-300 shadow-sm">
//           <h3 className="text-lg font-bold mb-2 text-gray-700 text-center">Available Services</h3>
//           {shopDetails.services ? (
//             <ul className="space-y-2">
//               {shopDetails.services.map((service) => (
//                 <li key={service.service} className="flex justify-between text-sm">
//                   <span>{service.service}</span>
//                   <span>₹{service.price}</span>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p>No services available.</p>
//           )}
//         </div>

//         {/* Middle - Time Slots */}
//         <div className="w-full lg:w-2/4 space-y-4">
//           {timeSlots.length > 0 ? (
//             timeSlots.map((timeSlot) => (
//               <div key={timeSlot._id} className="bg-gray-100 p-3 rounded-lg shadow-sm">
//                 <h3 className="text-sm font-semibold text-gray-800 mb-2">
//                   {new Date(timeSlot.date).toLocaleDateString('en-IN', {
//                     weekday: 'short',
//                     day: 'numeric',
//                     month: 'short'
//                   })}
//                 </h3>
//                 <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-1">
//                   {timeSlot.showtimes.map((showtime) => (
//                     <button
//                       key={showtime._id}
//                       className={`px-1 py-2 rounded text-white text-xs font-medium transition-colors duration-200 min-w-[60px] ${
//                         showtime.is_booked
//                           ? 'bg-red-500 cursor-not-allowed'
//                           : selectedShowtimes.some(slot => slot.showtimeId === showtime._id)
//                             ? 'bg-orange-600'
//                             : 'bg-green-500 hover:bg-green-600'
//                       }`}
//                       disabled={showtime.is_booked}
//                       onClick={() => handleShowtimeSelect(timeSlot._id, showtime._id, showtime.date)}
//                     >
//                       {new Date(showtime.date).toLocaleTimeString('en-US', {
//                         hour: '2-digit',
//                         minute: '2-digit',
//                       })}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             ))
//           ) : (
//             <h2 className="text-red-600 text-center text-xl mt-5">No available time slots for this shop.</h2>
//           )}
//         </div>

//         {/* Right - Choose Services */}
//         <div className="w-full lg:w-1/4 bg-white p-3 border border-gray-300 rounded-lg shadow-sm">
//           <h3 className="text-lg font-semibold mb-3 text-center">Choose service for selected time</h3>
//           {selectedShowtimes.map(({ showtimeId, showtimeDate }) => (
//             <div key={showtimeId} className="mb-3">
//               <p className="text-xs text-gray-600 mb-1">
//                 {new Date(showtimeDate).toLocaleTimeString('en-US', {
//                   hour: '2-digit',
//                   minute: '2-digit',
//                 })}
//               </p>
//               {shopDetails.services ? (
//                 <select
//                   onChange={(e) =>
//                     handleServiceSelect(showtimeId, shopDetails.services.find(service => service.service === e.target.value))
//                   }
//                   value={showtimeServices[showtimeId]?.service || ""}
//                   className="p-1 w-full border border-gray-300 rounded text-xs"
//                 >
//                   <option value="">Select Service</option>
//                   {shopDetails.services.map((service) => (
//                     <option key={service.service} value={service.service}>
//                       {service.service} - ₹{service.price}
//                     </option>
//                   ))}
//                 </select>
//               ) : (
//                 <p className="text-xs text-red-500">No services available</p>
//               )}
//             </div>
//           ))}

//           <h3 className="text-sm font-semibold mt-3">Total Amount: ₹{totalAmount}</h3>
//           <button
//             className="mt-3 px-3 py-2 w-full bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
//             onClick={handleBookAppointment}
//             disabled={selectedShowtimes.length === 0 || Object.keys(showtimeServices).length !== selectedShowtimes.length}
//           >
//             Book Appointment
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DateTimeSelection;




// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from 'react-router-dom';
// import { useLogin } from '../components/LoginContext';
// import { api } from '../utils/api';
// import { useLoading } from "../components/Loading";

// const DateTimeSelection = () => {
//   const { showLoading, hideLoading } = useLoading();
//   const { shopId } = useParams();
//   const [timeSlots, setTimeSlots] = useState([]);
//   const [selectedShowtimes, setSelectedShowtimes] = useState([]);
//   const [showtimeServices, setShowtimeServices] = useState({});
//   const [totalAmount, setTotalAmount] = useState(0);
//   const [shopDetails, setShopDetails] = useState({});
//   const [customerEmail, setCustomerEmail] = useState('');
//   const [customerName, setCustomerName] = useState('');
//   const navigate = useNavigate();
//   const { user } = useLogin();

//   useEffect(() => {
//     fetchTimeSlots();
//     fetchShopDetails();
//     fetchCustomerEmail();
//   }, [shopId]);

//   const fetchTimeSlots = async () => {
//     showLoading('Fetching details...');
//     try {
//       const response = await api.get(`/time/shops/${shopId}/available`);
//       const slots = response.data || [];

//       // Sort timeSlots by date (ascending)
//       slots.sort((a, b) => new Date(a.date) - new Date(b.date));

//       // Then, for each timeSlot, sort its showtimes by time
//       const sortedSlots = slots.map(slot => ({
//         ...slot,
//         showtimes: slot.showtimes.sort(
//           (a, b) => new Date(a.date) - new Date(b.date)
//         ),
//       }));

//       setTimeSlots(sortedSlots);
//     } catch (error) {
//       setTimeSlots([]);
//     } finally {
//       hideLoading();
//     }
//   };


//   const fetchShopDetails = async () => {
//     showLoading('Fetching details...');
//     try {
//       const response = await api.get(`/shop/shoplists/${shopId}`);
//       setShopDetails(response.data || {});
//     } catch (error) {
//       console.error('Failed to fetch shop details:', error.response ? error.response.data : error.message);
//       setShopDetails({});
//     } finally {
//       hideLoading();
//     }
//   };


//   const fetchCustomerEmail = async () => {
//     setCustomerEmail(user.email);
//     setCustomerName(user.name);
//   };

//   const handleShowtimeSelect = (timeSlotId, showtimeId, showtimeDate) => {
//     const isAlreadySelected = selectedShowtimes.some(slot => slot.showtimeId === showtimeId);
//     if (isAlreadySelected) {
//       const updatedShowtimes = selectedShowtimes.filter(slot => slot.showtimeId !== showtimeId);
//       const { [showtimeId]: removedService, ...remainingServices } = showtimeServices;
//       setSelectedShowtimes(updatedShowtimes);
//       setShowtimeServices(remainingServices);
//       setTotalAmount(totalAmount - parseInt(removedService?.price || 0));
//     } else {
//       setSelectedShowtimes([...selectedShowtimes, { timeSlotId, showtimeId, showtimeDate }]);
//     }
//   };

//   const handleServiceSelect = (showtimeId, service) => {
//     const updatedServices = { ...showtimeServices, [showtimeId]: service };
//     setShowtimeServices(updatedServices);
//     const servicePrices = Object.values(updatedServices).map(service => parseInt(service.price));
//     setTotalAmount(servicePrices.reduce((sum, price) => sum + price, 0));
//   };

//   const handleBookAppointment = () => {
//     const unselectedServices = selectedShowtimes.filter(
//       ({ showtimeId }) => !showtimeServices[showtimeId]
//     );

//     if (selectedShowtimes.length === 0) {
//       alert("Please select at least one time slot before booking.");
//       return;
//     }

//     if (unselectedServices.length > 0) {
//       alert("Please select a service for each selected time slot.");
//       return;
//     }

//     navigate('/payment', {
//       state: {
//         selectedShowtimes,
//         totalAmount,
//         customerEmail,
//         customerName,
//         shopName: shopDetails.shopname,
//         location: shopDetails.city,
//         shopId: shopId, // ADD THIS LINE - THIS IS THE FIX
//         showtimeServices,
//       },
//     });
//   };

//   return (
//     <div className="p-5 mx-auto">
//       <h2 className="text-2xl font-bold mb-4 text-center">Book Your Time Slot</h2>

//       <div className="flex flex-col lg:flex-row gap-4">
//         {/* Left - Available Services */}
//         <div className="w-full lg:w-1/4 bg-white rounded-lg p-3 border border-gray-300 shadow-sm">
//           <h3 className="text-lg font-bold mb-2 text-gray-700 text-center">Available Services</h3>
//           {shopDetails.services ? (
//             <ul className="space-y-2">
//               {shopDetails.services.map((service) => (
//                 <li key={service.service} className="flex justify-between text-sm">
//                   <span>{service.service}</span>
//                   <span>₹{service.price}</span>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p>No services available.</p>
//           )}
//         </div>

//         {/* Middle - Time Slots */}
//         <div className="w-full lg:w-2/4 space-y-5">
//           {timeSlots.length > 0 ? (
//             timeSlots.map((timeSlot) => (
//               <div key={timeSlot._id} className="bg-gray-100 p-4 rounded-lg shadow-sm">
//                 <h3 className="text-md font-semibold text-gray-800 mb-2">
//                   Date: {new Date(timeSlot.date).toLocaleDateString('en-IN')}
//                 </h3>
//                 <div className="flex gap-2 flex-wrap">
//                   {timeSlot.showtimes.map((showtime) => (
//                     <button
//                       key={showtime._id}
//                       className={`px-4 py-2 rounded-lg text-white min-w-[80px] text-center text-sm transition-colors duration-300 ${showtime.is_booked
//                         ? 'bg-red-500 cursor-not-allowed'
//                         : selectedShowtimes.some(slot => slot.showtimeId === showtime._id)
//                           ? 'bg-orange-600'
//                           : 'bg-green-500 hover:bg-green-600'
//                         }`}
//                       disabled={showtime.is_booked}
//                       onClick={() => handleShowtimeSelect(timeSlot._id, showtime._id, showtime.date)}
//                     >
//                       {new Date(showtime.date).toLocaleTimeString('en-US', {
//                         hour: '2-digit',
//                         minute: '2-digit',
//                       })}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             ))
//           ) : (
//             <h2 className="text-red-600 text-center text-xl mt-5">No available time slots for this shop.</h2>
//           )}
//         </div>

//         {/* Right - Choose Services */}
//         <div className="w-full lg:w-1/4 lg:mt-0 bg-white p-4 border border-gray-300 rounded-lg shadow-sm">
//           <h3 className="text-lg font-semibold mb-4 text-center">Choose service for selected time</h3>
//           {selectedShowtimes.map(({ showtimeId }) => (
//             <div key={showtimeId} className="mb-4">
//               {shopDetails.services ? (
//                 <select
//                   onChange={(e) =>
//                     handleServiceSelect(showtimeId, shopDetails.services.find(service => service.service === e.target.value))
//                   }
//                   value={showtimeServices[showtimeId]?.service || ""}
//                   className="p-2 w-full border border-gray-300 rounded text-sm"
//                 >
//                   <option value="">Select a Service</option>
//                   {shopDetails.services.map((service) => (
//                     <option key={service.service} value={service.service}>
//                       {service.service} - ₹{service.price}
//                     </option>
//                   ))}
//                 </select>
//               ) : (
//                 <p>No services available.</p>
//               )}
//             </div>
//           ))}

//           <h3 className="text-md font-semibold mt-3">Total Amount: ₹{totalAmount}</h3>
//           <button
//             className="mt-4 px-4 py-2 w-full bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
//             onClick={handleBookAppointment}
//             disabled={selectedShowtimes.length === 0 || Object.keys(showtimeServices).length !== selectedShowtimes.length}
//           >
//             Book Appointment
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DateTimeSelection;


