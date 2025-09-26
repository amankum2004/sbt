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
    });
    const [loading, setLoading] = useState(false);
    const params = useParams();

    // Get token safely
    const getToken = () => {
        try {
            const tokenString = localStorage.getItem('token');
            if (!tokenString) return null;
            return JSON.parse(tokenString);
        } catch (error) {
            console.error("Error parsing token:", error);
            return null;
        }
    };

    const token = getToken();

    // GET SINGLE USER DATA FOR UPDATION
    const getSingleUserData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/users/${params.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            if (response.data) {
                setData({
                    name: response.data.name || "",
                    email: response.data.email || "",
                    phone: response.data.phone || "",
                });
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Failed to fetch user data",
                icon: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            getSingleUserData();
        } else {
            navigate('/login');
        }
    }, [params.id, token]);

    const handleInput = (e) => {
        const { name, value } = e.target;
        setData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!token) {
            Swal.fire({
                title: "Error",
                text: "Authentication token missing",
                icon: "error"
            });
            return;
        }

        try {
            setLoading(true);
            const response = await api.patch(
                `/admin/users/update/${params.id}`,
                data,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                toast.success("Updated Successfully");
                navigate('/admin/users');
            } else {
                Swal.fire({
                    title: "Error",
                    text: response.data?.message || "Error in updation",
                    icon: "error"
                });
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <section className="bg-gray-100 p-10 rounded-lg max-w-lg mx-auto shadow-lg">
            <div className="text-center mb-6">
                <h1 className="text-3xl text-gray-800 font-bold mb-3">Update User Data</h1>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="name" className="block font-semibold text-gray-700 mb-2">Username</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            autoComplete="off"
                            value={data.name}
                            onChange={handleInput}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block font-semibold text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            autoComplete="off"
                            value={data.email}
                            onChange={handleInput}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200"
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block font-semibold text-gray-700 mb-2">Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            id="phone"
                            autoComplete="off"
                            value={data.phone}
                            onChange={handleInput}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`bg-blue-600 text-white py-3 px-5 rounded-lg w-full hover:bg-blue-700 transition-transform transform active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Updating...' : 'Update'}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};