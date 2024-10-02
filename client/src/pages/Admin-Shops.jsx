import { useEffect, useState } from "react";
// import { useAuth } from "../store/auth";
import { Link } from "react-router-dom";
import { api } from "../utils/api";
import React from "react"; 
// import Axios from "axios";
// const token = JSON.parse(localStorage.getItem('token'))

export const AdminShops = () => {
    const [shop,setShop] = useState([]);
    // const {authorizationToken,API} = useAuth();

    const getAllShopsData = async() => {
        try {
            const response = await api.get(`/admin/shops`)
            // const response = await fetch(`http://localhost:8000/api/admin/shops`,{
            //     method:"GET",
            //     headers:{
            //         Authorization: `Bearer ${token}`,
            //     }
            // });
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
            // const response = await fetch(`http://localhost:8000/api/admin/shops/delete/${id}`,{
            //     method:"DELETE",
            //     headers:{
            //         Authorization: `Bearer ${token}`,
            //     }
            // });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])
    return <>
        {/* <section className="admin-users-section">
            <div className="container">
                <h1>Shops Data for Admin</h1>
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
                        {shop.map((curShop,index) => {
                            return <tr key={index}>
                                <td>{curShop.name}</td>
                                <td>{curShop.email}</td>
                                <td>{curShop.phone}</td>
                                <td>
                                    <Link to={`/admin/shops/${curShop._id}/edit`}>Edit</Link> 
                                </td> 
                                <td><button onClick={() => deleteShop(curShop._id)}>
                                    {""}
                                    Delete{""}
                                    </button></td>
                            </tr>
                        })}
                    </tbody>
                </table>
            </div>
        </section> */}

<section className="py-10 bg-gray-100">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-semibold mb-5">Shops Data for Admin</h1>
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-800 text-white">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Phone</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Update</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Delete</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {shop.map((curShop, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap">{curShop.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{curShop.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{curShop.phone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link to={`/admin/shops/${curShop._id}/edit`} className="text-blue-500 hover:text-blue-700">Edit</Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button onClick={() => deleteShop(curShop._id)} className="text-red-500 hover:text-red-700">Delete</button>
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