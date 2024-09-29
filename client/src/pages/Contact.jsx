import "../CSS/contact.css"
import { useState } from "react"
// import { useAuth } from "../store/auth";
import { useLogin } from "../components/LoginContext";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import Swal from "sweetalert2";

const defaultContactFormData = {
    name:"",
    email:"",
    message:"",
};
    
export const Contact = () => {
    const [contact,setContact] = useState(defaultContactFormData);

    const [userData,setUserData] = useState(true); 
    // const {user,API} = useAuth();
    const { user } = useLogin();

    if (userData && user) {
        setContact({
            name: user.name,
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
            const response = await api.post("/form/contact",contact)
                // const response = await fetch("http://localhost:8000/api/form/contact",{
                // method: "POST",
                // headers: {
                //     'Content-Type':"application/json",
                // },
                // body: JSON.stringify(contact)
                // });

            if(response){
                setContact(defaultContactFormData);
                // const data = await response.json();
                // console.log(data);
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
                    <p>Whether you have questions, need support, or just want to share your feedback, we’re here to help. Your experience is important to us, and we’re committed to providing you with the best service possible.</p>
                    <form onSubmit={handleSubmit}>
                        <div className="input-box">
                        <input type="text" 
                            placeholder="Name"
                            name="name" 
                            id="name" 
                            autoComplete="off"
                            // readOnly
                            value={contact.name}
                            onChange={handleInput}
                            required/>
                        </div>
                        <div className="input-box">
                        <input type="email" 
                            placeholder="Email"
                            name="email" 
                            id="email" 
                            autoComplete="off"
                            // readOnly
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