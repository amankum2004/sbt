import "./contact.css"
import { useState } from "react"
import { useAuth } from "../store/auth";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const defaultContactFormData = {
    username:"",
    email:"",
    message:"",
};
    
export const Contact = () => {
    const [contact,setContact] = useState(defaultContactFormData);

    const [userData,setUserData] = useState(true); 
    const {user,API} = useAuth();

    if (userData && user) {
        setContact({
            username: user.username,
            email: user.email,
            message: "",
        });
        setUserData(false);
    }

    const navigate = useNavigate();

    // handling the input values
    const handleInput = (e) => {
        let name = e.target.name;
        let value = e.target.value;

        setContact({
            ...contact,
            [name]:value,
        })
    }

    // handling the form submission
    const handleSubmit = async (e) =>{
        e.preventDefault();
        // console.log(contact)
        try {
            // const response = await fetch("http://localhost:27017/api/form/contact",{
            const response = await fetch(`${API}/api/form/contact`,{
                method: "POST",
                headers: {
                    'Content-Type':"application/json",
                },
                body: JSON.stringify(contact)
            });

            if(response.ok){
                setContact(defaultContactFormData);
                const data = await response.json();
                console.log(data);
                // alert("message sent successfully");
                Swal.fire({
                    title: "Success",
                    text: "Message sent successfully",
                    icon: "success",
                });
                navigate("/")
            }
        } catch (error) {
            console.log(error)
        }
    }
    
    return (
        <>
        <div className="contact">
            <div className="content">
                <div className="left-side">
                    <div className="address details">
                        <i className="fas fa-map-marker-alt"></i>
                        <div className="topic">Address</div>
                        <div className="text-one">IIT Mandi</div>
                        <div className="text-two">Himachal Pradesh-175005</div>
                    </div>
                    {/* <div className="phone details">
                    <i className="fas fa-phone-alt"></i>
                    <div className="topic">Phone</div>
                    <div className="text-one">+0098 9893 5647</div>
                    <div className="text-two">+0096 3434 5678</div>
                    </div> */}
                    <div className="email details">
                    <i className="fas fa-envelope"></i>
                    <div className="topic">Email</div>
                    <div className="text-one">kumaraman6012@gmail.com</div>
                    <div className="text-two">amankumariitian2023@gmail.com</div>
                    </div>
                </div>
                <div className="right-side">
                    <div className="topic-text">Contact Us</div>
                    <p>If you have any work from me or any types of quries related to my tutorial, you can send me message from here. It is my pleasure to help you.</p>
                    <form onSubmit={handleSubmit}>
                        <div className="input-box">
                        <input type="text" 
                            placeholder="Name"
                            name="username" 
                            id="username" 
                            autoComplete="off"
                            readOnly
                            value={contact.username}
                            onChange={handleInput}
                            required/>
                        </div>
                        <div className="input-box">
                        <input type="email" 
                            placeholder="Email"
                            name="email" 
                            id="email" 
                            autoComplete="off"
                            readOnly
                            value={contact.email}
                            onChange={handleInput}
                            required/>
                        </div>
                        <div className="input-box message-box">
                        <textarea name="message" 
                            placeholder="Message"
                            id="message"
                            autoComplete="off"
                            value={contact.message}
                            onChange={handleInput}
                            required 
                            cols="30" 
                            rows="10"></textarea>
                        </div>
                        <div>
                            <button type="submit">Submit</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        </>
    )
}