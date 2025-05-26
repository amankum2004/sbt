import React, { useState, useEffect } from "react";
import { useLogin } from "../components/LoginContext";
import { api } from "../utils/api";

const defaultContactFormData = {
  username: "",
  email: "",
  phone: "",
};

export const CustomerProfile = () => {
  const [profile, setProfile] = useState(defaultContactFormData);
  const [isEditable, setIsEditable] = useState(false);
  const { user, setUser } = useLogin(); // include setUser

  useEffect(() => {
    if (user) {
      setProfile({
        username: user.name,
        email: user.email,
        phone: user.phone,
      });
    }
  }, [user]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const toggleEdit = () => setIsEditable(!isEditable);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/user/update-profile/${user.userId}`, profile);
      if (response.status === 200) {
        alert("Profile updated successfully!");
        const updatedUser = {
          ...user,
          name: profile.username,
          email: profile.email,
          phone: profile.phone,
        };
        setUser(updatedUser);
        localStorage.setItem("token", JSON.stringify(updatedUser)); // update storage
        setIsEditable(false);
      }
    } catch (error) {
      console.error("Profile update failed", error);
    }
  };

  return (
    <main className="bg-gray-100 min-h-screen py-10">
      <section className="max-w-xl mx-auto bg-white p-6 shadow-md rounded-lg">
        <h2 className="text-center text-2xl font-semibold text-blue-600 mb-6">
          Hello <span className="text-red-500">{user?.name}</span>, this is your profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {["username", "email", "phone"].map((field) => (
            <div key={field} className="flex items-center gap-4">
              <label htmlFor={field} className="w-20 text-gray-700 font-medium">
                {field.charAt(0).toUpperCase() + field.slice(1)}:
              </label>
              <input
                type={field === "email" ? "email" : "text"}
                id={field}
                name={field}
                value={profile[field]}
                onChange={handleInput}
                readOnly={!isEditable}
                className={`flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none ${
                  isEditable
                    ? "border-blue-400 focus:border-blue-600"
                    : "bg-gray-100 border-gray-300"
                }`}
              />
            </div>
          ))}

          <div className="text-center mt-6 flex justify-center gap-4">
            <button
              type="button"
              onClick={toggleEdit}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              {isEditable ? "Cancel" : "Edit"}
            </button>
            {isEditable && (
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update
              </button>
            )}
          </div>
        </form>
      </section>
    </main>
  );
};


