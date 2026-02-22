import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";
import {
  FaUsers,
  FaListAlt,
  FaStore,
  FaBell,
  FaEnvelope,
  FaMoneyBillWave,
  FaStar,
  FaArrowRight,
} from "react-icons/fa";

export const AdminHome = () => {
  const [donations, setDonations] = useState([]);
  const [donationLoading, setDonationLoading] = useState(true);
  const [donationError, setDonationError] = useState("");

  const formatDateTime = (dateValue) => {
    if (!dateValue) return "-";
    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) return "-";
    return parsedDate.toLocaleString();
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);

  const quickActions = [
    {
      to: "/admin/users",
      title: "Users",
      subtitle: "Manage accounts and roles",
      icon: FaUsers,
      iconClass: "bg-blue-100 text-blue-700",
    },
    {
      to: "/admin/contacts",
      title: "Contacts",
      subtitle: "Review user messages",
      icon: FaEnvelope,
      iconClass: "bg-rose-100 text-rose-700",
    },
    {
      to: "/admin/services",
      title: "Services",
      subtitle: "Update available services",
      icon: FaListAlt,
      iconClass: "bg-emerald-100 text-emerald-700",
    },
    {
      to: "/admin/shops",
      title: "Shops",
      subtitle: "Control registered shops",
      icon: FaStore,
      iconClass: "bg-violet-100 text-violet-700",
    },
    {
      to: "/admin/requests",
      title: "Requests",
      subtitle: "Approve or reject submissions",
      icon: FaBell,
      iconClass: "bg-amber-100 text-amber-700",
    },
    {
      to: "/admin/reviews",
      title: "Reviews",
      subtitle: "Moderate customer feedback",
      icon: FaStar,
      iconClass: "bg-cyan-100 text-cyan-700",
    },
  ];

  const fetchDonations = useCallback(async () => {
    try {
      setDonationLoading(true);
      setDonationError("");
      const res = await api.get("/donation/received-donations");
      setDonations(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to fetch donations", error);
      setDonationError("Unable to load donations right now.");
      setDonations([]);
    } finally {
      setDonationLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  const recentDonations = useMemo(() => donations.slice(0, 2), [donations]);
  const totalDonationAmount = useMemo(
    () =>
      donations.reduce((sum, donation) => sum + (Number(donation.amount) || 0), 0),
    [donations]
  );
  const latestDonationDate = donations[0]?.createdAt;

  return (
    <section className="space-y-5 sm:space-y-6">
      {/* <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 p-6 text-white shadow-lg sm:p-8">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 left-8 h-40 w-40 rounded-full bg-blue-400/20 blur-2xl" />

        <div className="relative">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-200">
            Overview
          </p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Admin Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-200 sm:text-base">
            Manage users, shops, requests, and donations, etc. from one place.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-200">
                Total Donations
              </p>
              <p className="mt-1 text-xl font-bold">{formatCurrency(totalDonationAmount)}</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-200">
                Donation Entries
              </p>
              <p className="mt-1 text-xl font-bold">{donations.length}</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-200">
                Latest Donation
              </p>
              <p className="mt-1 text-sm font-semibold">
                {latestDonationDate ? formatDateTime(latestDonationDate) : "-"}
              </p>
            </div>
          </div>
        </div>
      </div> */}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Quick Actions</h2>
          <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
            {quickActions.length} Sections
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.to}
                to={action.to}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-lg ${action.iconClass}`}
                  >
                    <Icon />
                  </span>
                  <FaArrowRight className="text-slate-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-slate-700" />
                </div>

                <div className="mt-4">
                  <h3 className="text-base font-bold text-slate-900">{action.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{action.subtitle}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
            <span className="inline-flex items-center gap-2">
              <FaMoneyBillWave className="text-emerald-600" />
              Recent Donations
            </span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchDonations}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              Refresh
            </button>
            <Link
              to="/admin/donations"
              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
            >
              View All
            </Link>
          </div>
        </div>

        {donationLoading ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-blue-600" />
            <p className="mt-3 text-sm text-slate-600">Loading donations...</p>
          </div>
        ) : donationError ? (
          <div className="p-8 text-center">
            <h3 className="text-base font-semibold text-red-700">Failed to load donations</h3>
            <p className="mt-1 text-sm text-slate-600">{donationError}</p>
            <button
              onClick={fetchDonations}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : recentDonations.length === 0 ? (
          <p className="p-8 text-center text-slate-500">No donations received yet.</p>
        ) : (
          <>
            <div className="space-y-3 p-4 md:hidden">
              {recentDonations.map((donation, index) => (
                <article
                  key={donation._id || index}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-bold text-slate-900">{donation.name || "-"}</h3>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {formatCurrency(donation.amount)}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 text-sm text-slate-700">
                    <p className="break-all">
                      <span className="font-semibold text-slate-900">Email:</span>{" "}
                      {donation.email || "-"}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Message:</span>{" "}
                      {donation.message || "-"}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Date:</span>{" "}
                      {formatDateTime(donation.createdAt)}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden p-4 md:block">
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Name</th>
                      <th className="px-4 py-3 font-semibold">Email</th>
                      <th className="px-4 py-3 font-semibold">Amount</th>
                      <th className="px-4 py-3 font-semibold">Message</th>
                      <th className="px-4 py-3 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white text-sm text-slate-700">
                    {recentDonations.map((donation, index) => (
                      <tr key={donation._id || index} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {donation.name || "-"}
                        </td>
                        <td className="px-4 py-3 break-all">{donation.email || "-"}</td>
                        <td className="px-4 py-3 font-semibold text-emerald-700">
                          {formatCurrency(donation.amount)}
                        </td>
                        <td className="px-4 py-3">{donation.message || "-"}</td>
                        <td className="px-4 py-3">{formatDateTime(donation.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
