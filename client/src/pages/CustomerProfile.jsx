import React, { useState, useEffect } from "react";
import { useLogin } from "../components/LoginContext";
import { api } from "../utils/api";
import { FaUserEdit, FaEnvelope, FaPhoneAlt } from "react-icons/fa";
import { MdEdit, MdCancel } from "react-icons/md";
import { FiSave } from "react-icons/fi";

const defaultContactFormData = {
  username: "",
  email: "",
  phone: "",
};

export const CustomerProfile = () => {
  const [profile, setProfile] = useState(defaultContactFormData);
  const [isEditable, setIsEditable] = useState(false);
  const { user, setUser } = useLogin();

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
        localStorage.setItem("token", JSON.stringify(updatedUser));
        setIsEditable(false);
      }
    } catch (error) {
      console.error("Profile update failed", error);
    }
  };

  return (
    <main className="min-h-screen py-10 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
      <section className="w-full max-w-xl bg-white p-8 shadow-2xl rounded-xl border border-blue-100">
        <h2 className="text-center text-3xl font-bold text-blue-700 mb-6 flex items-center justify-center gap-2">
          <FaUserEdit className="text-red-500" />
          Hello <span className="text-red-500">{user?.name}</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div className="relative">
            <label
              htmlFor="username"
              className="text-gray-700 font-medium text-sm block mb-1"
            >
              Name
            </label>
            <div className="flex items-center gap-2">
              <FaUserEdit className="text-gray-500" />
              <input
                type="text"
                name="username"
                id="username"
                value={profile.username}
                onChange={handleInput}
                readOnly={!isEditable}
                className={`w-full px-4 py-2 rounded-md text-sm shadow-sm focus:outline-none ${
                  isEditable
                    ? "border border-blue-400 focus:border-blue-600"
                    : "bg-gray-100 border border-gray-300"
                }`}
              />
            </div>
          </div>

          {/* Email */}
          <div className="relative">
            <label
              htmlFor="email"
              className="text-gray-700 font-medium text-sm block mb-1"
            >
              Email
            </label>
            <div className="flex items-center gap-2">
              <FaEnvelope className="text-gray-500" />
              <input
                type="email"
                name="email"
                id="email"
                value={profile.email}
                onChange={handleInput}
                readOnly={!isEditable}
                className={`w-full px-4 py-2 rounded-md text-sm shadow-sm focus:outline-none ${
                  isEditable
                    ? "border border-blue-400 focus:border-blue-600"
                    : "bg-gray-100 border border-gray-300"
                }`}
              />
            </div>
          </div>

          {/* Phone */}
          <div className="relative">
            <label
              htmlFor="phone"
              className="text-gray-700 font-medium text-sm block mb-1"
            >
              Phone
            </label>
            <div className="flex items-center gap-2">
              <FaPhoneAlt className="text-gray-500" />
              <input
                type="text"
                name="phone"
                id="phone"
                value={profile.phone}
                onChange={handleInput}
                readOnly={!isEditable}
                className={`w-full px-4 py-2 rounded-md text-sm shadow-sm focus:outline-none ${
                  isEditable
                    ? "border border-blue-400 focus:border-blue-600"
                    : "bg-gray-100 border border-gray-300"
                }`}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              type="button"
              onClick={toggleEdit}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition ${
                isEditable
                  ? "bg-gray-500 text-white hover:bg-gray-600"
                  : "bg-yellow-400 hover:bg-yellow-500 text-white"
              }`}
            >
              {isEditable ? (
                <>
                  <MdCancel /> Cancel
                </>
              ) : (
                <>
                  <MdEdit /> Edit
                </>
              )}
            </button>

            {isEditable && (
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
              >
                <FiSave /> Save Changes
              </button>
            )}
          </div>
        </form>
      </section>
    </main>
  );
};
