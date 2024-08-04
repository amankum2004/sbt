import { useEffect, useState } from "react"
import { useAuth } from "../store/auth";
import {toast} from "react-toastify"

export const AdminContacts = () => {
    const [contactData,setContactData] = useState([]);
    const { authorizationToken, API} = useAuth();
    const getContactsData =  async() => {
        try {
            // const response = await fetch("http://localhost:27017/api/admin/contacts",{
            const response = await fetch(`${API}/api/admin/contacts`,{
                method:"GET",
                headers:{
                    Authorization: authorizationToken
                }
            });
            const data = await response.json();
            console.log("Contact data: ",data);
            if(response.ok){
                setContactData(data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    // DEFINING THE FUNCTION deleteContactById
    const deleteContactById = async(id) => {
        try {
            // const response = await fetch(`http://localhost:27017/api/admin/contacts/delete/${id}`,{
            const response = await fetch(`${API}/api/admin/contacts/delete/${id}`,{
                method:'DELETE',
                headers: {
                    Authorization:authorizationToken
                }
            });
            
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]);

    return <>
        <section className="admin-contacts-section">
            <h1>Admin Contacts data</h1>

            <div className="container-admin-users">
                {contactData.map((curContactData,index) => {
                    const {username,email,message,_id} = curContactData;

                    return(
                        <div key={index}>
                            <p>{username}</p>
                            <p>{email}</p>
                            <p>{message}</p>
                            <button className="btn" onClick={() => deleteContactById(_id)}>Delete</button>
                        </div>
                    )
            })} 
            </div>
        </section>
    </>
}