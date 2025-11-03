import React from "react";
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { api } from '../utils/api'
import Swal from 'sweetalert2'

export const AdminContacts = () => {
    const [contactData, setContactData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const getContactsData = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await api.get("/admin/contacts")
            // console.log("Contact data: ", response.data);
            
            if (response.data) {
                setContactData(Array.isArray(response.data) ? response.data : []);
            } else {
                setContactData([]);
            }
        } catch (error) {
            // console.log("Error fetching contacts:", error);
            setError(error.response?.data?.message || "Failed to fetch contacts data");
            toast.error("Failed to load contacts data");
            setContactData([]);
        } finally {
            setLoading(false);
        }
    }

    // DEFINING THE FUNCTION deleteContactById
    const deleteContactById = async (id) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel'
            });

            if (result.isConfirmed) {
                const response = await api.delete(`/admin/contacts/delete/${id}`)

                if (response.status === 200) {
                    setContactData(prev => prev.filter(contact => contact._id !== id));
                    toast.success("Contact deleted successfully");
                    
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'Contact has been deleted.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                } else {
                    throw new Error(response.data?.message || "Error in deletion");
                }
            }
        } catch (error) {
            // console.log("Delete error:", error);
            toast.error(error.response?.data?.message || "Failed to delete contact");
            
            Swal.fire({
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to delete contact',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    }

    useEffect(() => {
        getContactsData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading contacts...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Contacts</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={getContactsData}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition duration-200"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <section className="flex flex-col items-center min-h-screen bg-gray-100 py-8">
            <div className="w-11/12 max-w-6xl p-6 bg-white shadow-lg rounded-lg">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Contacts Data for Admin</h1>
                    <div className="flex items-center space-x-4">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            Total: {contactData.length}
                        </span>
                        <button
                            onClick={getContactsData}
                            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition duration-200 flex items-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                    </div>
                </div>

                {contactData.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📭</div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Contacts Found</h3>
                        <p className="text-gray-500 mb-6">There are no contact messages to display.</p>
                        <button
                            onClick={getContactsData}
                            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg transition duration-200"
                        >
                            Refresh Data
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-800 text-white">
                                    <th className="py-3 px-4 text-left uppercase text-sm font-semibold">Name</th>
                                    <th className="py-3 px-4 text-left uppercase text-sm font-semibold">Email</th>
                                    <th className="py-3 px-4 text-left uppercase text-sm font-semibold">Message</th>
                                    <th className="py-3 px-4 text-left uppercase text-sm font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contactData.map((curContactData, index) => {
                                    const { name, email, message, _id } = curContactData;
                                    return (
                                        <tr key={_id || index} className="border-b hover:bg-gray-50 transition duration-150">
                                            <td className="py-3 px-4 text-gray-700 font-medium">{name}</td>
                                            <td className="py-3 px-4 text-gray-700">
                                                <a href={`mailto:${email}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                                                    {email}
                                                </a>
                                            </td>
                                            <td className="py-3 px-4 text-gray-700">
                                                <div className="max-w-md">
                                                    <p className="truncate" title={message}>
                                                        {message}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <button
                                                    className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition duration-200 transform hover:scale-105 active:scale-95"
                                                    onClick={() => deleteContactById(_id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
}










