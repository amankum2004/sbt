import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { LoadingSpinner } from "../components/Loading";

export const AdminViewDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchBy, setSearchBy] = useState("all");
  const [searchText, setSearchText] = useState("");

  const fetchDonations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/donation/received-donations");
      setDonations(Array.isArray(res.data) ? res.data : []);
    } catch (fetchError) {
      console.error("Failed to fetch donations", fetchError);
      setError("Failed to load donations. Please try again later.");
      setDonations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const formatDateTime = (dateValue) => {
    if (!dateValue) return "-";
    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) return "-";
    return parsedDate.toLocaleString();
  };

  const normalizedSearchText = searchText.trim().toLowerCase();

  const filteredDonations = donations.filter((donation) => {
    if (!normalizedSearchText) return true;

    const searchableData = {
      name: String(donation.name || "").toLowerCase(),
      email: String(donation.email || "").toLowerCase(),
      amount: String(donation.amount ?? "").toLowerCase(),
      message: String(donation.message || "").toLowerCase(),
      date: String(formatDateTime(donation.createdAt) || "").toLowerCase(),
      id: String(donation._id || "").toLowerCase(),
    };

    if (searchBy === "all") {
      return Object.values(searchableData).some((value) => value.includes(normalizedSearchText));
    }

    return searchableData[searchBy]?.includes(normalizedSearchText);
  });

  const totalAmount = donations.reduce(
    (sum, donation) => sum + parseFloat(donation.amount || 0),
    0
  );
  const filteredAmount = filteredDonations.reduce(
    (sum, donation) => sum + parseFloat(donation.amount || 0),
    0
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-10">
        <div className="max-w-5xl mx-auto bg-white shadow-md rounded-xl p-6">
          <div className="flex justify-center items-center py-10">
            <LoadingSpinner size="xl" />
          </div>
          <p className="text-center text-gray-600 mt-4">Loading donations...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-10">
        <div className="max-w-5xl mx-auto bg-white shadow-md rounded-xl p-6">
          <div className="text-center py-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Donations</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchDonations}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-xl p-6">
        <div className="mb-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-green-700">🌍 Donation Records</h2>
              <p className="text-gray-600">
                Showing: {filteredDonations.length}{normalizedSearchText ? ` / ${donations.length}` : ""}
              </p>
            </div>
            <button
              onClick={fetchDonations}
              className="h-10 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Refresh
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-[200px_1fr_auto] gap-3">
            <select
              value={searchBy}
              onChange={(event) => setSearchBy(event.target.value)}
              className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
            >
              <option value="all">All Fields</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="amount">Amount</option>
              <option value="message">Message</option>
              <option value="date">Date</option>
              <option value="id">Donation ID</option>
            </select>
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder={`Search by ${searchBy === "all" ? "any field" : searchBy}...`}
              className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
            />
            <button
              onClick={() => setSearchText("")}
              disabled={!searchText}
              className="h-11 rounded-lg border border-gray-300 bg-gray-50 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear
            </button>
          </div>
        </div>

        {donations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 text-gray-400">💝</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Donations Yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              There are no donation records in the database at the moment. 
              Donations will appear here once supporters start contributing.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-green-600 text-white">
                  <th className="p-3 border text-left">Name</th>
                  <th className="p-3 border text-left">Email</th>
                  <th className="p-3 border text-left">Amount (₹)</th>
                  <th className="p-3 border text-left">Message</th>
                  <th className="p-3 border text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 border text-center text-gray-500">
                      No matching donations found.
                    </td>
                  </tr>
                ) : (
                  filteredDonations.map((donation, index) => (
                    <tr 
                      key={donation._id || index} 
                      className="border-t hover:bg-gray-50 transition duration-150"
                    >
                      <td className="p-3 border">{donation.name}</td>
                      <td className="p-3 border text-blue-600">{donation.email}</td>
                      <td className="p-3 border font-semibold text-green-700">₹{donation.amount}</td>
                      <td className="p-3 border max-w-xs">
                        {donation.message ? (
                          <div className="break-words">{donation.message}</div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-3 border text-gray-600">
                        {formatDateTime(donation.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            {/* Summary */}
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <p className="text-green-800 font-semibold">
                Total Amount (Visible Rows): ₹{filteredAmount}
              </p>
              {normalizedSearchText ? (
                <p className="text-sm text-green-700 mt-1">Overall Total Amount: ₹{totalAmount}</p>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};




