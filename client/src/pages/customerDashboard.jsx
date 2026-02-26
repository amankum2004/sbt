import React, { useState, useEffect } from 'react';
import { useLogin } from '../components/LoginContext';
import { FaMapMarkerAlt, FaStar, FaTimes, FaRedo } from "react-icons/fa";
import { api } from '../utils/api';
import Swal from 'sweetalert2';
import ReviewForm from '../components/ReviewForm';
import { buildDirectionsLinksFromShop } from "../utils/googleMaps";
import { LoadingSpinner } from "../components/Loading";

const CustomerDashboard = () => {
  const { user } = useLogin();
  const [currentAppointments, setCurrentAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedAppointmentForReview, setSelectedAppointmentForReview] = useState(null);
  const [reviewsGiven, setReviewsGiven] = useState({}); // Track which appointments have been reviewed
  const [userLocation, setUserLocation] = useState(null);
  const [directionsModal, setDirectionsModal] = useState({
    isOpen: false,
    embedUrl: "",
    webUrl: "#",
    shopName: "",
  });

  useEffect(() => {
    if (user?.email) {
      fetchAppointments();
      fetchUserReviews();
    }
  }, [user]);

  // Debug: Log reviewsGiven state changes
  useEffect(() => {
    console.log('🔄 reviewsGiven state updated:', {
      count: Object.keys(reviewsGiven).length,
      keys: Object.keys(reviewsGiven),
      currentAppointmentIds: currentAppointments.map(a => a._id),
      pastAppointmentIds: pastAppointments.map(a => a._id)
    });
  }, [reviewsGiven, currentAppointments, pastAppointments]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.warn("Customer geolocation unavailable:", error);
        setUserLocation(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
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

        console.log('✅ Fetched appointments:', {
          current: sortedCurrent.length,
          past: sortedPast.length,
          currentIds: sortedCurrent.map(a => a._id),
          pastIds: sortedPast.map(a => a._id)
        });

        setCurrentAppointments(sortedCurrent);
        setPastAppointments(sortedPast);
      } else {
        throw new Error(response.data.message || 'Failed to fetch appointments');
      }
    } catch (error) {
      console.error('❌ Error fetching appointments:', error);
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

  const fetchUserReviews = async () => {
  try {
    console.log('🔄 Fetching user reviews...');
    const response = await api.get('/reviews/user');
    console.log('📊 Reviews API response:', response.data);
    
    if (response.data.success) {
      const reviews = Array.isArray(response.data.reviews) ? response.data.reviews : [];

      // Debug: Log the first review's appointmentId structure
      if (reviews.length > 0) {
        const firstReview = reviews[0];
        const appointmentIdValue = firstReview?.appointmentId;
        const isNonNullObject =
          typeof appointmentIdValue === 'object' && appointmentIdValue !== null;

        console.log('🔍 First review appointmentId analysis:', {
          raw: appointmentIdValue,
          type: typeof appointmentIdValue,
          isObject: isNonNullObject,
          keys: isNonNullObject ? Object.keys(appointmentIdValue) : 'N/A',
          stringValue: appointmentIdValue?.toString?.(),
          _id: appointmentIdValue?._id
        });
      }
      
      const reviewsMap = {};
      reviews.forEach((review, index) => {
        // Get appointmentId safely
        let appointmentId;
        
        // Try different ways to extract the appointmentId
        if (!review.appointmentId) {
          console.warn(`Review ${index} has no appointmentId`);
          return;
        }
        
        // If it's a string
        if (typeof review.appointmentId === 'string') {
          appointmentId = review.appointmentId;
        }
        // If it's an object with _id property (populated or ObjectId)
        else if (review.appointmentId && review.appointmentId._id) {
          appointmentId = review.appointmentId._id;
        }
        // If it's an ObjectId or similar object
        else if (review.appointmentId && typeof review.appointmentId === 'object') {
          // Try toString() method
          appointmentId = review.appointmentId.toString?.();
        }
        // Fallback - convert to string
        else {
          appointmentId = String(review.appointmentId);
        }
        
        console.log(`Review ${index} - Extracted appointmentId:`, {
          original: review.appointmentId,
          extracted: appointmentId,
          type: typeof appointmentId
        });
        
        if (appointmentId && appointmentId !== '[object Object]') {
          reviewsMap[appointmentId] = {
            hasReviewed: true,
            reviewId: review._id,
            rating: review.rating
          };
        }
      });
      
      console.log('✅ Built reviews map (actual):', reviewsMap);
      console.log('✅ Review map keys:', Object.keys(reviewsMap));
      
      setReviewsGiven(reviewsMap);
    } else {
      console.log('❌ Failed to fetch reviews:', response.data);
    }
  } catch (error) {
    console.error('❌ Error fetching user reviews:', error);
  }
};

  // Check if appointment is eligible for review
  const isEligibleForReview = (appointment) => {
      // Prevent shop owners from reviewing their own shops
    if (user?.email === appointment.shopId?.email) {
      console.log(`⛔ User is shop owner - cannot review own shop for appointment ${appointment._id}`);
      return false;
    }

    const isCompleted = appointment.status === 'completed';
    const hasAppointmentId = appointment._id;
    const alreadyReviewed = reviewsGiven[appointment._id]?.hasReviewed || false;
    
    const eligible = isCompleted && hasAppointmentId && !alreadyReviewed;
    
    console.log(`🔍 Eligibility check for ${appointment._id}:`, {
      status: appointment.status,
      isCompleted,
      hasAppointmentId,
      alreadyReviewed,
      eligible
    });
    
    return eligible;
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
        // Show loading state
        Swal.fire({
          title: 'Cancelling...',
          text: 'Please wait while we cancel your appointment',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const response = await api.put(`/appoint/appointments/${appointmentId}/cancel`);
        
        // Show success with email note
        Swal.fire({
          title: 'Cancelled!',
          html: `
            <div style="text-align: center;">
              <p>${response.data.message || 'Your appointment has been cancelled.'}</p>
              <p style="font-size: 14px; color: #666; margin-top: 10px;">
                ✅ A confirmation email has been sent to your registered email address.
              </p>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'OK'
        });

        fetchAppointments();
      }

      // if (result.isConfirmed) {
      //   console.log('🚫 Cancelling appointment with ID:', appointmentId);
        
      //   const response = await api.put(`/appoint/appointments/${appointmentId}/cancel`);
        
      //   console.log('✅ Cancel response:', response.data);

      //   Swal.fire({
      //     title: 'Cancelled!',
      //     text: response.data.message || 'Your appointment has been cancelled.',
      //     icon: 'success',
      //     confirmButtonText: 'OK'
      //   });

      //   fetchAppointments();
      // }
    } catch (error) {
      console.error('❌ Error cancelling appointment:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Failed to cancel appointment';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleReviewClick = (appointment) => {
    console.log('⭐ Clicked review for appointment:', appointment._id);
    console.log('Appointment status:', appointment.status);
    console.log('Shop details:', appointment.shopId);
    
    setSelectedAppointmentForReview(appointment);
    setShowReviewForm(true);
  };

  const handleReviewSubmitted = (result) => {
    console.log('📝 Review submitted result:', result);
    
    if (result && result._id && selectedAppointmentForReview?._id) {
      // Successful submission - mark this appointment as reviewed
      setReviewsGiven(prev => ({
        ...prev,
        [selectedAppointmentForReview._id]: {
          hasReviewed: true,
          reviewId: result._id,
          rating: result.rating
        }
      }));
      console.log(`✅ Marked appointment ${selectedAppointmentForReview._id} as reviewed`);
    } else if (result && result.alreadyReviewed && selectedAppointmentForReview?._id) {
      // Already reviewed - update state
      setReviewsGiven(prev => ({
        ...prev,
        [selectedAppointmentForReview._id]: {
          hasReviewed: true,
          reviewId: result.reviewId || 'existing',
          rating: result.rating
        }
      }));
      console.log(`ℹ️ Appointment ${selectedAppointmentForReview._id} was already reviewed`);
    }
    
    // Close the review form
    setShowReviewForm(false);
    setSelectedAppointmentForReview(null);
    
    // Refresh data
    fetchAppointments();
    fetchUserReviews();
  };

  const handleReviewCancel = () => {
    console.log('❌ Review cancelled');
    setShowReviewForm(false);
    setSelectedAppointmentForReview(null);
  };

  const openDirections = (shop) => {
    const { embedUrl, webUrl } = buildDirectionsLinksFromShop({
      shop,
      userLocation,
    });

    if (embedUrl) {
      setDirectionsModal({
        isOpen: true,
        embedUrl,
        webUrl,
        shopName: shop?.shopname || "Shop",
      });
      return;
    }

    if (webUrl && webUrl !== "#") {
      window.open(webUrl, "_blank", "noopener,noreferrer");
    }
  };

  const closeDirectionsModal = () => {
    setDirectionsModal((prev) => ({ ...prev, isOpen: false }));
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
    const directionsLinks = buildDirectionsLinksFromShop({ shop, userLocation });
    const completeAddress = getCompleteAddress(shop);
    const eligibleForReview = isEligibleForReview(appointment);
    const hasReviewed = reviewsGiven[appointment._id]?.hasReviewed || false;
    const firstSlotDate =
      appointment.showtimes?.[0]?.date || appointment.timeSlot?.date || null;
    const extraSlotsCount = Math.max((appointment.showtimes?.length || 0) - 1, 0);

    // Debug logging for each appointment
    useEffect(() => {
      console.log(`📊 Appointment ${appointment._id} details:`, {
        appointmentId: appointment._id,
        shopId: shop?._id,
        status: appointment.status,
        hasReviewed,
        eligibleForReview,
        reviewsGiven: reviewsGiven[appointment._id]
      });
    }, [appointment._id, shop?._id, appointment.status, hasReviewed, eligibleForReview, reviewsGiven]);

    // Format date for display
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    // Short date format for mobile
    const formatShortDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    };

    // Format time for display
    const formatTime = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    // Short time format for mobile
    const formatShortTime = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).replace(':00', '');
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

      if (status === 'completed') {
        return <span className="px-2 py-1 bg-cyan-100 text-cyan-800 rounded-full text-xs font-medium">Service Completed</span>;
      }

      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>;
    };

    return (
      <div className="rounded-2xl border border-white/80 bg-white/90 shadow-[0_16px_35px_-20px_rgba(15,23,42,0.45)] p-4 sm:p-6 mb-4 hover:shadow-lg transition-shadow">
        <div className="mb-4 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                {shop?.shopname || 'Salon Name Not Available'}
              </h3>
              
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

              <div className="flex items-start">
                <FaMapMarkerAlt className="mt-0.5 mr-2 flex-shrink-0 text-cyan-700" />
                <p className="line-clamp-2 text-sm text-slate-600">{completeAddress}</p>
              </div>
            </div>
          </div>

          {/* Appointment Status Badge */}
          <div className="sm:ml-4 self-start sm:self-auto">
            {getStatusBadge(appointment.status, appointment)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Date</p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                {firstSlotDate ? formatShortDate(firstSlotDate) : "N/A"}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Time</p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                {firstSlotDate ? formatShortTime(firstSlotDate) : "N/A"}
              </p>
              {extraSlotsCount > 0 && (
                <p className="mt-0.5 text-[11px] text-slate-500">+{extraSlotsCount} more</p>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white px-2 py-2.5 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Review</p>
              <div className="mt-1 flex min-h-[36px] items-center justify-center">
                {eligibleForReview ? (
                  <button
                    onClick={() => handleReviewClick(appointment)}
                    className="inline-flex h-9 w-full items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-cyan-500 to-amber-400 px-2 text-xs font-black text-slate-950 transition hover:brightness-110"
                  >
                    <FaStar className="text-xs" />
                    Write
                  </button>
                ) : hasReviewed ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <FaStar className="text-xs" />
                    {reviewsGiven[appointment._id]?.rating ? `${reviewsGiven[appointment._id].rating}★` : "Done"}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">N/A</span>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white px-2 py-2.5 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Cancel</p>
              <div className="mt-1 flex min-h-[36px] items-center justify-center">
                {isCurrent && appointment.status === 'confirmed' ? (
                  <button
                    onClick={() => cancelAppointment(appointment._id)}
                    className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-rose-500 px-2 text-xs font-semibold text-white transition hover:bg-rose-600"
                  >
                    Cancel
                  </button>
                ) : (
                  <span className="text-xs text-slate-400">N/A</span>
                )}
              </div>
            </div>

            <div className="col-span-2 rounded-lg border border-slate-200 bg-white px-2 py-2.5 text-center lg:col-span-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Directions</p>
              <div className="mt-1 flex min-h-[36px] items-center justify-center">
                {completeAddress !== 'Location not available' ? (
                  <button
                    type="button"
                    onClick={() => openDirections(shop)}
                    className="inline-flex h-9 w-full items-center justify-center gap-1 rounded-lg border border-cyan-200 bg-cyan-50 px-2 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-100"
                    disabled={!directionsLinks.webUrl || directionsLinks.webUrl === "#"}
                  >
                    <FaMapMarkerAlt className="text-xs" />
                    Get Directions
                  </button>
                ) : (
                  <span className="text-xs text-slate-400">N/A</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Review Modal Component
  const ReviewModal = () => {
    if (!showReviewForm || !selectedAppointmentForReview) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="rounded-2xl border border-white/80 bg-white/95 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto shadow-[0_24px_60px_-28px_rgba(15,23,42,0.5)]">
          <div className="sticky top-0 bg-white p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center z-10">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                Review Your Experience
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedAppointmentForReview.shopId?.shopname}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Appointment ID: {selectedAppointmentForReview._id?.substring(0, 8)}...
              </p>
            </div>
            <button
              onClick={handleReviewCancel}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
          
          <div className="p-4 sm:p-6">
            <ReviewForm 
              shopId={selectedAppointmentForReview.shopId?._id}
              shopName={selectedAppointmentForReview.shopId?.shopname}
              appointmentId={selectedAppointmentForReview._id}
              onReviewSubmitted={handleReviewSubmitted}
              onCancel={handleReviewCancel}
            />
          </div>
        </div>
      </div>
    );
  };

  const DirectionsModal = () => {
    if (!directionsModal.isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
        <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-white/30 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h3 className="text-sm font-bold text-slate-900">
              Directions to {directionsModal.shopName}
            </h3>
            <button
              type="button"
              onClick={closeDirectionsModal}
              className="rounded-md px-2 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Close
            </button>
          </div>
          <div className="aspect-[16/10] w-full bg-slate-100">
            <iframe
              title={`Directions to ${directionsModal.shopName}`}
              src={directionsModal.embedUrl}
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <div className="border-t border-slate-200 px-4 py-3">
            <a
              href={directionsModal.webUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg border border-cyan-300 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-100"
            >
              Open In Google Maps
            </a>
          </div>
        </div>
      </div>
    );
  };

  // Diagnostic function
  const runDiagnostic = () => {
    console.log('=== CUSTOMER DASHBOARD DIAGNOSTIC ===');
    console.log('User:', user?.email);
    console.log('Total appointments reviewed:', Object.keys(reviewsGiven).length);
    console.log('Reviews given:', reviewsGiven);
    
    const allAppointments = [...currentAppointments, ...pastAppointments];
    console.log('\n📊 Appointment Status Check:');
    allAppointments.forEach(appointment => {
      const eligible = isEligibleForReview(appointment);
      const reviewed = reviewsGiven[appointment._id]?.hasReviewed || false;
      console.log(`• ${appointment._id.substring(0, 8)}...:`, {
        status: appointment.status,
        eligible,
        reviewed,
        shouldShowReviewButton: eligible && !reviewed
      });
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50 flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  // Filter past appointments to show only those eligible for review
  const pendingReviewAppointments = pastAppointments.filter(appointment => 
    isEligibleForReview(appointment)
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50 py-4 sm:py-6">
      <div className="pointer-events-none absolute -left-24 top-24 h-64 w-64 rounded-full bg-cyan-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-32 h-64 w-64 rounded-full bg-amber-200/60 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6 rounded-3xl border border-white/80 bg-white/90 p-5 sm:p-6 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.45)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">SalonHub</p>
              <h1 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">My Appointments</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-800">
                Upcoming: {currentAppointments.length}
              </span>
              <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                Pending Reviews: {pendingReviewAppointments.length}
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                Completed: {pastAppointments.filter(apt =>
                  (apt.status === 'completed' || new Date(apt.timeSlot?.date) < new Date()) && apt.status !== 'cancelled'
                ).length}
              </span>
            </div>
          </div>
          {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 gap-2">
            <p className="text-gray-600 text-sm">
              Welcome back, {user?.name || 'Customer'}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={runDiagnostic}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300"
              >
                🔍 Debug
              </button>
              <button
                onClick={fetchUserReviews}
                className="px-3 py-1.5 bg-cyan-100 text-cyan-700 text-xs rounded-lg hover:bg-blue-200 flex items-center gap-1"
              >
                <FaRedo className="text-xs" />
                Refresh Reviews
              </button>
            </div>
          </div> */}
        </div>

        {/* Debug Info Banner (only in development) */}
        {/* {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 bg-gray-100 border border-gray-300 rounded-lg p-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-medium">Debug Info:</span>
              <span className="text-gray-600">
                {Object.keys(reviewsGiven).length} reviewed • {pendingReviewAppointments.length} pending review
              </span>
            </div>
          </div>
        )} */}

        {/* Pending Reviews Banner */}
        {pendingReviewAppointments.length > 0 && (
          <div className="mb-4 sm:mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="flex items-center gap-3 mb-3 sm:mb-0">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FaStar className="text-yellow-600 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Pending Reviews</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    You have {pendingReviewAppointments.length} completed appointment{pendingReviewAppointments.length !== 1 ? 's' : ''} to review
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (pendingReviewAppointments.length > 0) {
                    handleReviewClick(pendingReviewAppointments[0]);
                  }
                }}
                className="bg-gradient-to-r from-cyan-500 to-amber-400 hover:brightness-110 text-slate-950 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-black transition-all duration-200 shadow-sm hover:shadow"
              >
                Write Reviews
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="rounded-3xl border border-white/80 bg-white/90 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.45)] mb-4 sm:mb-6 overflow-hidden">
          <div className="flex border-b border-slate-200 bg-slate-50/70">
            <button
              onClick={() => setActiveTab('current')}
              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-center font-medium text-sm sm:text-base ${
                activeTab === 'current'
                  ? 'text-cyan-700 border-b-2 border-cyan-500 bg-white/90'
                  : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              Upcoming ({currentAppointments.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-center font-medium text-sm sm:text-base ${
                activeTab === 'history'
                  ? 'text-cyan-700 border-b-2 border-cyan-500 bg-white/90'
                  : 'text-slate-500 hover:text-slate-700'
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
                    <div className="mb-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-700">Appointment History</h4>
                        {pendingReviewAppointments.length > 0 && (
                          <p className="text-sm text-gray-500 mt-1">
                            {pendingReviewAppointments.length} appointment{pendingReviewAppointments.length !== 1 ? 's' : ''} pending review
                          </p>
                        )}
                      </div>
                    </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="rounded-2xl border border-white/80 bg-white/95 shadow-[0_16px_35px_-20px_rgba(15,23,42,0.45)] p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-cyan-100 rounded-lg">
                <span className="text-cyan-700 text-xl sm:text-2xl">📅</span>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{currentAppointments.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/95 shadow-[0_16px_35px_-20px_rgba(15,23,42,0.45)] p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-emerald-100 rounded-lg">
                <span className="text-emerald-600 text-xl sm:text-2xl">✅</span>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Completed</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {pastAppointments.filter(apt =>
                    (apt.status === 'completed' || new Date(apt.timeSlot?.date) < new Date()) && apt.status !== 'cancelled'
                  ).length}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/95 shadow-[0_16px_35px_-20px_rgba(15,23,42,0.45)] p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-amber-100 rounded-lg">
                <span className="text-amber-600 text-xl sm:text-2xl">⭐</span>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">To Review</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {pendingReviewAppointments.length}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/95 shadow-[0_16px_35px_-20px_rgba(15,23,42,0.45)] p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-rose-100 rounded-lg">
                <span className="text-rose-600 text-xl sm:text-2xl">❌</span>
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

      {/* Review Modal */}
      <ReviewModal />
      <DirectionsModal />
    </main>
  );
};

export default CustomerDashboard;
