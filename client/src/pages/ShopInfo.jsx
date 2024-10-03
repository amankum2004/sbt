import React from "react"; 
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../components/LoginContext'
import { api } from '../utils/api';

const DateTimeSelection = () => {
  const { shopId } = useParams();
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedShowtimes, setSelectedShowtimes] = useState([]); // Track selected time slots
  const [showtimeServices, setShowtimeServices] = useState({}); // Track service selected for each time slot
  const [totalAmount, setTotalAmount] = useState(0); // Total price
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
    try {
      const response = await api.get(`/time/shops/${shopId}/available`);
      setTimeSlots(response.data);
    } catch (error) {
      console.error('Failed to fetch time slots:', error.response ? error.response.data : error.message);
    }
  };

  const fetchShopDetails = async () => {
    try {
      const response = await api.get(`/shop/shoplists/${shopId}`);
      setShopDetails(response.data);
    } catch (error) {
      console.error('Failed to fetch shop details:', error.response ? error.response.data : error.message);
    }
  };

  const fetchCustomerEmail = async () => {
    setCustomerEmail(user.email);
    setCustomerName(user.name);
  };

  const handleShowtimeSelect = (timeSlotId, showtimeId, showtimeDate) => {
    const isAlreadySelected = selectedShowtimes.some(
      (slot) => slot.showtimeId === showtimeId
    );
    if (isAlreadySelected) {
      const updatedShowtimes = selectedShowtimes.filter(
        (slot) => slot.showtimeId !== showtimeId
      );
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
    const servicePrices = Object.values(updatedServices).map((service) => parseInt(service.price));
    setTotalAmount(servicePrices.reduce((sum, price) => sum + price, 0));
  };

  const handleBookAppointment = () => {
    if (selectedShowtimes.length === 0 || Object.keys(showtimeServices).length !== selectedShowtimes.length) {
      alert("Please select a service for each time slot before booking.");
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
    <div className="p-5 mx-auto relative">
      <h2 className="text-2xl font-bold mb-5 text-center">Book Your Time Slot</h2>
      <div className="flex">
        <div className="space-y-5 w-2/3">
          {timeSlots.length > 0 ? (
            <>
              {timeSlots.map((timeSlot) => (
                <div key={timeSlot._id} className="bg-gray-100 p-4 rounded-lg shadow-md">
                  <h3 className="text-xl mb-2 text-gray-800">Date: {new Date(timeSlot.date).toLocaleDateString('en-IN')}</h3>
                  <div className="flex gap-2 flex-wrap">
                    {timeSlot.showtimes.map((showtime) => (
                      <button
                        key={showtime._id}
                        className={`px-4 py-2 rounded-lg text-white transition-colors duration-300 min-w-[80px] text-center ${
                          showtime.is_booked
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
              ))}
            </>
          ) : (
            <h2 className="text-red-600 text-xl text-center mt-5">No available time slots for this shop.</h2>
          )}
        </div>

        <div className="w-1/3 mt-10 p-4 bg-gray-50 border-l-2 border-gray-200">
          <h3 className="text-lg font-semibold mb-2 text-center">Select a Service for Showtime</h3>
          {selectedShowtimes.map(({ showtimeId }) => (
            <div key={showtimeId} className="mb-4">
              {shopDetails.services ? (
                <select
                  onChange={(e) =>
                    handleServiceSelect(showtimeId, shopDetails.services.find(service => service.service === e.target.value))
                  }
                  value={showtimeServices[showtimeId]?.service || ""}
                  className="p-2 w-full border border-gray-300 rounded"
                >
                  <option value="">Select a Service</option>
                  {shopDetails.services.map((service) => (
                    <option key={service.service} value={service.service}>
                      {service.service} - ₹{service.price}
                    </option>
                  ))}
                </select>
              ) : (
                <p>No services available for this shop.</p>
              )}
            </div>
          ))}

          <h3 className="text-lg font-semibold">Total Amount: ₹{totalAmount}</h3>
          <button
            className="mt-5 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 w-full"
            onClick={handleBookAppointment}
            disabled={selectedShowtimes.length === 0 || Object.keys(showtimeServices).length !== selectedShowtimes.length}
          >
            Book Appointment
          </button>
        </div>
      </div>

      {/* Floating box for services on the right side */}
      {shopDetails.services && (
        <div className="absolute top-5 right-5 w-64 p-4 bg-white rounded-lg border border-gray-800">
          <h3 className="text-lg font-bold mb-2 text-gray-700">Services Offered</h3>
          <ul className="space-y-2">
            {shopDetails.services.map((service) => (
              <li key={service.service} className="flex justify-between">
                <span>{service.service}</span>
                <span>₹{service.price}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DateTimeSelection;
