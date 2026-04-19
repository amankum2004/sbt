import React, { useState, useEffect } from "react";
import { useLogin } from "../components/LoginContext";
import { api } from "../utils/api";
import Swal from "sweetalert2";
import { FaUserEdit, FaEnvelope, FaPhoneAlt } from "react-icons/fa";
import { MdEdit, MdCancel } from "react-icons/md";
import { FiSave, FiTrash2 } from "react-icons/fi";

const defaultContactFormData = {
  username: "",
  email: "",
  phone: "",
};

export const CustomerProfile = () => {
  const [profile, setProfile] = useState(defaultContactFormData);
  const [isEditable, setIsEditable] = useState(false);
  const { user, setUser, logout } = useLogin();

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
        // alert("Profile updated successfully!");
        Swal.fire({
                title: "Success",
                text: "Profile updated successfully!",
                icon: "success",
                confirmButtonText: "OK",
              });
        const updatedUser = {
          ...user,
          name: profile.username,
          email: profile.email,
          phone: profile.phone,
        };
        setUser(updatedUser);
        localStorage.setItem("user_data", JSON.stringify(updatedUser));
        setIsEditable(false);
      }
    } catch (error) {
      console.error("Profile update failed", error);
    }
  };

  const handleDeleteAccount = async () => {
    const result = await Swal.fire({
      title: "Delete your account?",
      text: "This will deactivate your account and you will no longer be able to sign in.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete my account",
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#64748B",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await api.delete("/user/delete-account");
      if (response.status === 200) {
        await Swal.fire({
          title: "Account deleted",
          text: "Your account has been deactivated.",
          icon: "success",
          confirmButtonText: "OK",
        });
        logout();
      }
    } catch (error) {
      console.error("Account deletion failed", error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to delete account",
        icon: "error",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50 px-3 py-3 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-20 top-20 h-64 w-64 rounded-full bg-cyan-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-36 h-64 w-64 rounded-full bg-amber-200/60 blur-3xl" />

      <section className="relative mx-auto mt-1 w-full max-w-2xl rounded-3xl border border-white/70 bg-white/90 p-7 shadow-[0_24px_70px_-20px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8">
        <div className="mb-7 text-center">
          <p className="inline-flex rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
            My Account
          </p>
          <h2 className="mt-3 text-3xl font-black text-slate-900">
            Hello <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">{user?.name}</span>
          </h2>
          <p className="mt-2 text-sm text-slate-600">Manage your personal details and keep your profile up to date.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-semibold text-slate-700">Name</label>
            <div className="relative">
              <FaUserEdit className="pointer-events-none absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                name="username"
                id="username"
                value={profile.username}
                onChange={handleInput}
                readOnly={!isEditable}
                className={`h-11 w-full rounded-xl pl-10 pr-3 text-sm outline-none transition ${
                  isEditable
                    ? "border border-slate-300 bg-white text-slate-800 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                    : "border border-slate-200 bg-slate-50 text-slate-700"
                }`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
            <div className="relative">
              <FaEnvelope className="pointer-events-none absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                name="email"
                id="email"
                value={profile.email}
                readOnly
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-700 outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-semibold text-slate-700">Phone</label>
            <div className="relative">
              <FaPhoneAlt className="pointer-events-none absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                name="phone"
                id="phone"
                value={profile.phone}
                onChange={handleInput}
                readOnly={!isEditable}
                className={`h-11 w-full rounded-xl pl-10 pr-3 text-sm outline-none transition ${
                  isEditable
                    ? "border border-slate-300 bg-white text-slate-800 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                    : "border border-slate-200 bg-slate-50 text-slate-700"
                }`}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={toggleEdit}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                isEditable
                  ? "bg-slate-600 text-white hover:bg-slate-700"
                  : "border border-slate-300 bg-white text-slate-700 hover:border-cyan-300 hover:text-cyan-700"
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
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-amber-400 px-5 py-2.5 text-sm font-black text-slate-950 transition hover:brightness-110"
              >
                <FiSave /> Save Changes
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="relative mx-auto mt-6 w-full max-w-2xl rounded-3xl border border-rose-200/80 bg-rose-50/70 p-6 shadow-[0_18px_50px_-30px_rgba(220,38,38,0.45)] backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {/* <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-600">Danger Zone</p> */}
            <h3 className="mt-2 text-lg font-bold text-rose-900">Delete Account</h3>
            <p className="mt-1 text-sm text-rose-700">
              This will deactivate your account. You will lose access until support reactivates it.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            <FiTrash2 /> Delete Account
          </button>
        </div>
      </section>
    </main>
  );
};
