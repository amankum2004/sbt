import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaEnvelope, FaListAlt, FaStore, FaBell } from 'react-icons/fa';

export const AdminHome = () => {
    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
                <p className="text-gray-600">
                    Welcome to your administration panel. Here you can manage all aspects of your platform.
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Link to="/admin/users" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center">
                        <FaUsers className="text-blue-500 text-2xl mr-4" />
                        <div>
                            <h3 className="font-semibold text-gray-800">Users</h3>
                            <p className="text-2xl font-bold">Manage Users</p>
                        </div>
                    </div>
                </Link>

                <Link to="/admin/contacts" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center">
                        <FaUsers className="text-blue-500 text-2xl mr-4" />
                        <div>
                            <h3 className="font-semibold text-gray-800">Contacts</h3>
                            <p className="text-2xl font-bold">User messages</p>
                        </div>
                    </div>
                </Link>

                <Link to="/admin/services" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center">
                        <FaListAlt className="text-green-500 text-2xl mr-4" />
                        <div>
                            <h3 className="font-semibold text-gray-800">Services</h3>
                            <p className="text-2xl font-bold">Manage Services</p>
                        </div>
                    </div>
                </Link>

                <Link to="/admin/shops" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center">
                        <FaStore className="text-purple-500 text-2xl mr-4" />
                        <div>
                            <h3 className="font-semibold text-gray-800">Shops</h3>
                            <p className="text-2xl font-bold">Shop Management</p>
                        </div>
                    </div>
                </Link>

                <Link to="/admin/requests" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center">
                        <FaBell className="text-red-500 text-2xl mr-4" />
                        <div>
                            <h3 className="font-semibold text-gray-800">Requests</h3>
                            <p className="text-2xl font-bold">Pending Actions</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span>New user registration</span>
                        <span className="text-sm text-gray-500">2 hours ago</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span>Service request submitted</span>
                        <span className="text-sm text-gray-500">5 hours ago</span>
                    </div>
                </div>
            </div>
        </div>
    );
};