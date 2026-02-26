import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useLogin } from '../components/LoginContext';
import { toast } from 'react-toastify';
import { api } from '../utils/api';
import { useLoading } from "../components/Loading";

const getSocketServerUrl = () => {
  const apiBaseUrl =
    api.defaults.baseURL ||
    import.meta.env.VITE_DEV_BASE_URL ||
    import.meta.env.VITE_PROD_BASE_URL ||
    'http://localhost:5000/api';

  return String(apiBaseUrl).replace(/\/api\/?$/, '');
};

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
  const [liveUpdateNotice, setLiveUpdateNotice] = useState('');
  const socketRef = useRef(null);
  const liveUpdateTimerRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useLogin();

  const showRealtimeNotice = useCallback((message) => {
    setLiveUpdateNotice(message);
    if (liveUpdateTimerRef.current) {
      clearTimeout(liveUpdateTimerRef.current);
    }
    liveUpdateTimerRef.current = setTimeout(() => {
      setLiveUpdateNotice('');
    }, 4000);
  }, []);

  const reconcileSelectionsWithLatestSlots = useCallback(
    (latestSlots) => {
      const availableShowtimeIds = new Set();
      const bookedShowtimeIds = new Set();

      latestSlots.forEach((slot) => {
        (slot.showtimes || []).forEach((showtime) => {
          const showtimeId = String(showtime._id);
          if (showtime.is_booked) {
            bookedShowtimeIds.add(showtimeId);
          } else {
            availableShowtimeIds.add(showtimeId);
          }
        });
      });

      setSelectedShowtimes((previousSelected) => {
        if (!previousSelected.length) return previousSelected;

        const updatedSelected = previousSelected.filter((slot) =>
          availableShowtimeIds.has(String(slot.showtimeId))
        );

        if (updatedSelected.length !== previousSelected.length) {
          const removedDueToBooking = previousSelected.some((slot) =>
            bookedShowtimeIds.has(String(slot.showtimeId))
          );
          if (removedDueToBooking) {
            showRealtimeNotice('A selected slot was just booked by another user.');
          }
        }

        return updatedSelected;
      });

      setShowtimeServices((previousServices) => {
        const nextServices = {};
        Object.entries(previousServices).forEach(([showtimeId, service]) => {
          if (availableShowtimeIds.has(String(showtimeId))) {
            nextServices[showtimeId] = service;
          }
        });

        const nextTotal = Object.values(nextServices).reduce(
          (sum, service) => sum + parseInt(service?.price || 0, 10),
          0
        );
        setTotalAmount(nextTotal);
        return nextServices;
      });
    },
    [showRealtimeNotice]
  );

  const fetchTimeSlots = useCallback(
    async (showLoader = true) => {
      if (showLoader) {
        showLoading('Fetching details...');
      }

      try {
        const response = await api.get(`/time/shops/${shopId}/available`);
        const slots = Array.isArray(response.data) ? response.data : [];

        const sortedSlots = slots
          .slice()
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .map((slot) => ({
            ...slot,
            showtimes: (slot.showtimes || [])
              .slice()
              .sort((a, b) => new Date(a.date) - new Date(b.date)),
          }));

        setTimeSlots(sortedSlots);
        reconcileSelectionsWithLatestSlots(sortedSlots);

        setSelectedDate((previousDate) => {
          if (previousDate) {
            const previousDateString = new Date(previousDate).toDateString();
            const stillAvailable = sortedSlots.some(
              (slot) => new Date(slot.date).toDateString() === previousDateString
            );
            if (stillAvailable) {
              return previousDate;
            }
          }

          const todayTimeSlot = sortedSlots.find(
            (slot) => new Date(slot.date).toDateString() === new Date().toDateString()
          );

          return todayTimeSlot?.date || sortedSlots[0]?.date || null;
        });
      } catch (error) {
        console.error('Failed to fetch time slots:', error);
        setTimeSlots([]);
      } finally {
        if (showLoader) {
          hideLoading();
        }
      }
    },
    [hideLoading, reconcileSelectionsWithLatestSlots, shopId, showLoading]
  );

  const fetchShopDetails = useCallback(
    async (showLoader = true) => {
      if (showLoader) {
        showLoading('Fetching details...');
      }

      try {
        const response = await api.get(`/shop/shoplists/${shopId}`);
        setShopDetails(response.data || {});
      } catch (error) {
        console.error('Failed to fetch shop details:', error.response ? error.response.data : error.message);
        setShopDetails({});
      } finally {
        if (showLoader) {
          hideLoading();
        }
      }
    },
    [hideLoading, shopId, showLoading]
  );

  const fetchCustomerEmail = useCallback(() => {
    setCustomerEmail(user?.email || '');
    setCustomerName(user?.name || '');
  }, [user?.email, user?.name]);

  useEffect(() => {
    fetchTimeSlots();
    fetchShopDetails(false);

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    const slotTimer = setInterval(() => {
      fetchTimeSlots(false);
    }, 30000);

    return () => {
      clearInterval(timer);
      clearInterval(slotTimer);
    };
  }, [fetchShopDetails, fetchTimeSlots]);

  useEffect(() => {
    fetchCustomerEmail();
  }, [fetchCustomerEmail]);

  useEffect(() => {
    if (!shopId) return undefined;

    const socket = io(getSocketServerUrl(), {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });
    socketRef.current = socket;

    const joinRoom = () => {
      socket.emit('join_shop_room', { shopId });
    };

    const onSlotUpdated = (eventData = {}) => {
      if (eventData.shopId && String(eventData.shopId) !== String(shopId)) {
        return;
      }
      fetchTimeSlots(false);
      showRealtimeNotice('Time slots updated in real time.');
    };

    const onConnectError = (error) => {
      console.error('Socket connection error:', error?.message || error);
    };

    socket.on('connect', joinRoom);
    socket.on('shop_slots_updated', onSlotUpdated);
    socket.on('shop_slot_booked', onSlotUpdated);
    socket.on('connect_error', onConnectError);

    return () => {
      socket.emit('leave_shop_room', { shopId });
      socket.off('connect', joinRoom);
      socket.off('shop_slots_updated', onSlotUpdated);
      socket.off('shop_slot_booked', onSlotUpdated);
      socket.off('connect_error', onConnectError);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [fetchTimeSlots, shopId, showRealtimeNotice]);

  useEffect(
    () => () => {
      if (liveUpdateTimerRef.current) {
        clearTimeout(liveUpdateTimerRef.current);
      }
    },
    []
  );

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

  const handleBookAppointment = async () => {
    const unselectedServices = selectedShowtimes.filter(({ showtimeId }) => {
      const svc = showtimeServices[showtimeId];
      return !svc || !svc.service; // treat missing or empty service as unselected
    });

    if (selectedShowtimes.length === 0) {
      toast.error('Please select at least one time slot before booking.');
      return;
    }

    if (unselectedServices.length > 0) {
      toast.error('Please select a service for each selected time slot.');
      return;
    }

  // DEBUG: Log what we're about to send
  console.log('=== BOOKING REQUEST DATA ===');
  console.log('Selected Showtimes:', selectedShowtimes);
  console.log('Showtime Services:', showtimeServices);
  console.log('Customer Email:', customerEmail);
  console.log('User ID:', user?.userId);
  console.log('Shop ID:', shopId);
  console.log('Total Amount:', totalAmount);
  
  // Check if we have valid data
  if (!selectedShowtimes[0]?.showtimeId) {
    console.error('ERROR: No showtimeId in selectedShowtimes');
    alert('Invalid time slot selection');
    return;
  }

  if (!selectedShowtimes[0]?.timeSlotId) {
    console.error('ERROR: No timeSlotId in selectedShowtimes');
    alert('Invalid time slot selection');
    return;
  }

  // Prepare booking data
  const bookingData = {
    shopId,
    timeSlotId: selectedShowtimes[0].timeSlotId,
    showtimeId: selectedShowtimes[0].showtimeId,
    date: selectedShowtimes[0].showtimeDate,
    customerEmail,
    userId: user?.userId,
    serviceInfo: showtimeServices[selectedShowtimes[0].showtimeId],
    totalAmount
  };

  console.log('Booking Data to send:', bookingData);
  console.log('=== END BOOKING DATA ===');

  try {
    // show feedback before navigation
    toast.info('Proceeding to payment...');
    // Navigate to payment with the data
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
        // Also pass bookingData for debugging
        bookingData
      },
    });
  } catch (error) {
    console.error('Navigation error:', error);
    toast.error('Failed to begin booking process. Please try again.');
  }
};

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchTimeSlots(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchTimeSlots]);

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
  const selectedTimeSlot = timeSlots.find(slot => {
    if (!slot.date || !selectedDate) return false;
    
    // Compare dates ignoring time
    const slotDate = new Date(slot.date).toDateString();
    const selectedDateStr = new Date(selectedDate).toDateString();
    return slotDate === selectedDateStr;
  });

  // Add debug logging
  console.log('Time Slots:', timeSlots);
  console.log('Selected Date:', selectedDate);
  console.log('Selected Time Slot Found:', selectedTimeSlot);
  // const selectedTimeSlot = timeSlots.find(slot => 
  //   new Date(slot.date).toDateString() === selectedDateString
  // );

  // Get button styling based on slot status
  const getTimeSlotButtonStyle = (showtime) => {
    if (showtime.is_booked) {
      return 'bg-red-400 cursor-not-allowed';
    }
    
    if (isTimeSlotInPast(showtime.date)) {
      return 'bg-gray-400 cursor-not-allowed';
    }
    
    if (selectedShowtimes.some(slot => slot.showtimeId === showtime._id)) {
      return 'bg-orange-500 ring-2 ring-orange-200 shadow-md';
    }
    
    return 'bg-green-500 hover:bg-green-600 shadow-sm';
  };

  // Get button text based on slot status
  const getTimeSlotButtonText = (showtime) => {
    // if (showtime.is_booked) {
    //   return 'Booked';
    // }
    // if (isTimeSlotInPast(showtime.date)) {
    //   return 'Past';
    // }
    
    return new Date(showtime.date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-20 top-24 h-64 w-64 rounded-full bg-cyan-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-36 h-64 w-64 rounded-full bg-amber-200/60 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-1 text-center">
          {/* <p className="inline-flex rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
            Slot Booking
          </p> */}
          <h2 className="mt-1 text-3xl font-black text-slate-900">Book Your Time Slot</h2>
        </div>
        {liveUpdateNotice ? (
          <div className="mb-1 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-1 text-center text-sm font-semibold text-cyan-800">
            {liveUpdateNotice}
          </div>
        ) : null}
      
      {/* Current Time Display */}
      {/* <div className="text-center mb-4">
        <div className="inline-block bg-cyan-50 border border-cyan-200 rounded-lg px-4 py-2">
          <p className="text-sm text-cyan-800 font-medium">
            Current Time: {currentTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            })}
          </p>
          <p className="text-xs text-cyan-700">
            Past time slots for today are disabled automatically
          </p>
        </div>
      </div> */}

      <div className="mt-3 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-[0_16px_35px_-20px_rgba(15,23,42,0.45)]">
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-semibold text-slate-700 sm:text-base">
          {(() => {
            const rating = Number(shopDetails.averageRating ?? 0);
            return (
              <>
          <span>Rating:</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-lg ${
                  star <= Math.round(rating) ? "text-yellow-500" : "text-slate-300"
                }`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="font-black text-yellow-500">
            {rating.toFixed(1)} / 5
          </span>
          <span className="font-medium text-slate-500">
            ({shopDetails.totalReviews ?? 0} reviews)
          </span>
              </>
            );
          })()}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mt-2">
        {/* Left - Calendar & Services */}
        <div className="w-full lg:w-2/5 rounded-2xl border border-white/80 bg-white/90 p-4 shadow-[0_16px_35px_-20px_rgba(15,23,42,0.45)]">
          {/* Date Selector Button */}
          <div className="mb-2">
            <h3 className="text-lg font-bold mb-2 text-gray-700 text-center">Select Date</h3>
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white p-3 transition-colors hover:border-cyan-300"
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
                          ? 'bg-cyan-500 text-white' 
                          : isToday
                            ? 'bg-cyan-100 text-cyan-700 border border-cyan-300'
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
            <div className="mb-4 p-3 bg-cyan-50 rounded border border-cyan-200">
              <p className="text-sm text-cyan-800 text-center font-medium">
                {formatDateDisplay(selectedDate)}
              </p>
            </div>
          )}

          {/* Available Services */}
          <div className="mt-2">
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
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
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
            <div className="text-center py-8 rounded-xl border border-slate-200 bg-slate-50">
              <p className="text-gray-500">No available time slots for this date.</p>
              <p className="text-sm text-gray-400 mt-1">Please select another date.</p>
            </div>
          ) : (
            <div className="text-center py-8 rounded-xl border border-slate-200 bg-slate-50">
              <p className="text-gray-500">Please select a date to view available time slots.</p>
            </div>
          )}
        </div>

        {/* Right - Selected Services */}
        <div className="w-full lg:w-1/5 rounded-2xl border border-white/80 bg-white/95 p-4 shadow-[0_16px_35px_-20px_rgba(15,23,42,0.45)] sticky top-4">
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
                        className="p-1 w-full border border-gray-300 rounded text-xs focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
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
                  className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-amber-400 py-2 font-black text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-slate-300"
                  onClick={handleBookAppointment}
                  disabled={selectedShowtimes.length === 0}
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
    </main>
  );
};

export default DateTimeSelection;








