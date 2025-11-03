import React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLogin } from "../components/LoginContext";
import { toast } from "react-toastify";
import Swal from 'sweetalert2';
import { api } from '../utils/api';

export const AdminUserUpdate = () => {
    const { user } = useLogin();
    const navigate = useNavigate();
    const [data, setData] = useState({
        name: "",
        email: "",
        phone: "",
        usertype: user.usertype || "customer" // default to 'user' if not available
    });
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState("");
    const params = useParams();

    // GET SINGLE USER DATA FOR UPDATION
    const getSingleUserData = async () => {
        try {
            setFetchLoading(true);
            setError("");
            // console.log('Fetching user data for ID:', params.id);
            
            const response = await api.get(`/admin/users/${params.id}`);
            
            // console.log('Full API response:', response);
            // console.log('User data received:', response.data);
            
            if (response.data) {
                setData({
                    name: response.data.name || "",
                    email: response.data.email || "",
                    phone: response.data.phone || "",
                    usertype: response.data.usertype || "customer"
                });
                // console.log('Data set successfully:', {
                //     name: response.data.name,
                //     email: response.data.email,
                //     phone: response.data.phone,
                //     usertype: response.data.usertype
                // });
            } else {
                throw new Error('No user data received from server');
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to fetch user data";
            setError(errorMessage);
            
            Swal.fire({
                title: "Error",
                text: errorMessage,
                icon: "error"
            }).then(() => {
                navigate('/admin/users');
            });
        } finally {
            setFetchLoading(false);
            console.log('Fetch loading set to false');
        }
    };

    useEffect(() => {
        // console.log('Component mounted with params:', params);
        
        if (!params.id) {
            setError("User ID is required");
            setFetchLoading(false);
            Swal.fire({
                title: "Error",
                text: "User ID is required",
                icon: "error"
            }).then(() => {
                navigate('/admin/users');
            });
            return;
        }
        
        getSingleUserData();
    }, [params.id, navigate]);

    const handleInput = (e) => {
        const { name, value } = e.target;
        setData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!data.name.trim() || !data.email.trim() || !data.phone.trim() || !data.usertype.trim()) {
            Swal.fire({
                title: "Validation Error",
                text: "Please fill in all required fields",
                icon: "warning"
            });
            return;
        }

        try {
            setLoading(true);
            // console.log('Submitting data:', data);
            const response = await api.patch(`/admin/users/update/${params.id}`,data);
            // console.log('Update response:', response);

            if (response.status === 200) {
                Swal.fire({title: 'Success',text: 'User updated successfully!',icon: 'success'});
                navigate('/admin/users');
            } else {
                throw new Error(response.data?.message || "Error in updation");
            }
        } catch (error) {
            console.error("Update error:", error);
            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Failed to update user",
                icon: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    // Debug logs to track state changes
    useEffect(() => {
        console.log('Current state:', {
            fetchLoading,
            loading,
            error,
            data
        });
    }, [fetchLoading, loading, error, data]);

    if (fetchLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading user data...</p>
                    <p className="text-sm text-gray-500 mt-2">User ID: {params.id}</p>
                </div>
            </div>
        );
    }

    if (error && !fetchLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading User</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/admin/users')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                    >
                        Back to Users
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <section className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-blue-600 text-white p-6">
                    <h1 className="text-2xl font-bold text-center">Update User Data</h1>
                    <p className="text-center text-blue-100 mt-2">User ID: {params.id}</p>
                </div>
                
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                value={data.name}
                                onChange={handleInput}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                placeholder="Enter full name"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={data.email}
                                onChange={handleInput}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                placeholder="Enter email address"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                id="phone"
                                value={data.phone}
                                onChange={handleInput}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                placeholder="Enter phone number"
                            />
                        </div>

                        <div>
                            <label htmlFor="usertype" className="block text-sm font-medium text-gray-700 mb-1">
                                User Type *
                            </label>
                            <select
                                name="usertype"
                                id="usertype"
                                value={data.usertype}
                                onChange={handleInput}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            >
                                {/* <option value="">Select User Type</option> */}
                                <option value="customer">Customer</option>
                                <option value="admin">Admin</option>
                                <option value="shopOwner">Shop Owner</option>
                            </select>
                        </div>

                        <div className="flex space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/users')}
                                className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition ${
                                    loading 
                                        ? 'opacity-50 cursor-not-allowed' 
                                        : 'hover:bg-blue-700 transform hover:scale-105'
                                }`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Updating...
                                    </span>
                                ) : (
                                    'Update User'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
};







