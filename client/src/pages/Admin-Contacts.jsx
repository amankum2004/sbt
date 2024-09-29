import '../CSS/Admin.css'
import { useEffect, useState } from "react"
// import { useAuth } from "../store/auth";
import {toast} from "react-toastify"
import { api } from '../utils/api'
// const token = JSON.parse(localStorage.getItem('token'))

export const AdminContacts = () => {
    const [contactData,setContactData] = useState([]);
    // const { authorizationToken, API} = useAuth();
    const getContactsData =  async() => {
        try {
            const response = await api.get("/admin/contacts")
            // const response = await fetch("http://localhost:8000/api/admin/contacts",{
            //     method:"GET",
            //     headers:{
            //         Authorization: `Bearer ${token}`
            //     }
            // });
            const data = await response.data;
            console.log("Contact data: ",response.data);
            if(response){
                setContactData(data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    // DEFINING THE FUNCTION deleteContactById
    const deleteContactById = async(id) => {
        try {
            const response = await api.delete(`http://localhost:8000/api/admin/contacts/delete/${id}`)
            // const response = await fetch(`http://localhost:8000/api/admin/contacts/delete/${id}`,{
            //     method:'DELETE',
            //     headers: {
            //         Authorization:`Bearer ${token}`
            //     }
            // });
            
            if(response.ok){
                getContactsData();
                toast.success("Deleted Successfully");
            }else{
                toast.error("Error in deletion");
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getContactsData();
    },[]);

    return <>
   <section className="admin-contacts-section">
    <h1>Contacts Data for Admin</h1>
    <div className="container-admin-users">
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th className="message-column">Message</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {contactData.map((curContactData, index) => {
                    const { name, email, message, _id } = curContactData;

                    return (
                        <tr key={index}>
                            <td>{name}</td>
                            <td>{email}</td>
                            <td className="message-column">{message}</td>
                            <td>
                                <button className="btn" onClick={() => deleteContactById(_id)}>Delete</button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
</section>


    </>
}