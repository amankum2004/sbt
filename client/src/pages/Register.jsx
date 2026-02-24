import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaKey,
  FaLock,
  FaPhoneAlt,
  FaUser,
  FaUserTag,
} from "react-icons/fa";
import { api } from "../utils/api";
import BackgroundIcons from "../components/BackgroundIcons";

export const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    usertype: "customer",
    password: "",
    otp: "",
  });

  const { email, name, phone, usertype, password, otp } = formData;
  const [showPassword, setShowPassword] = useState(false);
  const [showOTP, setShowOTP] = useState(false);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!emailRegex.test(email)) {
      Swal.fire({ title: "Error", text: "Please enter a valid email address", icon: "error" });
      return;
    }

    setIsSendingOTP(true);
    try {
      const res = await api.post(
        "/otp/user-otp",
        { email },
        { allowSuccessFalse: true }
      );

      if (res.data?.success) {
        setStep(2);
        Swal.fire({ title: "Success", text: "OTP sent to your email", icon: "success" });
      } else {
        Swal.fire({
          title: "Error",
          text: res.data?.message || res.data?.error || "Unable to send OTP",
          icon: "error",
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || err.response?.data?.error || "Failed to send OTP. Please try again.",
        icon: "error",
      });
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!emailRegex.test(email)) {
      Swal.fire({ title: "Error", text: "Please enter a valid email address", icon: "error" });
      return;
    }

    if (!name || !phone || !password || !otp) {
      Swal.fire({ title: "Error", text: "Please fill all required fields", icon: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post(
        "/auth/register",
        formData,
        { allowSuccessFalse: true }
      );

      if (res.data?.success) {
        Swal.fire({ title: "Success", text: "Registration successful", icon: "success" });
        localStorage.setItem("signupEmail", email);
        navigate("/login", { state: { email } });
      } else {
        Swal.fire({
          title: "Error",
          text: res.data?.message || res.data?.error || "Registration failed",
          icon: "error",
        });
      }
    } catch (err) {
      console.error("Registration error:", err);
      Swal.fire({
        title: "Error",
        text: "Email/Phone already registered or invalid OTP",
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    setIsSendingOTP(true);
    try {
      const res = await api.post(
        "/otp/user-otp",
        { email },
        { allowSuccessFalse: true }
      );

      if (res.data?.success) {
        Swal.fire({ title: "Success", text: "OTP resent to your email", icon: "success" });
      } else {
        Swal.fire({
          title: "Error",
          text: res.data?.message || res.data?.error || "Unable to resend OTP",
          icon: "error",
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || err.response?.data?.error || "Failed to resend OTP",
        icon: "error",
      });
    } finally {
      setIsSendingOTP(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-cyan-950 px-4 py-10">
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-36 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
      <BackgroundIcons count={9} />

      <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-md items-center">
        <div className="w-full rounded-3xl border border-white/15 bg-slate-900/75 p-7 shadow-[0_20px_60px_-24px_rgba(8,47,73,0.9)] backdrop-blur md:p-8">
          <div className="mb-5 text-center">
            <img src="/images/salonHub-logo.svg" alt="SalonHub" className="mx-auto h-16 w-16 rounded-full bg-white p-1" />
            <h1 className="mt-4 bg-gradient-to-r from-cyan-200 via-amber-200 to-orange-200 bg-clip-text text-3xl font-black text-transparent">
              {step === 1 ? "Verify Your Email" : "Create Account"}
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              {step === 1 ? "Enter email to get OTP" : "Complete your profile to continue"}
            </p>
          </div>

          <form onSubmit={step === 1 ? handleSendOTP : handleRegister} className="space-y-4">
            <div className="relative">
              <FaEnvelope className="pointer-events-none absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                name="email"
                value={email}
                onChange={handleInput}
                placeholder="you@example.com"
                disabled={(step === 2 && !isSubmitting) || isSendingOTP}
                required
                autoComplete="off"
                className="h-11 w-full rounded-xl border border-white/15 bg-slate-950/65 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-70"
              />
            </div>

            {step === 2 ? (
              <>
                <div className="relative">
                  <FaUser className="pointer-events-none absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={handleInput}
                    placeholder="Full name"
                    required
                    autoComplete="off"
                    disabled={isSubmitting}
                    className="h-11 w-full rounded-xl border border-white/15 bg-slate-950/65 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                  />
                </div>

                <div className="relative">
                  <FaPhoneAlt className="pointer-events-none absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={phone}
                    onChange={handleInput}
                    placeholder="Mobile number"
                    required
                    autoComplete="off"
                    disabled={isSubmitting}
                    className="h-11 w-full rounded-xl border border-white/15 bg-slate-950/65 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                  />
                </div>

                <div className="relative">
                  <FaUserTag className="pointer-events-none absolute left-3 top-3 text-slate-400" />
                  <select
                    name="usertype"
                    value={usertype}
                    onChange={handleInput}
                    required
                    disabled={isSubmitting}
                    className="h-11 w-full rounded-xl border border-white/15 bg-slate-950/65 pl-10 pr-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                  >
                    <option value="customer">Customer</option>
                    <option value="shopOwner">Shop Owner</option>
                  </select>
                </div>

                <div className="relative">
                  <FaLock className="pointer-events-none absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={handleInput}
                    placeholder="Password"
                    required
                    disabled={isSubmitting}
                    className="h-11 w-full rounded-xl border border-white/15 bg-slate-950/65 pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-2.5 text-slate-300 transition hover:text-white"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                  </button>
                </div>

                <div className="relative">
                  <FaKey className="pointer-events-none absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showOTP ? "text" : "password"}
                    name="otp"
                    value={otp}
                    onChange={handleInput}
                    placeholder="Enter OTP"
                    required
                    disabled={isSubmitting}
                    className="h-11 w-full rounded-xl border border-white/15 bg-slate-950/65 pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOTP((prev) => !prev)}
                    className="absolute right-3 top-2.5 text-slate-300 transition hover:text-white"
                    aria-label="Toggle OTP visibility"
                  >
                    {showOTP ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                  </button>
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isSendingOTP}
                    className="text-xs font-semibold text-amber-300 transition hover:text-amber-200 disabled:opacity-70"
                  >
                    {isSendingOTP ? "Sending OTP..." : "Resend OTP"}
                  </button>
                </div>
              </>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting || (step === 1 && isSendingOTP)}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-amber-400 text-sm font-black text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {step === 1
                ? isSendingOTP
                  ? "Sending OTP..."
                  : "Send OTP"
                : isSubmitting
                  ? "Registering..."
                  : "Register"}
            </button>

            {step === 2 ? (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                  className="text-xs font-medium text-slate-300 transition hover:text-white"
                >
                  Back to change email
                </button>
              </div>
            ) : null}

            <p className="pt-1 text-center text-sm text-slate-300">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-cyan-300 hover:text-cyan-200">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
};
