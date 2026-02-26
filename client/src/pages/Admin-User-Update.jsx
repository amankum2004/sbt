import React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLogin } from "../components/LoginContext";
import Swal from 'sweetalert2';
import { api } from '../utils/api';
import { LoadingSpinner } from "../components/Loading";

export const AdminUserUpdate = () => {
    const { user } = useLogin();
    const navigate = useNavigate();
    const [data, setData] = useState({
        name: "",
        email: "",
        phone: "",
        usertype: user?.usertype || "customer"
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
            
            const response = await api.get(`/admin/users/${params.id}`);
            
            if (response.data) {
                setData({
                    name: response.data.name || "",
                    email: response.data.email || "",
                    phone: response.data.phone || "",
                    usertype: response.data.usertype || "customer"
                });
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
            <main className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50 px-4 py-12">
                <div className="mx-auto flex max-w-xl items-center justify-center rounded-3xl border border-white/70 bg-white/90 p-10 shadow-[0_24px_70px_-20px_rgba(15,23,42,0.35)]">
                    <div className="text-center">
                        <div className="mx-auto mb-4 flex justify-center">
                            <LoadingSpinner size="xl" />
                        </div>
                        <p className="font-semibold text-slate-700">Loading user data...</p>
                        <p className="mt-2 text-xs text-slate-500">User ID: {params.id}</p>
                    </div>
                </div>
            </main>
        );
    }

    if (error && !fetchLoading) {
        return (
            <main className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50 px-4 py-12">
                <div className="mx-auto max-w-xl rounded-3xl border border-rose-200 bg-white/90 p-10 text-center shadow-[0_24px_70px_-20px_rgba(15,23,42,0.35)]">
                    <div className="mb-4 text-5xl text-rose-500">⚠️</div>
                    <h2 className="mb-2 text-2xl font-black text-slate-900">Error Loading User</h2>
                    <p className="mb-5 text-sm text-slate-600">{error}</p>
                    <button
                        onClick={() => navigate('/admin/users')}
                        className="rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-amber-400 px-6 py-2.5 text-sm font-bold text-slate-950 transition hover:brightness-110"
                    >
                        Back to Users
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50 px-4 py-10 sm:px-6">
            <div className="pointer-events-none absolute -left-20 top-20 h-64 w-64 rounded-full bg-cyan-200/60 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 top-36 h-64 w-64 rounded-full bg-amber-200/60 blur-3xl" />

            <section className="relative mx-auto w-full max-w-lg overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-[0_24px_70px_-20px_rgba(15,23,42,0.35)] backdrop-blur">
                <div className="bg-slate-900 p-7 text-center text-white">
                    <p className="inline-flex rounded-full bg-white/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
                        Admin Control
                    </p>
                    <h1 className="mt-3 text-3xl font-black">Update User Data</h1>
                    <p className="mt-2 text-xs text-slate-300">User ID: {params.id}</p>
                </div>
                
                <div className="p-6 sm:p-7">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="mb-1 block text-sm font-semibold text-slate-700">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                value={data.name}
                                onChange={handleInput}
                                required
                                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                                placeholder="Enter full name"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="mb-1 block text-sm font-semibold text-slate-700">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={data.email}
                                onChange={handleInput}
                                required
                                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                                placeholder="Enter email address"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="mb-1 block text-sm font-semibold text-slate-700">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                id="phone"
                                value={data.phone}
                                onChange={handleInput}
                                required
                                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                                placeholder="Enter phone number"
                            />
                        </div>

                        <div>
                            <label htmlFor="usertype" className="mb-1 block text-sm font-semibold text-slate-700">
                                User Type *
                            </label>
                            <select
                                name="usertype"
                                id="usertype"
                                value={data.usertype}
                                onChange={handleInput}
                                required
                                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
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
                                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex-1 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-amber-400 px-4 py-3 text-sm font-black text-slate-950 transition ${
                                    loading 
                                        ? 'opacity-50 cursor-not-allowed' 
                                        : 'hover:brightness-110'
                                }`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <LoadingSpinner size="xs" className="-ml-1 mr-2" />
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
        </main>
    );
};







