import React, { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, Navigate } from "react-router-dom";
import { FaUser, FaHome, FaRegListAlt, FaBars, FaTimes, FaEnvelope } from "react-icons/fa";
import { useLogin } from "../components/LoginContext";
import { api } from "../utils/api";

export const AdminLayout = () => {
    const { user } = useLogin();
    const [menuOpen, setMenuOpen] = useState(false);
    const [requestCount, setRequestCount] = useState(0);
    const menuRef = useRef(null);

    // Close sidebar on outside click
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        
        if (menuOpen) {
            document.addEventListener("mousedown", handleOutsideClick);
        } else {
            document.removeEventListener("mousedown", handleOutsideClick);
        }
        
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [menuOpen]);

    useEffect(() => {
        // 🔄 Fetch pending requests count
        const fetchRequestCount = async () => {
            try {
                const res = await api.get("/admin/pending");
                console.log("Pending Requests Response", res.data);
                setRequestCount(res.data.length || 0);
            } catch (err) {
                console.error("Failed to fetch request count", err);
            }
        };

        fetchRequestCount();
        const interval = setInterval(fetchRequestCount, 30000); // ⏱ Refresh every 30 sec
        return () => clearInterval(interval);
    }, []);

    // Check if user is authenticated and is admin
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user?.usertype !== "admin") {
        return <Navigate to="/" replace />;
    }

    const renderRequestsMenu = () => (
        <div className="flex items-center space-x-2">
            <FaRegListAlt />
            <span>Requests</span>
            {requestCount > 0 && (
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {requestCount}
                </span>
            )}
        </div>
    );

    // Active link style function
    const getNavLinkClass = ({ isActive }) => 
        `flex items-center space-x-2 p-4 md:p-2 transition ${
            isActive 
                ? "bg-blue-600 text-white" 
                : "text-white hover:bg-gray-700"
        }`;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-gray-800 text-white shadow-lg">
                <div className="container mx-auto px-4">
                    <nav className="flex items-center justify-between py-4">
                        <h2 className="text-xl md:text-2xl font-bold">Admin Dashboard</h2>
                            
                        {/* Hamburger Button */}
                        <button
                            className="md:hidden text-white text-2xl focus:outline-none"
                            onClick={() => setMenuOpen(true)}
                            aria-label="Open menu"
                        >
                            <FaBars />
                        </button>
                    </nav>
                </div>
            </header>

            {/* Mobile Sidebar Overlay */}
            {menuOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" />
            )}

            {/* Sidebar for Mobile */}
            <div
                ref={menuRef}
                className={`fixed top-0 right-0 h-full w-64 bg-gray-800 text-white z-50 transform transition-transform duration-300 ease-in-out ${
                    menuOpen ? "translate-x-0" : "translate-x-full"
                } md:hidden`}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h3 className="text-xl font-semibold">Menu</h3>
                    <button 
                        onClick={() => setMenuOpen(false)} 
                        className="text-white text-2xl"
                        aria-label="Close menu"
                    >
                        <FaTimes />
                    </button>
                </div>
                <nav>
                    <ul className="flex flex-col">
                        <li>
                            <NavLink
                                to="/admin"
                                onClick={() => setMenuOpen(false)}
                                className={getNavLinkClass}
                                end
                            >
                                <FaHome /> <span>Home</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/admin/users"
                                onClick={() => setMenuOpen(false)}
                                className={getNavLinkClass}
                            >
                                <FaUser /> <span>Users</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/admin/contacts"
                                onClick={() => setMenuOpen(false)}
                                className={getNavLinkClass}
                            >
                                <FaEnvelope /> <span>Contacts</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/admin/services"
                                onClick={() => setMenuOpen(false)}
                                className={getNavLinkClass}
                            >
                                <FaRegListAlt /> <span>Services</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/admin/shops"
                                onClick={() => setMenuOpen(false)}
                                className={getNavLinkClass}
                            >
                                <FaRegListAlt /> <span>Shops</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/admin/requests"
                                onClick={() => setMenuOpen(false)}
                                className={getNavLinkClass}
                            >
                                {renderRequestsMenu()}
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block bg-gray-800 text-white">
                <div className="container mx-auto px-4">
                    <nav>
                        <ul className="flex space-x-1">
                            <li>
                                <NavLink
                                    to="/admin"
                                    className={getNavLinkClass}
                                    end
                                >
                                    <FaHome /> <span>Home</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/admin/users"
                                    className={getNavLinkClass}
                                >
                                    <FaUser /> <span>Users</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/admin/contacts"
                                    className={getNavLinkClass}
                                >
                                    <FaEnvelope /> <span>Contacts</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/admin/services"
                                    className={getNavLinkClass}
                                >
                                    <FaRegListAlt /> <span>Services</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/admin/shops"
                                    className={getNavLinkClass}
                                >
                                    <FaRegListAlt /> <span>Shops</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/admin/requests"
                                    className={getNavLinkClass}
                                >
                                    {renderRequestsMenu()}
                                </NavLink>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
             <main className="container mx-auto px-4 py-6">
                <Outlet />
            </main>
            {/* <main className="container mx-auto px-4 py-6">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Welcome to Admin Dashboard, {user?.name || 'Admin'}!
                    </h1>
                    <p className="text-gray-600 mb-4">
                        This is your administration panel where you can manage users, services, 
                        shops, and pending requests. Use the navigation above to access different sections.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-blue-800">Pending Requests</h3>
                            <p className="text-2xl font-bold">{requestCount}</p>
                            <p className="text-sm text-blue-600">Need your attention</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-green-800">Quick Actions</h3>
                            <p className="text-sm text-green-600">Manage your platform</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-purple-800">Recent Activity</h3>
                            <p className="text-sm text-purple-600">Monitor user actions</p>
                        </div>
                    </div>
                </div>
                <Outlet />
            </main> */}
        </div>
    );
};


