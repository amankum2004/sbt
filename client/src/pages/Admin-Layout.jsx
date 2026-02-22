import React, { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, Navigate } from "react-router-dom";
import {
  FaUser,
  FaStore,
  FaBell,
  FaMoneyBillWave,
  FaHome,
  FaStar,
  FaRegListAlt,
  FaBars,
  FaTimes,
  FaEnvelope,
} from "react-icons/fa";
import { useLogin } from "../components/LoginContext";
import { api } from "../utils/api";

export const AdminLayout = () => {
  const { user } = useLogin();
  const [menuOpen, setMenuOpen] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const menuRef = useRef(null);

  const navItems = [
    { to: "/admin", label: "Home", icon: FaHome, end: true },
    { to: "/admin/users", label: "Users", icon: FaUser },
    { to: "/admin/contacts", label: "Contacts", icon: FaEnvelope },
    { to: "/admin/services", label: "Services", icon: FaRegListAlt },
    { to: "/admin/donations", label: "Donations", icon: FaMoneyBillWave },
    { to: "/admin/shops", label: "Shops", icon: FaStore },
    { to: "/admin/requests", label: "Requests", icon: FaBell },
    { to: "/admin/reviews", label: "Reviews", icon: FaStar },
  ];

  const fetchRequestCount = async () => {
    try {
      const res = await api.get("/admin/pending");
      setRequestCount(Array.isArray(res.data) ? res.data.length : 0);
    } catch (err) {
      console.error("Failed to fetch request count", err);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.body.style.overflow = "hidden";
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const handlePendingUpdated = (event) => {
      const countFromEvent = event?.detail?.count;
      if (typeof countFromEvent === "number") {
        setRequestCount(countFromEvent);
      } else {
        fetchRequestCount();
      }
    };

    fetchRequestCount();
    const interval = setInterval(fetchRequestCount, 30000);
    window.addEventListener("admin:pending-updated", handlePendingUpdated);

    return () => {
      clearInterval(interval);
      window.removeEventListener("admin:pending-updated", handlePendingUpdated);
    };
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user?.usertype !== "admin") {
    return <Navigate to="/" replace />;
  }

  const getDesktopNavLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-white text-slate-900 shadow"
        : "text-slate-100 hover:bg-white/15 hover:text-white"
    }`;

  const getMobileNavLinkClass = ({ isActive }) =>
    `flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
      isActive
        ? "bg-blue-600 text-white shadow"
        : "text-slate-200 hover:bg-slate-700 hover:text-white"
    }`;

  const renderRequestBadge = (extraClasses = "") =>
    requestCount > 0 ? (
      <span
        className={`inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white ${extraClasses}`}
      >
        {requestCount}
      </span>
    ) : null;

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 py-4 sm:py-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-300">
                Administration
              </p>
              <h1 className="mt-1 text-xl font-bold sm:text-2xl">
                Admin Dashboard
              </h1>
            </div>

            <div className="hidden sm:flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2">
              <FaBell className="text-sm text-amber-300" />
              <span className="text-sm font-medium text-slate-100">Pending Requests</span>
              {renderRequestBadge()}
            </div>

            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 bg-white/10 text-xl text-white transition hover:bg-white/20 md:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open admin menu"
            >
              <FaBars />
            </button>
          </div>
        </div>

        <div className="hidden border-t border-white/10 md:block">
          <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={getDesktopNavLinkClass}
                >
                  <Icon className="text-sm" />
                  <span>{item.label}</span>
                  {item.label === "Requests" ? renderRequestBadge("ml-1") : null}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-[2px] md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        ref={menuRef}
        className={`fixed right-0 top-0 z-[70] h-full w-[86%] max-w-sm bg-slate-900 p-4 text-white shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-4 flex items-start justify-between border-b border-slate-700 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Menu</p>
            <h2 className="mt-1 text-lg font-bold text-white">Admin Navigation</h2>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-600 text-lg text-slate-200 transition hover:bg-slate-800"
            aria-label="Close admin menu"
          >
            <FaTimes />
          </button>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMenuOpen(false)}
                className={getMobileNavLinkClass}
              >
                <span className="inline-flex items-center gap-3">
                  <Icon className="text-base" />
                  <span>{item.label}</span>
                </span>
                {item.label === "Requests" ? renderRequestBadge() : null}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};
