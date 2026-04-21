import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash, FaLock, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { api } from "../utils/api";
import { useLogin } from "../components/LoginContext";
import { useLoading } from "../components/Loading";
import BackgroundIcons from "../components/BackgroundIcons";
import { isValidPhone, normalizePhone } from "../utils/phone";

const isValidEmail = (value = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showLoading, hideLoading } = useLoading();
  const { login } = useLogin();

  const initialPhone = location.state?.phone || localStorage.getItem("signupPhone") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    contactType: "phone",
    phone: initialPhone,
    email: "",
    password: "",
  });

  useEffect(() => {
    const jwtToken = localStorage.getItem("jwt_token");
    const userData = localStorage.getItem("user_data");

    if (jwtToken && userData) {
      const timer = setTimeout(() => {
        navigate("/", { replace: true });
      }, 120);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [navigate]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "phone" ? normalizePhone(value) : value,
    }));
  };

  const handleContactTypeChange = (contactType) => {
    setFormData((prev) => ({
      ...prev,
      contactType,
    }));
  };

  const validate = () => {
    if (formData.contactType === "phone") {
      if (!isValidPhone(formData.phone)) {
        Swal.fire({ title: "Error", text: "Enter a valid 10-digit mobile number", icon: "error" });
        return false;
      }
    } else if (!isValidEmail(formData.email)) {
      Swal.fire({ title: "Error", text: "Enter a valid email address", icon: "error" });
      return false;
    }

    if (!formData.password) {
      Swal.fire({ title: "Error", text: "Password is required", icon: "error" });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    showLoading("Verifying your details");

    try {
      const payload =
        formData.contactType === "email"
          ? {
              contactType: "email",
              email: formData.email.trim().toLowerCase(),
              password: formData.password,
            }
          : {
              contactType: "phone",
              phone: normalizePhone(formData.phone),
              password: formData.password,
            };

      const response = await api.post("/auth/login", payload, {
        allowSuccessFalse: true,
      });
      hideLoading();

      if (!response.data.success) {
        Swal.fire({
          title: "Error",
          text: response.data.error || "Login failed",
          icon: "error",
        });
        setIsSubmitting(false);
        return;
      }

      if (response.data.token) {
        localStorage.setItem("jwt_token", response.data.token);
      }

      if (response.data.user) {
        localStorage.setItem("user_data", JSON.stringify(response.data.user));
        await login(response.data.user);
      }

      Swal.fire({
        title: "Success",
        text: response.data.message || "Login successful!",
        icon: "success",
        timer: 1400,
        showConfirmButton: false,
      }).then(() => {
        navigate("/");
      });
    } catch (err) {
      hideLoading();

      const status = err.response?.status || err.status;
      const backendError =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.details?.message ||
        err.message;

      if (backendError && err.code !== "ERR_NETWORK") {
        Swal.fire({ title: "Error", text: backendError, icon: "error" });
      } else if (status === 404) {
        Swal.fire({ title: "Error", text: "User not found", icon: "error" });
      } else if (status === 401) {
        Swal.fire({ title: "Error", text: "Invalid credentials", icon: "error" });
      } else if (status === 400) {
        Swal.fire({ title: "Error", text: "Validation error", icon: "error" });
      } else {
        Swal.fire({
          title: "Error",
          text: "Unable to reach the server. Please try again.",
          icon: "error",
        });
      }

      setIsSubmitting(false);
    }
  };

  const isPhoneMode = formData.contactType === "phone";

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-cyan-950 px-4 py-10">
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-36 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
      <BackgroundIcons count={10} />

      <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-md items-center">
        <div className="w-full rounded-3xl border border-white/15 bg-slate-900/75 p-7 shadow-[0_20px_60px_-24px_rgba(8,47,73,0.9)] backdrop-blur md:p-8">
          <div className="mb-5 text-center">
            <img src="/images/salonHub-logo.svg" alt="SalonHub" className="mx-auto h-16 w-16 rounded-full bg-white p-1" />
            <h1 className="mt-4 bg-gradient-to-r from-cyan-200 via-amber-200 to-orange-200 bg-clip-text text-3xl font-black text-transparent">
              Welcome Back
            </h1>
            <p className="mt-1 text-sm text-slate-300">Login with your registered phone number or email</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-slate-950/50 p-1">
              <button
                type="button"
                onClick={() => handleContactTypeChange("phone")}
                className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  isPhoneMode
                    ? "bg-gradient-to-r from-cyan-300 via-teal-300 to-amber-300 text-slate-950 shadow-[0_10px_30px_-12px_rgba(45,212,191,0.9)] ring-2 ring-white/20"
                    : "bg-slate-900/70 text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                Phone
              </button>
              <button
                type="button"
                onClick={() => handleContactTypeChange("email")}
                className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  !isPhoneMode
                    ? "bg-gradient-to-r from-cyan-300 via-teal-300 to-amber-300 text-slate-950 shadow-[0_10px_30px_-12px_rgba(45,212,191,0.9)] ring-2 ring-white/20"
                    : "bg-slate-900/70 text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                Email
              </button>
            </div>

            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                {isPhoneMode ? <FaPhoneAlt /> : <FaEnvelope />}
              </span>
              <input
                type={isPhoneMode ? "tel" : "email"}
                name={isPhoneMode ? "phone" : "email"}
                value={isPhoneMode ? formData.phone : formData.email}
                onChange={handleInput}
                disabled={isSubmitting}
                placeholder={isPhoneMode ? "10-digit mobile number" : "you@example.com"}
                className="h-11 w-full rounded-xl border border-white/15 bg-slate-950/65 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                autoComplete="off"
                required
              />
            </div>

            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <FaLock />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInput}
                disabled={isSubmitting}
                placeholder="Password"
                className="h-11 w-full rounded-xl border border-white/15 bg-slate-950/65 pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                autoComplete="off"
                required
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

            <Link to="/updatePassword" className="block text-right text-sm font-medium text-amber-300 hover:text-amber-200">
              Forgot password?
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-amber-400 text-sm font-black text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Logging In..." : "Login"}
            </button>

            <div className="pt-1 text-center text-sm text-slate-300">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-semibold text-cyan-300 hover:text-cyan-200">
                Register
              </Link>
            </div>

            <p className="text-center text-xs text-slate-400">
              Use the phone number or email you registered with
            </p>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Login;
