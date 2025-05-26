import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

const Donate = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    amount: '',
    message: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/donation/donate", form);
      alert("Thank you for your donation!");
      setForm({ name: '', email: '', amount: '', message: '' });
      navigate('/');
    } catch (error) {
      console.error(error);
      alert("Failed to submit donation.");
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="max-w-2xl w-full bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-green-700 mb-6">
          Donate for the Environment 🌱
        </h2>
        <p className="text-gray-700 text-center mb-8">
          Help us plant trees, reduce pollution, and build a sustainable future. Every rupee counts.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Your Name"
            className="w-full px-4 py-3 border rounded-lg"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="Your Email"
            className="w-full px-4 py-3 border rounded-lg"
          />
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            required
            placeholder="Amount (₹)"
            className="w-full px-4 py-3 border rounded-lg"
          />
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows="3"
            placeholder="Your Message (Optional)"
            className="w-full px-4 py-3 border rounded-lg"
          />
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg"
          >
            Donate Now
          </button>
        </form>

        <p className="text-xs text-center text-gray-400 mt-6">
          100% of your donation will go towards environmental initiatives.
        </p>
      </div>
    </div>
  );
};

export default Donate;
