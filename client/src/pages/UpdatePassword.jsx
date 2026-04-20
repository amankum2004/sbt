import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { api } from "../utils/api";
import { FaEye, FaEyeSlash, FaPhoneAlt, FaLock } from "react-icons/fa";
import BackgroundIcons from "../components/BackgroundIcons";
import { isValidPhone, normalizePhone } from "../utils/phone";

export const UpdatePassword = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });

  const { phone, password } = formData;
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "phone" ? normalizePhone(value) : value,
    }));
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!isValidPhone(phone)) {
      Swal.fire({ title: "Error", text: "Please enter a valid 10-digit mobile number", icon: "error" });
      return;
    }

    if (!password) {
      Swal.fire({ title: "Error", text: "Please enter a new password", icon: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        phone: normalizePhone(phone),
        password,
      };

      const res = await api.post(`/auth/update`, payload, { allowSuccessFalse: true });
      if (res.data?.success) {
        Swal.fire({
          title: "Success",
          text: "Password updated successfully",
          icon: "success",
        });
        navigate("/login", { state: { phone: normalizePhone(phone) } });
      } else {
        Swal.fire({
          title: "Error",
          text: res.data?.message || res.data?.error || "Failed to update password",
          icon: "error",
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || err.response?.data?.error || "Error updating password",
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-cyan-950 px-4 py-10">
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-36 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
      <BackgroundIcons count={7} />

      <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-md items-center">
        <div className="w-full rounded-3xl border border-white/15 bg-slate-900/75 p-7 shadow-[0_20px_60px_-24px_rgba(8,47,73,0.9)] backdrop-blur md:p-8">
          <div className="mb-6 text-center">
            <img src="/images/salonHub-logo.svg" alt="Logo" className="mx-auto h-16 w-16 rounded-full bg-white p-1" />
            <h1 className="mt-4 bg-gradient-to-r from-cyan-200 via-amber-200 to-orange-200 bg-clip-text text-3xl font-black text-transparent">
              Reset Password
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Enter your mobile number and set a new password.
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">

            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <FaPhoneAlt />
              </span>
              <input
                type="tel"
                name="phone"
                placeholder="10-digit mobile number"
                required
                value={phone}
                onChange={handleChange}
                disabled={isSubmitting}
                className="h-11 w-full rounded-xl border border-white/15 bg-slate-950/65 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-70"
              />
            </div>

            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <FaLock />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter new password"
                required
                value={password}
                onChange={handleChange}
                disabled={isSubmitting}
                className="h-11 w-full rounded-xl border border-white/15 bg-slate-950/65 pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-slate-300 transition hover:text-white"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-amber-400 text-sm font-black text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </button>

            <div className="text-center text-sm text-slate-300">
              Remember your password?{" "}
              <Link to="/login" className="font-semibold text-cyan-300 hover:text-cyan-200">
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};
