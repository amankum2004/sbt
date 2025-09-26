import React from "react";
import { useEffect, useState } from "react";
import { api } from "../utils/api";

export default function AdminPendingShops() {
  const [pendingShops, setPendingShops] = useState([]);

  const fetchPending = async () => {
    const res = await api.get("/admin/pending");
    setPendingShops(res.data);
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const approve = async (id) => {
    await api.post(`/admin/approve/${id}`);
    fetchPending();
  };

  const reject = async (id) => {
    await api.delete(`/admin/reject/${id}`);
    fetchPending();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Pending Shop Requests</h2>
      {pendingShops.map((shop) => (
        <div key={shop._id} className="border p-4 mb-3 rounded shadow">
          <h3 className="text-lg font-semibold">
            {shop.shopname} – {shop.city}
          </h3>
          <p>
            <strong>Owner:</strong> {shop.name}
          </p>
          <p>
            <strong>Email:</strong> {shop.email}
          </p>
          <p>
            <strong>Phone:</strong> {shop.phone}
          </p>
          <div>
            <strong>Services:</strong>
            <ul className="list-disc ml-6 mt-1">
              {shop.services.map((s, idx) => (
                <li key={idx}>
                  {s.service} – ₹{s.price}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4">
            <button
              onClick={() => approve(shop._id)}
              className="bg-green-600 text-white px-4 py-1 mr-2 rounded"
            >
              Approve
            </button>
            <button
              onClick={() => reject(shop._id)}
              className="bg-red-600 text-white px-4 py-1 rounded"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}


