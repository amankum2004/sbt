// import { useAuth } from "../store/auth";
import { useLogin } from "../components/LoginContext";
import { useState } from "react";
import { api } from "../utils/api";
// import { useParams } from "react-router-dom";
import React from "react"; 

const defaultContactFormData = {
    username: "",
    email: "",
    phone: "",
};

export const CustomerProfile = () => {
    const [profile, setProfile] = useState(defaultContactFormData);

    const [userData, setUserData] = useState(true);
    const { user } = useLogin();
    // const {user,API} = useAuth();

    if (userData && user) {
        setProfile({
            username: user.name,
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
            [name]: value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        // console.log(profile)
        try {
            // const response = await fetch(`${API}/api/auth/register/update/${params.id}`,{
            // const response = await fetch(`${API}/api/auth/register`,{
            // const response = await fetch(`http://localhost:27017/api/auth/register`,{
            const response = await api.post(`/auth/register`, {
                method: "POST",
                headers: {
                    'Content-Type': "application/json",
                },
                body: JSON.stringify(profile)
            });

            if (response.ok) {
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
            {/* <main>
                <section className="section-hero">
                    <div className="container">
                        <div className="hero-content">
                            <p>Welcome,
                                {user ? `${user.name} to our website` : `to our website`}
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
                                            required />
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
                                            required />
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
                                            required />
                                    </label>
                                </div>

                                <div>
                                    <button type="submit">Submit</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>
            </main> */}

            <main
                // style={{
                //     padding: '20px',
                //     backgroundColor: '#f4f4f4',
                //     minHeight: '100vh',
                // }}
            >
                <section
                    // style={{
                    //     backgroundColor: '#fff',
                    //     borderRadius: '10px',
                    //     padding: '30px',
                    //     boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                    //     maxWidth: '600px',
                    //     margin: '0 auto',
                    // }}
                    className="section-hero"
                >
                    <div className="container"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <div
                            className="hero-content"
                            style={{
                                textAlign: 'center',
                            }}
                        >
                            <p
                                style={{
                                    fontSize: '18px',
                                    color: '#333',
                                    marginBottom: '10px',
                                }}
                            >
                                Welcome, {user ? `${user.name} to our website` : ` to our website`}
                            </p>
                            <h3
                                style={{
                                    fontSize: '24px',
                                    color: '#555',
                                    marginBottom: '20px',
                                }}
                            >
                                It is your profile
                            </h3>
                            <form onSubmit={handleSubmit}>
                                <div className="input-box"
                                    style={{
                                        marginBottom: '15px',
                                    }}
                                >
                                    <label
                                        style={{
                                            display: 'block',
                                            marginBottom: '5px',
                                            color: '#555',
                                            fontSize: '16px',
                                        }}
                                    >
                                        Name:
                                        <input
                                            type="text"
                                            placeholder="Name"
                                            name="username"
                                            id="username"
                                            autoComplete="off"
                                            value={profile.username}
                                            onChange={handleInput}
                                            readOnly
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: '5px',
                                                border: '1px solid #ccc',
                                                marginTop: '5px',
                                                fontSize: '14px',
                                            }}
                                        />
                                    </label>
                                </div>
                                <div className="input-box"
                                    style={{
                                        marginBottom: '15px',
                                    }}
                                >
                                    <label
                                        style={{
                                            display: 'block',
                                            marginBottom: '5px',
                                            color: '#555',
                                            fontSize: '16px',
                                        }}
                                    >
                                        Email:
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            name="email"
                                            id="email"
                                            autoComplete="off"
                                            value={profile.email}
                                            onChange={handleInput}
                                            readOnly
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: '5px',
                                                border: '1px solid #ccc',
                                                marginTop: '5px',
                                                fontSize: '14px',
                                            }}
                                        />
                                    </label>
                                </div>
                                <div className="input-box"
                                    style={{
                                        marginBottom: '15px',
                                    }}
                                >
                                    <label
                                        style={{
                                            display: 'block',
                                            marginBottom: '5px',
                                            color: '#555',
                                            fontSize: '16px',
                                        }}
                                    >
                                        Phone:
                                        <input
                                            type="phone"
                                            placeholder="Phone"
                                            name="phone"
                                            id="phone"
                                            autoComplete="off"
                                            value={profile.phone}
                                            onChange={handleInput}
                                            readOnly
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: '5px',
                                                border: '1px solid #ccc',
                                                marginTop: '5px',
                                                fontSize: '14px',
                                            }}
                                        />
                                    </label>
                                </div>
                                <div
                                    style={{
                                        textAlign: 'center',
                                    }}
                                >
                                    <button
                                        type="submit"
                                        style={{
                                            padding: '10px 20px',
                                            backgroundColor: '#007bff',
                                            color: '#fff',
                                            borderRadius: '5px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '16px',
                                        }}
                                    >
                                        Submit
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>
            </main>

        </>
    )
}