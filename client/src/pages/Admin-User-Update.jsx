// import '../CSS/Admin.css'
import { useEffect, useState } from "react";
import {useParams} from "react-router-dom";
// import { useAuth } from "../store/auth";
import { useLogin } from "../components/LoginContext";
import {toast} from "react-toastify"
import React from "react"; 
import Swal from 'sweetalert2';
import { api } from '../utils/api';
const token = JSON.parse(localStorage.getItem('token'))


export const AdminUserUpdate = () => {
    const { user } = useLogin();
    const [data,setData] = useState({
        name:user.name || "",
        email:user.email || "",
        phone:user.phone || "",
    });

    const params = useParams();
    // const { authorizationToken, API} = useAuth();

    // GET SINGLE USER DATA FOR UPDATION
    const getSingleUserData = async () => {
        try {
                const response = await api.get(`/admin/users/${params.id}`)
            //     const response = await fetch(`http://localhost:8000/api/admin/users/${params.id}`,{
            //     method:"GET",
            //     headers: {
            //         Authorization: `Bearer ${token}`,
            //     }
            // });
            const userData = await response.data;
            // console.log(`user single data: ${data}`);
            // setData(data);
            setData({
                name: userData.name || "",
                email: userData.email || "",
                phone: userData.phone || "",
            });
            // if(response.ok){
            //     getSingleUserData();
            // } 
        }catch (error) {
            console.log(error);
        }
    }
    

    useEffect(() => {
        getSingleUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    const handleInput = (e) => {
        let name = e.target.name;
        let value = e.target.value;
        setData({
            ...data,
            [name]:value
        });
    };

    // update data dynamically
    const handleSubmit = async(e) => {
        e.preventDefault();

        try {
            const response = await api.patch(`/admin/users/update/${params.id}`,data,{
                headers:{
                    "Content-Type":"application/json",
                    Authorization: `Bearer ${token}`,
                },
            })
            // const response = await fetch(`http://localhost:8000/api/admin/users/update/${params.id}`,{
            //     method:"PATCH",
            //     headers:{
            //         "Content-Type":"application/json",
            //         Authorization: `Bearer ${token}`,
            //     },
            //     body: JSON.stringify(data)
            // });
            if(response){
                toast.success("Updated Successfully");
            }else{
                // toast.error("Error in Updation");
                Swal.fire({ title: "Error", text: `${response.data.extraDetails ? response.data.extraDetails : response.data.message}`, icon: "error" });
            }
            
        } catch (error) {
            console.log(error);
        }
    }

    return (
        // <section className="section-update">
        //     <div className="update-user container">
        //         <h1 className="main-heading">Update User Data</h1>
        //     </div>
        //     <div className="container grid grid-two-cols">
        //         <section className="update-form">
        //             <form onSubmit={handleSubmit}>
        //                 <div>
        //                     <label htmlFor="name">username</label>
        //                     <input type="text" 
        //                     name="name" 
        //                     id="name" 
        //                     autoComplete="off"
        //                     value={data.name}
        //                     onChange={handleInput}
        //                     required/>
        //                 </div>
                        
        //                 <div>
        //                     <label htmlFor="email">email</label>
        //                     <input type="email" 
        //                     name="email" 
        //                     id="email" 
        //                     autoComplete="off"
        //                     value={data.email}
        //                     onChange={handleInput}
        //                     required/>
        //                 </div>
                        
        //                 <div>
        //                     <label htmlFor="phone">Phone</label>
        //                     <input type="phone" 
        //                     name="phone" 
        //                     id="phone" 
        //                     autoComplete="off"
        //                     value={data.phone}
        //                     onChange={handleInput}
        //                     required/>
        //                 </div>
        //                 <div>
        //                     <button type="submit">Update</button>
        //                 </div>
        //             </form>
        //         </section>
        //     </div>
        // </section>

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
                        className="bg-blue-600 text-white py-3 px-5 rounded-lg w-full hover:bg-blue-700 transition-transform transform active:scale-95"
                    >
                        Update
                    </button>
                </div>
            </form>
        </div>
    </section>
    )
}