import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaCalendarCheck,
  FaCalendarDay,
  FaCalendarWeek,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaRupeeSign,
  FaStore,
  FaTimesCircle,
  FaUsers,
} from "react-icons/fa";
import { useLogin } from "../components/LoginContext";
import { api } from "../utils/api";

const PERIOD_OPTIONS = [
  { key: "day", label: "Daily", subLabel: "Today", icon: FaCalendarDay },
  { key: "week", label: "Weekly", subLabel: "This Week", icon: FaCalendarWeek },
  { key: "month", label: "Monthly", subLabel: "This Month", icon: FaCalendarAlt },
  { key: "year", label: "Yearly", subLabel: "This Year", icon: FaCalendarCheck },
];

const createEmptyAnalytics = (period) => ({
  period,
  summary: {
    totalAppointments: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    grossRevenue: 0,
    realizedRevenue: 0,
    expectedRevenue: 0,
    cancelledRevenueLoss: 0,
    averageTicketSize: 0,
    completionRate: 0,
    cancellationRate: 0,
  },
  analytics: [],
  topServices: [],
});

const DEFAULT_ANALYTICS_MAP = {
  day: createEmptyAnalytics("day"),
  week: createEmptyAnalytics("week"),
  month: createEmptyAnalytics("month"),
  year: createEmptyAnalytics("year"),
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatCompactNumber = (value) =>
  new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value || 0));

const formatDateInputValue = (dateValue = new Date()) => {
  const date = new Date(dateValue);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatMonthInputValue = (dateValue = new Date()) => {
  const date = new Date(dateValue);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const getPeriodQueryParams = (period, selectedDayDate, selectedMonthValue, selectedYearValue) => {
  if (period === "day") {
    return { period, date: selectedDayDate };
  }

  if (period === "month") {
    const [yearPart, monthPart] = String(selectedMonthValue || "").split("-");
    const year = Number.parseInt(yearPart, 10);
    const month = Number.parseInt(monthPart, 10);
    const today = new Date();

    return {
      period,
      year: Number.isFinite(year) ? year : today.getFullYear(),
      month: Number.isFinite(month) ? month : today.getMonth() + 1,
    };
  }

  if (period === "year") {
    const year = Number.parseInt(selectedYearValue, 10);
    return { period, year: Number.isFinite(year) ? year : new Date().getFullYear() };
  }

  return { period };
};

const getStatusCardMeta = (status) => {
  switch (status) {
    case "none":
      return {
        icon: "🏪",
        title: "Shop Not Registered",
        message: "Register your shop first to unlock analytics and revenue insights.",
        actionLabel: "Register Shop",
        actionPath: "/registershop",
      };
    case "pending":
      return {
        icon: "⏳",
        title: "Shop Pending Approval",
        message: "Your shop is under review. Analytics will be available after approval.",
        actionLabel: "View Profile",
        actionPath: "/barberprofile",
      };
    default:
      return {
        icon: "❌",
        title: "Unable To Load Shop",
        message: "We could not fetch your shop details right now. Please try again.",
        actionLabel: "Go To Profile",
        actionPath: "/barberprofile",
      };
  }
};

const BarberAnalyticsDashboard = () => {
  const { user } = useLogin();
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [shopStatus, setShopStatus] = useState("checking");
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [analyticsByPeriod, setAnalyticsByPeriod] = useState(DEFAULT_ANALYTICS_MAP);
  const [periodAnalytics, setPeriodAnalytics] = useState(createEmptyAnalytics("month"));
  const [periodLoading, setPeriodLoading] = useState(false);
  const [selectedDayDate, setSelectedDayDate] = useState(() => formatDateInputValue(new Date()));
  const [selectedMonthValue, setSelectedMonthValue] = useState(() => formatMonthInputValue(new Date()));
  const [selectedYearValue, setSelectedYearValue] = useState(() => String(new Date().getFullYear()));

  const monthOptions = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 24 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
      const value = formatMonthInputValue(date);
      const label = date.toLocaleString("en-IN", { month: "long", year: "numeric" });
      return { value, label };
    });
  }, []);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 12 }, (_, index) => currentYear - index);
    const selectedYear = Number.parseInt(selectedYearValue, 10);
    if (Number.isFinite(selectedYear) && !years.includes(selectedYear)) {
      years.push(selectedYear);
    }
    return years.sort((a, b) => b - a);
  }, [selectedYearValue]);

  const activePeriodLabel = useMemo(() => {
    if (selectedPeriod === "day") {
      const selectedDate = new Date(`${selectedDayDate}T00:00:00`);
      if (Number.isNaN(selectedDate.getTime())) return "Daily Revenue";
      return selectedDate.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }

    if (selectedPeriod === "month") {
      const [yearPart, monthPart] = String(selectedMonthValue || "").split("-");
      const year = Number.parseInt(yearPart, 10);
      const month = Number.parseInt(monthPart, 10);
      if (!Number.isFinite(year) || !Number.isFinite(month)) return "Monthly Revenue";
      return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      });
    }

    if (selectedPeriod === "year") {
      return selectedYearValue;
    }

    return "This Week";
  }, [selectedPeriod, selectedDayDate, selectedMonthValue, selectedYearValue]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchAnalytics = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const shopResponse = await api.get(`/shop/by-email/${user.email}`);
        const latestShop = shopResponse?.data;

        if (!latestShop?._id) {
          setShopStatus("none");
          setShop(null);
          return;
        }

        setShop(latestShop);

        if (!latestShop.isApproved) {
          setShopStatus("pending");
          return;
        }

        setShopStatus("approved");

        const periods = PERIOD_OPTIONS.map((item) => item.key);
        const settledResults = await Promise.allSettled(
          periods.map((period) =>
            api.get(`/appoint/analytics/${latestShop._id}`, { params: { period } })
          )
        );

        const nextAnalytics = { ...DEFAULT_ANALYTICS_MAP };
        let successfulResponses = 0;

        settledResults.forEach((result, index) => {
          const period = periods[index];
          if (result.status === "fulfilled" && result.value?.data?.success) {
            nextAnalytics[period] = {
              ...createEmptyAnalytics(period),
              ...result.value.data,
            };
            successfulResponses += 1;
          }
        });

        setAnalyticsByPeriod(nextAnalytics);
        setPeriodAnalytics(nextAnalytics[selectedPeriod] || createEmptyAnalytics(selectedPeriod));

        if (successfulResponses === 0) {
          setErrorMessage("Analytics data is not available yet. Start receiving appointments to see insights.");
        }
      } catch (error) {
        console.error("Error loading barber analytics:", error);
        setShopStatus("error");
        setErrorMessage(error?.response?.data?.error || "Failed to load analytics dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user?.email, navigate]);

  useEffect(() => {
    if (shopStatus !== "approved" || !shop?._id) return;

    const params = getPeriodQueryParams(
      selectedPeriod,
      selectedDayDate,
      selectedMonthValue,
      selectedYearValue
    );

    let isMounted = true;

    const fetchSelectedPeriodAnalytics = async () => {
      setPeriodLoading(true);
      try {
        const response = await api.get(`/appoint/analytics/${shop._id}`, { params });
        if (!isMounted) return;

        if (response?.data?.success) {
          setPeriodAnalytics({
            ...createEmptyAnalytics(selectedPeriod),
            ...response.data,
          });
        } else {
          setPeriodAnalytics(createEmptyAnalytics(selectedPeriod));
        }
      } catch (error) {
        console.error("Error loading selected period analytics:", error);
        if (isMounted) {
          setPeriodAnalytics(createEmptyAnalytics(selectedPeriod));
        }
      } finally {
        if (isMounted) {
          setPeriodLoading(false);
        }
      }
    };

    fetchSelectedPeriodAnalytics();

    return () => {
      isMounted = false;
    };
  }, [shop?._id, shopStatus, selectedPeriod, selectedDayDate, selectedMonthValue, selectedYearValue]);

  const currentAnalytics = periodAnalytics?.period === selectedPeriod
    ? periodAnalytics
    : createEmptyAnalytics(selectedPeriod);
  const summary = currentAnalytics.summary || createEmptyAnalytics(selectedPeriod).summary;
  const trend = Array.isArray(currentAnalytics.analytics) ? currentAnalytics.analytics : [];
  const topServices = Array.isArray(currentAnalytics.topServices) ? currentAnalytics.topServices : [];

  const maxRevenue = useMemo(() => {
    if (!trend.length) return 1;
    return Math.max(...trend.map((item) => Number(item.revenue) || 0), 1);
  }, [trend]);

  const totalActive = (summary.pending || 0) + (summary.confirmed || 0);
  const statusMeta = getStatusCardMeta(shopStatus);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50 px-4">
        <div className="rounded-2xl border border-white/80 bg-white/90 px-6 py-5 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.45)]">
          <div className="flex items-center gap-3 text-slate-700">
            <div className="h-4 w-4 animate-pulse rounded-full bg-cyan-500" />
            Loading analytics dashboard...
          </div>
        </div>
      </div>
    );
  }

  if (shopStatus !== "approved") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50 px-4">
        <div className="w-full max-w-lg rounded-3xl border border-white/80 bg-white/90 p-8 text-center shadow-[0_18px_45px_-24px_rgba(15,23,42,0.45)]">
          <div className="mb-3 text-5xl">{statusMeta.icon}</div>
          <h2 className="text-2xl font-black text-slate-900">{statusMeta.title}</h2>
          <p className="mt-2 text-sm text-slate-600">{statusMeta.message}</p>
          {errorMessage ? <p className="mt-3 text-sm font-medium text-rose-600">{errorMessage}</p> : null}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to={statusMeta.actionPath}
              className="rounded-lg bg-gradient-to-r from-cyan-500 to-amber-400 px-5 py-2.5 text-sm font-black text-slate-950 transition hover:brightness-110"
            >
              {statusMeta.actionLabel}
            </Link>
            <Link
              to="/barberDashboard"
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Shop Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50 px-4 py-3 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <section className="mb-4 rounded-3xl border border-white/80 bg-white/90 p-5 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.45)] sm:p-6">
          <div className="flex flex-col gap-1 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                Barber Analytics
              </p>
              <h1 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">
                {shop?.shopname || "Shop"} Revenue Dashboard
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Track daily, weekly, monthly and yearly income with appointment performance insights.
              </p>
            </div>

            <div className="flex gap-1 col-3">
              <Link
                to="/barberDashboard"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Appointments
              </Link>
              <Link
                to="/timeSlot-create"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Manage Slots
              </Link>
              <Link
                to="/barber-profile-update"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Update Shop
              </Link>
            </div>
          </div>
        </section>

        {errorMessage ? (
          <section className="mb-6 rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-700">
            <div className="flex items-start gap-2">
              <FaExclamationTriangle className="mt-0.5" />
              <p>{errorMessage}</p>
            </div>
          </section>
        ) : null}

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PERIOD_OPTIONS.map((period) => {
            const periodSummary = analyticsByPeriod[period.key]?.summary || createEmptyAnalytics(period.key).summary;
            const isActive = selectedPeriod === period.key;
            const Icon = period.icon;

            return (
              <button
                key={period.key}
                type="button"
                onClick={() => setSelectedPeriod(period.key)}
                className={`rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 ${
                  isActive
                    ? "border-cyan-300 bg-gradient-to-br from-cyan-50 to-amber-50 shadow-[0_14px_30px_-22px_rgba(14,116,144,0.65)]"
                    : "border-white/80 bg-white/90"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    <Icon className="text-cyan-600" />
                    {period.label}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    {period.subLabel}
                  </span>
                </div>
                <p className="text-xl font-black text-slate-900">
                  {formatCurrency(periodSummary.realizedRevenue)}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  {periodSummary.completed || 0} completed appointments
                </p>
              </button>
            );
          })}
        </section>

        <section className="mb-6 rounded-2xl border border-white/80 bg-white/90 p-4 shadow-[0_14px_32px_-24px_rgba(15,23,42,0.45)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              {selectedPeriod === "day" ? (
                <label className="inline-flex items-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-800">
                  <FaCalendarDay className="text-cyan-600" />
                  <span>Choose Date</span>
                  <input
                    type="date"
                    value={selectedDayDate}
                    onChange={(event) => setSelectedDayDate(event.target.value)}
                    className="rounded-md border border-cyan-200 bg-white px-2 py-1 text-sm text-slate-700 outline-none focus:border-cyan-400"
                  />
                </label>
              ) : null}

              {selectedPeriod === "month" ? (
                <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
                  <FaCalendarAlt className="text-amber-600" />
                  <span>Choose Month</span>
                  <select
                    value={selectedMonthValue}
                    onChange={(event) => setSelectedMonthValue(event.target.value)}
                    className="rounded-md border border-amber-200 bg-white px-2 py-1 text-sm text-slate-700 outline-none focus:border-amber-400"
                  >
                    {monthOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {selectedPeriod === "year" ? (
                <label className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
                  <FaCalendarCheck className="text-emerald-600" />
                  <span>Choose Year</span>
                  <select
                    value={selectedYearValue}
                    onChange={(event) => setSelectedYearValue(event.target.value)}
                    className="rounded-md border border-emerald-200 bg-white px-2 py-1 text-sm text-slate-700 outline-none focus:border-emerald-400"
                  >
                    {yearOptions.map((yearOption) => (
                      <option key={yearOption} value={yearOption}>
                        {yearOption}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {selectedPeriod === "week" ? (
                <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                  Weekly view is based on the current week (Monday to Sunday).
                </p>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              {periodLoading ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-500" />
                  Updating analytics...
                </span>
              ) : null}
              <span className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-cyan-200">
                Showing: {activePeriodLabel}
              </span>
            </div>
          </div>
        </section>

        <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          <div className="rounded-xl border border-white/80 bg-white/90 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total Bookings</p>
            <p className="mt-1 text-lg font-black text-slate-900">{summary.totalAppointments || 0}</p>
          </div>
          <div className="rounded-xl border border-white/80 bg-white/90 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Completed</p>
            <p className="mt-1 text-lg font-black text-emerald-700">{summary.completed || 0}</p>
          </div>
          <div className="rounded-xl border border-white/80 bg-white/90 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Active</p>
            <p className="mt-1 text-lg font-black text-cyan-700">{totalActive}</p>
          </div>
          <div className="rounded-xl border border-white/80 bg-white/90 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Completion Rate</p>
            <p className="mt-1 text-lg font-black text-slate-900">{summary.completionRate || 0}%</p>
          </div>
          <div className="rounded-xl border border-white/80 bg-white/90 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Avg Ticket</p>
            <p className="mt-1 text-lg font-black text-slate-900">{formatCurrency(summary.averageTicketSize)}</p>
          </div>
          <div className="rounded-xl border border-white/80 bg-white/90 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Cancelled</p>
            <p className="mt-1 text-lg font-black text-rose-600">{summary.cancelled || 0}</p>
          </div>
        </section>

        <section className="mb-6 grid gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-[0_16px_36px_-24px_rgba(15,23,42,0.45)] lg:col-span-2">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-black text-slate-900">Revenue Trend ({activePeriodLabel})</h2>
              <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                <FaChartLine />
                Realized revenue based on completed appointments
              </span>
            </div>

            {trend.length > 0 ? (
              <div className="overflow-x-auto pb-2">
                <div className="flex min-w-max items-end gap-3">
                  {trend.map((item) => {
                    const value = Number(item.revenue) || 0;
                    const height = value > 0 ? Math.max((value / maxRevenue) * 100, 6) : 0;

                    return (
                      <div key={item.key} className="flex w-12 flex-col items-center gap-1.5">
                        <p className="text-[11px] font-semibold text-slate-700">
                          {value > 0 ? formatCompactNumber(value) : "-"}
                        </p>
                        <div className="relative flex h-40 w-8 items-end rounded-lg bg-slate-100">
                          <div
                            className="w-full rounded-lg bg-gradient-to-t from-cyan-500 to-amber-400 transition-all duration-500"
                            style={{ height: `${height}%` }}
                          />
                        </div>
                        <p className="text-[10px] font-medium text-slate-500">{item.label}</p>
                        <p className="text-[10px] text-slate-500">{item.bookings || 0} bk</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
                No bookings recorded for this period yet.
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-[0_16px_36px_-24px_rgba(15,23,42,0.45)]">
            <h2 className="mb-4 text-lg font-black text-slate-900">Revenue Split</h2>
            <div className="space-y-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Realized Income</p>
                <p className="mt-1 text-xl font-black text-emerald-800">{formatCurrency(summary.realizedRevenue)}</p>
              </div>
              <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Expected Income</p>
                <p className="mt-1 text-xl font-black text-cyan-800">{formatCurrency(summary.expectedRevenue)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Gross Booking Value</p>
                <p className="mt-1 text-xl font-black text-slate-800">{formatCurrency(summary.grossRevenue)}</p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Cancelled Loss</p>
                <p className="mt-1 text-xl font-black text-rose-800">
                  {formatCurrency(summary.cancelledRevenueLoss)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-[0_16px_36px_-24px_rgba(15,23,42,0.45)]">
            <h2 className="mb-4 text-lg font-black text-slate-900">Top Services</h2>
            {topServices.length > 0 ? (
              <div className="space-y-2.5">
                {topServices.map((service, index) => (
                  <div
                    key={`${service.name}-${index}`}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{service.name}</p>
                      <p className="text-xs text-slate-500">{service.bookings || 0} bookings</p>
                    </div>
                    <p className="text-sm font-black text-emerald-700">{formatCurrency(service.revenue)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-600">
                No service-level data available in this period.
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-[0_16px_36px_-24px_rgba(15,23,42,0.45)]">
            <h2 className="mb-4 text-lg font-black text-slate-900">Operational Snapshot</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                  <FaUsers className="text-cyan-600" />
                  Total Bookings
                </p>
                <p className="text-sm font-black text-slate-900">{summary.totalAppointments || 0}</p>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                  <FaCheckCircle className="text-emerald-600" />
                  Completed Jobs
                </p>
                <p className="text-sm font-black text-emerald-700">{summary.completed || 0}</p>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                  <FaClock className="text-cyan-600" />
                  Active Queue (Pending + Confirmed)
                </p>
                <p className="text-sm font-black text-cyan-700">{totalActive}</p>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                  <FaTimesCircle className="text-rose-600" />
                  Cancellation Rate
                </p>
                <p className="text-sm font-black text-rose-700">{summary.cancellationRate || 0}%</p>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                  <FaRupeeSign className="text-amber-600" />
                  Avg Revenue Per Booking
                </p>
                <p className="text-sm font-black text-slate-900">{formatCurrency(summary.averageTicketSize)}</p>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                  <FaStore className="text-slate-600" />
                  Shop
                </p>
                <p className="max-w-[180px] truncate text-sm font-black text-slate-900">
                  {shop?.shopname || "Not Available"}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default BarberAnalyticsDashboard;
