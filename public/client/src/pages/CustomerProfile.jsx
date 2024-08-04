import { useAuth } from "../store/auth";
import { useState } from "react";
// import { useParams } from "react-router-dom";

const defaultContactFormData = {
    username:"",
    email:"",
    phone:"",
};

export const CustomerProfile = () => {
    const [profile,setProfile] = useState(defaultContactFormData);

    const [userData,setUserData] = useState(true); 
    const {user,API} = useAuth();

    if (userData && user) {
        setProfile({
            username: user.username,
            email: user.email,
            phone: user.phone,
        });

        setUserData(false);
    }

    // handling the input values
    const handleInput = (e) => {
        let name = e.target.name;
        let value = e.target.value;

        setProfile({
            ...profile,
            [name]:value,
        })
    }

    const handleSubmit = async (e) =>{
        e.preventDefault();
        // console.log(profile)
        try {
            // const response = await fetch(`${API}/api/auth/register/update/${params.id}`,{
            const response = await fetch(`${API}/api/auth/register`,{
                method: "POST",
                headers: {
                    'Content-Type':"application/json",
                },
                body: JSON.stringify(profile)
            });

            if(response.ok){
                setProfile(defaultContactFormData);
                const data = await response.json();
                console.log(data);
                alert("Details updated successfully");
            }
        } catch (error) {
            console.log(error)
        }

    }
    
    return (
        <>
        <main>
            <section className="section-hero">
                <div className="container">
                    <div className="hero-content">
                        <p>Welcome, 
                            {user ? `${user.username} to our website` : `to our website`}
                        </p>
                        <h3>It is your profile page</h3>
                        <form onSubmit={handleSubmit}>
                        <div className="input-box">
                        <label>
                            Name : 
                        <input type="text" 
                            placeholder="Name"
                            name="username" 
                            id="username" 
                            autoComplete="off"
                            value={profile.username}
                            onChange={handleInput}
                            readOnly
                            required/>
                        </label>
                        </div>
                        <div className="input-box">
                        <label>
                            Email : 
                        <input type="email" 
                            placeholder="Email"
                            name="email" 
                            id="email" 
                            autoComplete="off"
                            value={profile.email}
                            onChange={handleInput}
                            readOnly
                            required/>
                        </label>
                        </div>
                        <div className="input-box">
                        <label>
                            Phone : 
                        <input type="phone" 
                            placeholder="Phone"
                            name="phone" 
                            id="phone" 
                            autoComplete="off"
                            value={profile.phone}
                            onChange={handleInput}
                            readOnly
                            required/>
                        </label>
                        </div>
                        
                        <div>
                            <button type="submit">Submit</button>
                        </div>
                    </form>
                    </div>
                </div>
            </section>
        </main>
        </>
    )
}