import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { api } from "../utils/api";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaStore,
  FaTimesCircle,
  FaTools,
  FaUser,
} from "react-icons/fa";

export default function AdminPendingShops() {
  const [pendingShops, setPendingShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionShopId, setActionShopId] = useState("");
  const [actionType, setActionType] = useState("");
  const [searchBy, setSearchBy] = useState("all");
  const [searchText, setSearchText] = useState("");

  const broadcastPendingCount = (count) => {
    window.dispatchEvent(
      new CustomEvent("admin:pending-updated", {
        detail: { count },
      })
    );
  };

  const formatDateTime = (dateValue) => {
    if (!dateValue) return "N/A";
    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) return "N/A";
    return parsedDate.toLocaleString();
  };

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/pending");
      const shops = Array.isArray(res.data) ? res.data : [];
      setPendingShops(shops);
    } catch (error) {
      console.error("Failed to fetch pending shops", error);
      setPendingShops([]);
      Swal.fire({
        title: "Error",
        text: "Failed to load pending requests.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  useEffect(() => {
    broadcastPendingCount(pendingShops.length);
  }, [pendingShops.length]);

  const normalizedSearchText = searchText.trim().toLowerCase();

  const filteredPendingShops = pendingShops.filter((shop) => {
    if (!normalizedSearchText) return true;

    const servicesText = Array.isArray(shop.services)
      ? shop.services.map((service) => `${service.service} ${service.price}`).join(" ")
      : "";

    const searchableData = {
      shopname: String(shop.shopname || "").toLowerCase(),
      owner: String(shop.name || "").toLowerCase(),
      email: String(shop.email || "").toLowerCase(),
      phone: String(shop.phone || "").toLowerCase(),
      city: String(shop.city || "").toLowerCase(),
      district: String(shop.district || "").toLowerCase(),
      state: String(shop.state || "").toLowerCase(),
      pin: String(shop.pin || "").toLowerCase(),
      services: String(servicesText || "").toLowerCase(),
      submitted: String(formatDateTime(shop.createdAt) || "").toLowerCase(),
    };

    if (searchBy === "all") {
      return Object.values(searchableData).some((value) => value.includes(normalizedSearchText));
    }

    return searchableData[searchBy]?.includes(normalizedSearchText);
  });

  const removeShopFromList = (shopId) => {
    setPendingShops((prev) => prev.filter((shop) => shop._id !== shopId));
  };

  const approve = async (shop) => {
    const result = await Swal.fire({
      title: "Approve this shop?",
      html: `<strong>${shop.shopname}</strong><br/>This request will move to approved shops.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#15803d",
      cancelButtonColor: "#4b5563",
      confirmButtonText: "Yes, approve",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      setActionShopId(shop._id);
      setActionType("approve");
      await api.post(`/admin/approve/${shop._id}`);
      removeShopFromList(shop._id);

      await Swal.fire({
        title: "Approved",
        text: `${shop.shopname} has been approved successfully.`,
        icon: "success",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Approve failed", error);
      Swal.fire({
        title: "Approval Failed",
        text: error?.response?.data?.message || "Could not approve this shop.",
        icon: "error",
      });
    } finally {
      setActionShopId("");
      setActionType("");
    }
  };

  const reject = async (shop) => {
    const result = await Swal.fire({
      title: "Reject this request?",
      html: `<strong>${shop.shopname}</strong><br/>This request will be deleted permanently.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#4b5563",
      confirmButtonText: "Yes, reject",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      setActionShopId(shop._id);
      setActionType("reject");
      await api.delete(`/admin/reject/${shop._id}`);
      removeShopFromList(shop._id);

      await Swal.fire({
        title: "Rejected",
        text: `${shop.shopname} request has been rejected.`,
        icon: "success",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Reject failed", error);
      Swal.fire({
        title: "Reject Failed",
        text: error?.response?.data?.message || "Could not reject this shop.",
        icon: "error",
      });
    } finally {
      setActionShopId("");
      setActionType("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg px-8 py-8 border border-slate-200 flex items-center gap-3">
          <div className="h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          <span className="text-slate-700 font-medium">Loading pending requests...</span>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-emerald-50 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Admin Queue
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">Pending Shop Requests</h2>
            <p className="text-slate-600 mt-1">
              Review new shop registrations and take final action.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-100 px-4 py-2 text-amber-900 font-semibold">
            <FaClock className="text-sm" />
            Showing: {filteredPendingShops.length}{normalizedSearchText ? ` / ${pendingShops.length}` : ""} Pending
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-3">
          <select
            value={searchBy}
            onChange={(event) => setSearchBy(event.target.value)}
            className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          >
            <option value="all">All Fields</option>
            <option value="shopname">Shop Name</option>
            <option value="owner">Owner</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="city">City</option>
            <option value="district">District</option>
            <option value="state">State</option>
            <option value="pin">Pin Code</option>
            <option value="services">Services</option>
            <option value="submitted">Submitted At</option>
          </select>
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder={`Search by ${searchBy === "all" ? "any field" : searchBy}...`}
            className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
          <button
            onClick={() => setSearchText("")}
            disabled={!searchText}
            className="h-11 rounded-lg border border-slate-300 bg-slate-50 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>

      {pendingShops.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-12 text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl">
            <FaCheckCircle />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mt-4">All Caught Up</h3>
          <p className="text-slate-600 mt-2">No pending shop requests right now.</p>
        </div>
      ) : filteredPendingShops.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-12 text-center">
          <h3 className="text-xl font-bold text-slate-800">No matching requests</h3>
          <p className="text-slate-600 mt-2">Try a different search field or keyword.</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {filteredPendingShops.map((shop) => {
            const isActionPending = actionShopId === shop._id;

            return (
              <article
                key={shop._id}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="border-b border-slate-100 px-5 py-4 bg-gradient-to-r from-slate-50 to-white rounded-t-2xl">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                        <FaStore />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 truncate">{shop.shopname}</h3>
                        <p className="text-sm text-slate-600 truncate">
                          {shop.street}, {shop.city}, {shop.district}, {shop.state} - {shop.pin}
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-slate-600 inline-flex items-center gap-2">
                      <FaCalendarAlt />
                      Submitted: {formatDateTime(shop.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="px-5 py-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                      <p className="text-xs text-slate-500 uppercase tracking-wide flex items-center gap-2">
                        <FaUser /> Owner
                      </p>
                      <p className="text-slate-800 font-semibold mt-1">{shop.name}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                      <p className="text-xs text-slate-500 uppercase tracking-wide flex items-center gap-2">
                        <FaEnvelope /> Email
                      </p>
                      <p className="text-slate-800 font-semibold mt-1 break-all">{shop.email}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                      <p className="text-xs text-slate-500 uppercase tracking-wide flex items-center gap-2">
                        <FaPhoneAlt /> Phone
                      </p>
                      <p className="text-slate-800 font-semibold mt-1">{shop.phone}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs text-slate-500 uppercase tracking-wide flex items-center gap-2 mb-3">
                      <FaTools /> Services
                    </p>
                    {Array.isArray(shop.services) && shop.services.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {shop.services.map((service, idx) => (
                          <span
                            key={`${service.service}-${idx}`}
                            className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-800"
                          >
                            {service.service} - ₹{service.price}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No services provided.</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 pt-1">
                    <button
                      onClick={() => approve(shop)}
                      disabled={isActionPending}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-4 py-2.5 font-semibold transition-colors"
                    >
                      <FaCheckCircle />
                      {isActionPending && actionType === "approve" ? "Approving..." : "Approve Shop"}
                    </button>
                    <button
                      onClick={() => reject(shop)}
                      disabled={isActionPending}
                      className="inline-flex items-center gap-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white px-4 py-2.5 font-semibold transition-colors"
                    >
                      <FaTimesCircle />
                      {isActionPending && actionType === "reject" ? "Rejecting..." : "Reject Shop"}
                    </button>
                    <span className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-300 text-slate-700 px-3 py-2.5 text-sm">
                      <FaMapMarkerAlt className="text-slate-500" />
                      Status: Pending Approval
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
