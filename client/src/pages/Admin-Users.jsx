// import '../CSS/Admin.css'
import { useEffect, useState } from "react";
// import { useAuth } from "../store/auth";
import { Link } from "react-router-dom";
import { api } from '../utils/api';
import React from "react"; 
// import Axios from "axios";
// const token = JSON.parse(localStorage.getItem('token'))

export const AdminUsers = () => {
    const [users,setUsers] = useState([]);
    // const {authorizationToken,API} = useAuth();

    const getAllUsersData = async() => {
        try {
            const response = await api.get(`/admin/users`)
            // const response = await fetch(`http://localhost:8000/api/admin/users`,{
            //     method:"GET",
            //     headers:{
            //         Authorization: `Bearer ${token}`,
            //     }
            // });
            const data = await response.data;
            console.log(`users ${data}`);
            // setUsers(data);
            if (Array.isArray(data)) {
                setUsers(data); // Set the data directly if it's an array
            } else {
                console.log('Unexpected data structure:', data);
                setUsers([]); // Set an empty array or handle the unexpected structure
            }
        }
        catch (error) {
            console.log(error);
            setUsers([]);
        }
    }

    // DELETE THE USER ON DELETE BUTTON 
    const deleteUser = async(id) => {
        try {
            console.log(id);
            const response = await api.delete(`/admin/users/delete/${id}`)
            // const response = await fetch(`http://localhost:8000/api/admin/users/delete/${id}`,{
            //     method:"DELETE",
            //     headers:{
            //         Authorization: `Bearer ${token}`,
            //     }
            // });
            const data = await response.json();
            console.log(`users after deletion ${data}`);
            
            if(response.ok){
                getAllUsersData();
            } 
        }catch (error) {
            console.log(error);
        }
    }
    
    useEffect(() => {
        getAllUsersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])
    return <>
    {/* <section className="admin-users-section">
        <div className="container">
            <h1>Users Data for Admin</h1>
        </div>
        <div className="container admin-users">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Update</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {users && users.length > 0 ? (
                        users.map((curUser, index) => (
                            <tr key={index}>
                                <td>{curUser.name}</td>
                                <td>{curUser.email}</td>
                                <td>{curUser.phone}</td>
                                <td>
                                    <Link to={`/admin/users/${curUser._id}/edit`}>Edit</Link>
                                </td>
                                <td>
                                    <button onClick={() => deleteUser(curUser._id)}>Delete</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5">No users found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </section> */}
     <section className="flex flex-col items-center justify-center min-h-screen py-10 bg-gray-100">
            <div className="w-11/12 max-w-6xl p-8 bg-white shadow-lg rounded-lg">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Users Data for Admin</h1>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-blue-500 text-white">
                                <th className="py-3 px-4 text-left uppercase text-sm font-semibold">Name</th>
                                <th className="py-3 px-4 text-left uppercase text-sm font-semibold">Email</th>
                                <th className="py-3 px-4 text-left uppercase text-sm font-semibold">Phone</th>
                                <th className="py-3 px-4 text-left uppercase text-sm font-semibold">Update</th>
                                <th className="py-3 px-4 text-left uppercase text-sm font-semibold">Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users && users.length > 0 ? (
                                users.map((curUser, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-100">
                                        <td className="py-3 px-4 text-gray-700">{curUser.name}</td>
                                        <td className="py-3 px-4 text-gray-700">{curUser.email}</td>
                                        <td className="py-3 px-4 text-gray-700">{curUser.phone}</td>
                                        <td className="py-3 px-4">
                                            <Link
                                                to={`/admin/users/${curUser._id}/edit`}
                                                className="text-blue-500 hover:text-blue-700 font-semibold"
                                            >
                                                Edit
                                            </Link>
                                        </td>
                                        <td className="py-3 px-4">
                                            <button
                                                onClick={() => deleteUser(curUser._id)}
                                                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-5 text-center text-gray-500">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    </>

};