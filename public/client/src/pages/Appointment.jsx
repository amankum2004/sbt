import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../store/auth';

const AppointmentForm = () => {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [shopOwnerId, setShopOwnerId] = useState('');
  const [timeSlotId, setTimeSlotId] = useState('');

  const {API} = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/api/appointment`, {
        user_name: userName,
        user_email: userEmail,
        user_phone: userPhone,
        shop_owner_id: shopOwnerId,
        time_slot_id: timeSlotId,
      });
      alert('Appointment booked successfully');
    } catch (error) {
      console.error('Error booking appointment', error);
      alert('Failed to book appointment');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Book Appointment</h2>
      <input
        type="text"
        placeholder="User Name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      <input
        type="email"
        placeholder="User Email"
        value={userEmail}
        onChange={(e) => setUserEmail(e.target.value)}
      />
      <input
        type="text"
        placeholder="User Phone"
        value={userPhone}
        onChange={(e) => setUserPhone(e.target.value)}
      />
      <input
        type="text"
        placeholder="Shop Owner ID"
        value={shopOwnerId}
        onChange={(e) => setShopOwnerId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Time Slot ID"
        value={timeSlotId}
        onChange={(e) => setTimeSlotId(e.target.value)}
      />
      <button type="submit">Book</button>
    </form>
  );
};

export default AppointmentForm;
