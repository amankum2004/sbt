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

    if (user?.usertype !== "admin") {
        return <Navigate to="/" />;
    }

    const renderRequestsMenu = () => (
        <>
            <FaRegListAlt />
            <span>Requests</span>
            {requestCount > 0 && (
                <span className="ml-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {requestCount}
                </span>
            )}
        </>
    );


    return (
        <>
            <header className="bg-gray-800 text-white shadow-lg">
                <div className="container ">
                    <nav className="flex items-center justify-between">
                        <h2 className="text-xl md:text-2xl font-bold">Admin Dashboard</h2>

                        {/* Hamburger Button */}
                        <button
                            className="md:hidden text-white text-2xl focus:outline-none"
                            onClick={() => setMenuOpen(true)}
                        >
                            <FaBars />
                        </button>
                    </nav>
                </div>
            </header>

            {/* Sidebar for Mobile */}
            <div
                ref={menuRef}
                className={`fixed top-0 right-0 h-full w-64 bg-gray-800 text-white z-50 transform transition-transform duration-300 ease-in-out ${menuOpen ? "translate-x-0" : "translate-x-full"
                    } md:hidden`}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h3 className="text-xl font-semibold">Menu</h3>
                    <button onClick={() => setMenuOpen(false)} className="text-white text-2xl">
                        <FaTimes />
                    </button>
                </div>
                <ul className="flex flex-col">
                    <li>
                        <NavLink
                            to="/admin"
                            onClick={() => setMenuOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center space-x-2 p-4 ${isActive ? "bg-white-600" : "hover:bg-white-500"
                                } transition`
                            }
                        >
                            <FaHome /> <span>Home</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/admin/users"
                            onClick={() => setMenuOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center space-x-2 p-4 ${isActive ? "bg-blue-600" : "hover:bg-blue-500"
                                } transition`
                            }
                        >
                            <FaUser /> <span>Users</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/admin/contacts"
                            onClick={() => setMenuOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center space-x-2 p-4 ${isActive ? "bg-blue-600" : "hover:bg-blue-500"
                                } transition`
                            }
                        >
                            <FaEnvelope /> <span>Contacts</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/admin/services"
                            onClick={() => setMenuOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center space-x-2 p-4 ${isActive ? "bg-blue-600" : "hover:bg-blue-500"
                                } transition`
                            }
                        >
                            <FaRegListAlt /> <span>Services</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/admin/shops"
                            onClick={() => setMenuOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center space-x-2 p-4 ${isActive ? "bg-blue-600" : "hover:bg-blue-500"
                                } transition`
                            }
                        >
                            <FaRegListAlt /> <span>Shops</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/admin/requests"
                            onClick={() => setMenuOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center justify-between p-4 ${isActive ? "bg-blue-600" : "hover:bg-blue-500"
                                } transition`
                            }
                        >
                            {renderRequestsMenu()}
                        </NavLink>
                    </li>

                </ul>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:block bg-gray-800 text-white">
                <div className="container ">
                    <ul className="flex space-x-4">
                        <li>
                            <NavLink
                                to="/admin"
                                className={({ isActive }) =>
                                    `flex items-center space-x-2 p-2 ${isActive ? "bg-white-600" : "hover:bg-white-500"
                                    } rounded-md transition`
                                }
                            >
                                <FaHome /> <span>Home</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/admin/users"
                                className={({ isActive }) =>
                                    `flex items-center space-x-2 p-2 ${isActive ? "bg-blue-600" : "hover:bg-blue-500"
                                    } rounded-md transition`
                                }
                            >
                                <FaUser /> <span>Users</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/admin/contacts"
                                className={({ isActive }) =>
                                    `flex items-center space-x-2 p-2 ${isActive ? "bg-blue-600" : "hover:bg-blue-500"
                                    } rounded-md transition`
                                }
                            >
                                <FaEnvelope /> <span>Contacts</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/admin/services"
                                className={({ isActive }) =>
                                    `flex items-center space-x-2 p-2 ${isActive ? "bg-blue-600" : "hover:bg-blue-500"
                                    } rounded-md transition`
                                }
                            >
                                <FaRegListAlt /> <span>Services</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/admin/shops"
                                className={({ isActive }) =>
                                    `flex items-center space-x-2 p-2 ${isActive ? "bg-blue-600" : "hover:bg-blue-500"
                                    } rounded-md transition`
                                }
                            >
                                <FaRegListAlt /> <span>Shops</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/admin/requests"
                                className={({ isActive }) =>
                                    `flex items-center space-x-2 p-2 ${isActive ? "bg-blue-600" : "hover:bg-blue-500"
                                    } rounded-md transition`
                                }
                            >
                                {renderRequestsMenu()}
                            </NavLink>
                        </li>

                    </ul>
                </div>
            </div>

            <main className="p-4">
                <Outlet />
            </main>
        </>
    );
};

