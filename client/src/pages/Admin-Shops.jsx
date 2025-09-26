import React from "react"; 
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";

// const token = JSON.parse(localStorage.getItem('token'))

export const AdminShops = () => {
    const [shop,setShop] = useState([]);
    // const {authorizationToken,API} = useAuth();

    const getAllShopsData = async() => {
        try {
            const response = await api.get(`/admin/shops`)
            const data = await response.data;
            console.log(`shops ${data}`);
            setShop(data);
        }
        catch (error) {
            console.log(error);
        }
    }

    // DELETE THE USER ON DELETE BUTTON 
    const deleteShop = async(id) => {
        try {
            console.log(id);
            const response = await api.delete(`/admin/shops/delete/${id}`)
            const data = await response.json();
            console.log(`shops after deletion ${data}`);
            
            if(response){
                getAllShopsData();
            } 
        }catch (error) {
            console.log(error);
        }
    }
    
    useEffect(() => {
        getAllShopsData();
    },[])
    return <> 
            <section className="flex flex-col items-center  min-h-screen  bg-gray-100">
            <div className="w-11/12 max-w-6xl p-6 bg-white shadow-lg rounded-lg">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Approved Shops Data</h1>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-800 text-white">
                                <th className="py-3 px-4 text-left uppercase text-sm font-semibold">Name</th>
                                <th className="py-3 px-4 text-left uppercase text-sm font-semibold">Email</th>
                                <th className="py-3 px-4 text-left uppercase text-sm font-semibold">Phone</th>
                                <th className="py-3 px-4 text-left uppercase text-sm font-semibold">Update</th>
                                <th className="py-3 px-4 text-left uppercase text-sm font-semibold">Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shop.map((curShop, index) => (
                                <tr key={index} className="border-b hover:bg-gray-100">
                                    <td className="py-3 px-4 text-gray-700">{curShop.name}</td>
                                    <td className="py-3 px-4 text-gray-700">{curShop.email}</td>
                                    <td className="py-3 px-4 text-gray-700">{curShop.phone}</td>
                                    <td className="py-3 px-4">
                                        <Link to={`/admin/shops/${curShop._id}/edit`} className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition duration-300 transform hover:-translate-y-1">Edit</Link>
                                    </td>
                                    <td className="py-3 px-4 text-gray-700">
                                        <button onClick={() => deleteShop(curShop._id)} className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 active:bg-red-700 transition duration-300 transform hover:-translate-y-1">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    </>

};