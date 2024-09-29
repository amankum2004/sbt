import { NavLink,Outlet,Navigate } from "react-router-dom";
import { FaUser,FaHome,FaRegListAlt} from "react-icons/fa";
import {FaMessage} from "react-icons/fa6";
// import { useAuth } from "../store/auth";
import { useLogin } from "../components/LoginContext";


export const AdminLayout = () => {
    // const {user,isLoading} = useAuth();
    const {user} = useLogin();
    console.log("admin layout",user);

    // if(isLoading){
    //     return <h1>Loading ...</h1>
    // }

    if (!user.usertype === 'admin') {
        return <Navigate to="/"/>
    }

    return <>
    <header>
        <div className="container">
            <nav>
                <h2>Admin Dashboard</h2>
                <ul>
                    {/* <li><NavLink to="/admin/"><FaHome/> Home</NavLink></li> */}
                    <li><NavLink to="/admin"><FaHome/> Home</NavLink></li>
                    <li><NavLink to="/admin/users"><FaUser />Users</NavLink></li>
                    <li><NavLink to="/admin/contacts"><FaMessage />Contacts</NavLink></li>
                    <li><NavLink to="/admin/services"><FaRegListAlt />Services</NavLink></li>
                    <li><NavLink to="/admin/shops"><FaRegListAlt />Shops</NavLink></li>
                    
                </ul>
            </nav>
        </div>
    </header>
    <Outlet/>
    </>
}