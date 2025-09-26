import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { useLogin } from '../components/LoginContext';
import { api } from '../utils/api';
import { useLoading } from "../components/Loading";

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
  const navigate = useNavigate();
  const { user } = useLogin();

  useEffect(() => {
    fetchTimeSlots();
    fetchShopDetails();
    fetchCustomerEmail();
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

  const handleShowtimeSelect = (timeSlotId, showtimeId, showtimeDate) => {
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
        location: shopDetails.city,
        showtimeServices,
      },
    });
  };

  return (
    <div className="p-5 mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Book Your Time Slot</h2>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left - Available Services */}
        <div className="w-full lg:w-1/4 bg-white rounded-lg p-3 border border-gray-300 shadow-sm">
          <h3 className="text-lg font-bold mb-2 text-gray-700 text-center">Available Services</h3>
          {shopDetails.services ? (
            <ul className="space-y-2">
              {shopDetails.services.map((service) => (
                <li key={service.service} className="flex justify-between text-sm">
                  <span>{service.service}</span>
                  <span>₹{service.price}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No services available.</p>
          )}
        </div>

        {/* Middle - Time Slots */}
        <div className="w-full lg:w-2/4 space-y-5">
          {timeSlots.length > 0 ? (
            timeSlots.map((timeSlot) => (
              <div key={timeSlot._id} className="bg-gray-100 p-4 rounded-lg shadow-sm">
                <h3 className="text-md font-semibold text-gray-800 mb-2">
                  Date: {new Date(timeSlot.date).toLocaleDateString('en-IN')}
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {timeSlot.showtimes.map((showtime) => (
                    <button
                      key={showtime._id}
                      className={`px-4 py-2 rounded-lg text-white min-w-[80px] text-center text-sm transition-colors duration-300 ${showtime.is_booked
                          ? 'bg-red-500 cursor-not-allowed'
                          : selectedShowtimes.some(slot => slot.showtimeId === showtime._id)
                            ? 'bg-orange-600'
                            : 'bg-green-500 hover:bg-green-600'
                        }`}
                      disabled={showtime.is_booked}
                      onClick={() => handleShowtimeSelect(timeSlot._id, showtime._id, showtime.date)}
                    >
                      {new Date(showtime.date).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </button>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <h2 className="text-red-600 text-center text-xl mt-5">No available time slots for this shop.</h2>
          )}
        </div>

        {/* Right - Choose Services */}
        <div className="w-full lg:w-1/4 lg:mt-0 bg-white p-4 border border-gray-300 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-center">Choose service for selected time</h3>
          {selectedShowtimes.map(({ showtimeId }) => (
            <div key={showtimeId} className="mb-4">
              {shopDetails.services ? (
                <select
                  onChange={(e) =>
                    handleServiceSelect(showtimeId, shopDetails.services.find(service => service.service === e.target.value))
                  }
                  value={showtimeServices[showtimeId]?.service || ""}
                  className="p-2 w-full border border-gray-300 rounded text-sm"
                >
                  <option value="">Select a Service</option>
                  {shopDetails.services.map((service) => (
                    <option key={service.service} value={service.service}>
                      {service.service} - ₹{service.price}
                    </option>
                  ))}
                </select>
              ) : (
                <p>No services available.</p>
              )}
            </div>
          ))}

          <h3 className="text-md font-semibold mt-3">Total Amount: ₹{totalAmount}</h3>
          <button
            className="mt-4 px-4 py-2 w-full bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
            onClick={handleBookAppointment}
            disabled={selectedShowtimes.length === 0 || Object.keys(showtimeServices).length !== selectedShowtimes.length}
          >
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateTimeSelection;
