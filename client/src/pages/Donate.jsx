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
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-200 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl bg-white shadow-2xl rounded-3xl p-10 border border-green-200">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold text-green-700">Donate for the Environment 🌱</h2>
          <p className="mt-4 text-gray-600 text-lg">
            Help us plant trees, reduce pollution, and build a sustainable future.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Your Name"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="Your Email"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            required
            placeholder="Amount (₹)"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows="4"
            placeholder="Your Message (Optional)"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-semibold py-3 rounded-xl transition duration-300 shadow-md hover:shadow-lg"
          >
            🌍 Donate Now
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-400">
          100% of your donation will go towards environmental initiatives.
        </p>
      </div>
    </div>
  );
};

export default Donate;
