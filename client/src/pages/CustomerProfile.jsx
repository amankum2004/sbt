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
    <main>
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto flex flex-col items-center">
          <div className="text-center">
                <p className="text-lg font-bold text-blue-500 mb-6">
                    Welcome 
                                {user ? (  
                                <>
                                    <span className="text-red-500 italic font-bold mx-1">{user.name}</span> to our website
                                </>
                                ) : ` to our website `}
                </p>
            <h3 className="text-2xl text-gray-800 mb-6">It is your profile</h3>

            <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 shadow-md rounded-lg">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
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
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500"
                  />
                </label>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
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
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500"
                  />
                </label>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
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
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500"
                  />
                </label>
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 text-sm font-medium"
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