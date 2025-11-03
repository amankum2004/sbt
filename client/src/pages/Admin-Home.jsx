import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";
import {
  FaUsers,
  FaListAlt,
  FaStore,
  FaBell,
  FaEnvelope,
  FaMoneyBillWave,
} from "react-icons/fa";

export const AdminHome = () => {
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await api.get("donation/received-donations");
        setDonations(res.data);
      } catch (error) {
        console.error("Failed to fetch donations", error);
      }
    };

    fetchDonations();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome to your administration panel. Here you can manage all aspects
          of your platform.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Link
          to="/admin/users"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <FaUsers className="text-blue-500 text-2xl mr-4" />
            <div>
              <h3 className="font-semibold text-gray-800">Users</h3>
              <p className="text-2xl font-bold">Manage Users</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/contacts"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <FaEnvelope className="text-red-500 text-2xl mr-4" />
            <div>
              <h3 className="font-semibold text-gray-800">Contacts</h3>
              <p className="text-2xl font-bold">User Messages</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/services"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <FaListAlt className="text-green-500 text-2xl mr-4" />
            <div>
              <h3 className="font-semibold text-gray-800">Services</h3>
              <p className="text-2xl font-bold">Manage Services</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/shops"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <FaStore className="text-purple-500 text-2xl mr-4" />
            <div>
              <h3 className="font-semibold text-gray-800">Shops</h3>
              <p className="text-2xl font-bold">Shop Management</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/requests"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <FaBell className="text-red-500 text-2xl mr-4" />
            <div>
              <h3 className="font-semibold text-gray-800">Requests</h3>
              <p className="text-2xl font-bold">Pending Actions</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Donations Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-black-700 flex items-center">
            <FaMoneyBillWave className="text-green-500 mr-2" />
            Donations Received
          </h2>

          <Link
            to="/admin/donations"
            className="text-sm text-blue-600 hover:underline"
          >
            View All
          </Link>
        </div>

        {donations.length === 0 ? (
          <p className="text-center text-gray-500">No donations received yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Amount (₹)</th>
                  <th className="p-3 text-left">Message</th>
                  <th className="p-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {donations.slice(0, 5).map((donation, index) => (
                  <tr
                    key={index}
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3">{donation.name}</td>
                    <td className="p-3">{donation.email}</td>
                    <td className="p-3 font-semibold text-green-600">
                      ₹{donation.amount}
                    </td>
                    <td className="p-3">{donation.message || "-"}</td>
                    <td className="p-3 text-gray-500">
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





