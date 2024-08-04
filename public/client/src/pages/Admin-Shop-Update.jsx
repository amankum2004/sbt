import { useEffect, useState } from "react";
import {useParams} from "react-router-dom";
import { useAuth } from "../store/auth";
import {toast} from "react-toastify"


export const AdminShopUpdate = () => {
    const [data,setData] = useState({
        username:"",
        email:"",
        phone:"",
        shopname:"",
        state:"",
        district:"",
        city:"",
        street:"",
        pin:"",
    });

    const params = useParams();
    const { authorizationToken, API} = useAuth();

    // GET SINGLE SHOP DATA FOR UPDATION
    const getSingleUserData = async () => {
        try {
            // const response = await fetch(`http://localhost:27017/api/admin/users/${params.id}`,
            const response = await fetch(`${API}/api/admin/shops/${params.id}`,
            {
                method:"GET",
                headers: {
                    Authorization: authorizationToken,
                }
            });
            const data = await response.json();
            // console.log(`user single data: ${data}`);
            setData(data);

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
            // const response = await fetch(`http://localhost:27017/api/admin/users/update/${params.id}`,{
            const response = await fetch(`${API}/api/admin/shops/update/${params.id}`,{
                method:"PATCH",
                headers:{
                    "Content-Type":"application/json",
                    Authorization: authorizationToken,
                },
                body: JSON.stringify(data)
            });
            if(response.ok){
                toast.success("Updated Successfully");
            }else{
                toast.error("Error in Updation");
            }
            
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <section className="section-contact">
            <div className="contact-content container">
                <h1 className="main-heading">Update Shop Data</h1>
            </div>

            {/* Contact page main */}
            <div className="container grid grid-two-cols">
                {/* <div className="contact-img">
                    <img src="/images/contact.jpeg" alt="contact us" />
                </div> */}

                {/* Contact form */}
                <section className="section-form">
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="username">username</label>
                            <input type="text" 
                            name="username" 
                            id="username" 
                            autoComplete="off"
                            value={data.username}
                            onChange={handleInput}
                            required/>
                        </div>
                        
                        <div>
                            <label htmlFor="email">email</label>
                            <input type="email" 
                            name="email" 
                            id="email" 
                            autoComplete="off"
                            value={data.email}
                            onChange={handleInput}
                            required/>
                        </div>
                        
                        <div>
                            <label htmlFor="phone">Phone</label>
                            <input type="phone" 
                            name="phone" 
                            id="phone" 
                            autoComplete="off"
                            value={data.phone}
                            onChange={handleInput}
                            required/>
                        </div>

                        <div>
                            <label htmlFor="shopname">Shop Name</label>
                            <input type="text" 
                            name="shopname" 
                            id="shopname" 
                            autoComplete="off"
                            value={data.shopname}
                            onChange={handleInput}
                            required/>
                        </div>

                        <div>
                            <label htmlFor="state">State</label>
                            <input type="text" 
                            name="state" 
                            id="state" 
                            autoComplete="off"
                            value={data.state}
                            onChange={handleInput}
                            required/>
                        </div>
                        
                        <div>
                            <label htmlFor="district">District</label>
                            <input type="text" 
                            name="district" 
                            id="district" 
                            autoComplete="off"
                            value={data.district}
                            onChange={handleInput}
                            required/>
                        </div>
                        
                        <div>
                            <label htmlFor="city">City</label>
                            <input type="text" 
                            name="city" 
                            id="city" 
                            autoComplete="off"
                            value={data.city}
                            onChange={handleInput}
                            required/>
                        </div>
                        
                        <div>
                            <label htmlFor="street">Street</label>
                            <input type="text" 
                            name="street" 
                            id="street" 
                            autoComplete="off"
                            value={data.street}
                            onChange={handleInput}
                            required/>
                        </div>
                        
                        <div>
                            <label htmlFor="pin">PIN</label>
                            <input type="number" 
                            name="pin" 
                            id="pin" 
                            autoComplete="off"
                            value={data.pin}
                            onChange={handleInput}
                            required/>
                        </div>

                        <div>
                            <button type="submit">Update</button>
                        </div>
                    </form>
                </section>

            </div>
        </section>
    )
}