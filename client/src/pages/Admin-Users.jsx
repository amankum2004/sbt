import React from "react"; 
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from '../utils/api';
import Swal from 'sweetalert2';

export const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const getAllUsersData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/users`);
            const data = response.data;
            // console.log('Users data:', data);
            
            if (Array.isArray(data)) {
                setUsers(data);
            } else {
                console.log('Unexpected data structure:', data);
                setUsers([]);
            }
        } catch (error) {
            console.log('Error fetching users:', error);
            Swal.fire({
                title: "Error",
                text: "Failed to fetch users data",
                icon: "error"
            });
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }

    // DELETE THE USER ON DELETE BUTTON 
    const deleteUser = async (id) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!'
            });

            if (result.isConfirmed) {
                const response = await api.delete(`/admin/users/delete/${id}`);
                
                if (response.status === 200) {
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'User has been deleted.',
                        icon: 'success'
                    });
                    getAllUsersData();
                } else {
                    throw new Error(response.data?.message || 'Failed to delete user');
                }
            }
        } catch (error) {
            console.log('Delete error:', error);
            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Failed to delete user",
                icon: "error"
            });
        }
    }
    
    useEffect(() => {
        getAllUsersData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <section className="flex flex-col items-center min-h-screen bg-gray-100 py-8">
            <div className="w-11/12 max-w-6xl p-6 bg-white shadow-lg rounded-lg">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Users Data for Admin</h1>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-800 text-white">
                                <th className="py-3 px-4 text-left uppercase text-sm font-semibold">Name</th>
                                <th className="py-3 px-4 text-left uppercase text-sm font-semibold">Phone</th>
                                <th className="py-3 px-4 text-left uppercase text-sm font-semibold">Email</th>
                                <th className="py-3 px-4 text-left uppercase text-sm font-semibold">User Type</th>
                                <th className="py-3 px-4 text-left uppercase text-sm font-semibold">Update</th>
                                <th className="py-3 px-4 text-left uppercase text-sm font-semibold">Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users && users.length > 0 ? (
                                users.map((curUser, index) => (
                                    <tr key={curUser._id || index} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4 text-gray-700">{curUser.name}</td>
                                        <td className="py-3 px-4 text-gray-700">{curUser.phone}</td>
                                        <td className="py-3 px-4 text-gray-700">{curUser.email}</td>
                                        <td className="py-3 px-4 text-gray-700">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                curUser.usertype === 'admin' 
                                                    ? 'bg-purple-100 text-purple-800' 
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {curUser.usertype}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Link
                                                to={`/admin/users/${curUser._id}/edit`}
                                                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
                                            >
                                                Edit
                                            </Link>
                                        </td>
                                        <td className="py-3 px-4">
                                            <button
                                                onClick={() => deleteUser(curUser._id)}
                                                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-200"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-8 text-center text-gray-500">
                                        {loading ? 'Loading users...' : 'No users found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};




