// import '../CSS/Admin.css'
import { useEffect, useState } from "react"
// import { useAuth } from "../store/auth";
import { toast } from "react-toastify"
import { api } from '../utils/api'
import React from "react";
// const token = JSON.parse(localStorage.getItem('token'))

export const AdminContacts = () => {
    const [contactData, setContactData] = useState([]);
    // const { authorizationToken, API} = useAuth();
    const getContactsData = async () => {
        try {
            const response = await api.get("/admin/contacts")
            const data = await response.data;
            console.log("Contact data: ", response.data);
            if (response) {
                setContactData(data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    // DEFINING THE FUNCTION deleteContactById
    const deleteContactById = async (id) => {
        try {
            const response = await api.delete(`http://localhost:8000/api/admin/contacts/delete/${id}`)

            if (response.ok) {
                getContactsData();
                toast.success("Deleted Successfully");
            } else {
                toast.error("Error in deletion");
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getContactsData();
    }, []);

    return <>

        <section className="flex flex-col items-center  min-h-screen  bg-gray-100">
            <div className="w-11/12 max-w-6xl p-6 bg-white shadow-lg rounded-lg">
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Contacts Data for Admin</h1>
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
                                <tr key={index} className="border-b hover:bg-gray-100">
                                    <td className="py-3 px-4 text-gray-700">{name}</td>
                                    <td className="py-3 px-4 text-gray-700">{email}</td>
                                    <td className="py-3 px-4 text-gray-700">{message}</td>
                                    <td className="py-3 px-4">
                                        <button
                                            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 active:bg-red-700 transition duration-300 transform hover:-translate-y-1"
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
            </div>
        </section>


    </>
}