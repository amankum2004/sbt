import { NavLink,Outlet,Navigate } from "react-router-dom";
import { FaUser,FaHome,FaRegListAlt} from "react-icons/fa";
import {FaMessage} from "react-icons/fa6";
import React from "react"; 
import { useLogin } from "../components/LoginContext";


export const AdminLayout = () => {
    const {user} = useLogin();
    console.log("admin layout",user);

    // if(isLoading){
    //     return <h1>Loading ...</h1>
    // }

    if (!user.usertype === 'admin') {
        return <Navigate to="/"/>
    }

    return <>
    <header className="bg-gray-800 text-white shadow-lg">
                <div className="container mx-auto p-4">
                    <nav className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
                        <ul className="flex space-x-6">
                            <li>
                                <NavLink to="/admin" className={({ isActive }) => `flex items-center space-x-2 p-2 rounded-md ${isActive ? 'bg-white-600' : 'hover:bg-white-500'} transition`}>
                                    <FaHome /> <span>Home</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/admin/users" className={({ isActive }) => `flex items-center space-x-2 p-2 rounded-md ${isActive ? 'bg-blue-600' : 'hover:bg-blue-500'} transition`}>
                                    <FaUser /> <span>Users</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/admin/contacts" className={({ isActive }) => `flex items-center space-x-2 p-2 rounded-md ${isActive ? 'bg-blue-600' : 'hover:bg-blue-500'} transition`}>
                                    <FaMessage /> <span>Contacts</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/admin/services" className={({ isActive }) => `flex items-center space-x-2 p-2 rounded-md ${isActive ? 'bg-blue-600' : 'hover:bg-blue-500'} transition`}>
                                    <FaRegListAlt /> <span>Services</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/admin/shops" className={({ isActive }) => `flex items-center space-x-2 p-2 rounded-md ${isActive ? 'bg-blue-600' : 'hover:bg-blue-500'} transition`}>
                                    <FaRegListAlt /> <span>Shops</span>
                                </NavLink>
                            </li>
                        </ul>
                    </nav>
                </div>
            </header>
            {/* <main className="container mx-auto p-4">
                <Outlet />
            </main> */}
    <Outlet/>
    </>
}