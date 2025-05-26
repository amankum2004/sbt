import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';

const AdminViewDonations = () => {
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await api.get("donation/donate");
        setDonations(res.data);
      } catch (error) {
        console.error("Failed to fetch donations", error);
      }
    };

    fetchDonations();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-xl p-6">
        <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">🌍 Donation Records</h2>

        {donations.length === 0 ? (
          <p className="text-center text-gray-500">No donations yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-green-600 text-white">
                  <th className="p-3 border">Name</th>
                  <th className="p-3 border">Email</th>
                  <th className="p-3 border">Amount (₹)</th>
                  <th className="p-3 border">Message</th>
                  <th className="p-3 border">Date</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((donation, index) => (
                  <tr key={index} className="text-center border-t">
                    <td className="p-2 border">{donation.name}</td>
                    <td className="p-2 border">{donation.email}</td>
                    <td className="p-2 border">{donation.amount}</td>
                    <td className="p-2 border text-left">{donation.message || "-"}</td>
                    <td className="p-2 border">
                      {new Date(donation.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminViewDonations;
