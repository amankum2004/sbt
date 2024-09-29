import { useEffect, useState } from "react";
import { useAuth } from "../store/auth";
import { Link } from "react-router-dom";
// import Axios from "axios";

export const AdminShops = () => {
    const [shop,setShop] = useState([]);
    const {authorizationToken,API} = useAuth();

    const getAllShopsData = async() => {
        try {
            const response = await fetch(`${API}/api/admin/shops`,{
                method:"GET",
                headers:{
                    Authorization: authorizationToken,
                }
            });
            const data = await response.json();
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
            const response = await fetch(`${API}/api/admin/shops/delete/${id}`,{
                method:"DELETE",
                headers:{
                    Authorization: authorizationToken,
                }
            });
            const data = await response.json();
            console.log(`shops after deletion ${data}`);
            
            if(response.ok){
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
    <section className="admin-users-section">
        <div className="container">
            <h1>Admin Shops Data</h1>
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
                            <td>{curShop.username}</td>
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
    </section>
    </>

};