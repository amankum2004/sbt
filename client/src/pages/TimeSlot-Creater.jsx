import React, { useState, useEffect, useMemo } from "react";
import { api } from "../utils/api";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useLogin } from "../components/LoginContext";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const TemplateForm = () => {
    const navigate = useNavigate();
    const { user, loading: userLoading } = useLogin();

    const [form, setForm] = useState({
        shop_owner_id: "",
        name: "",
        email: "",
        phone: "",
        workingDays: [],
        startTime: "08:00",
        endTime: "20:00",
        slotInterval: 30,
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState("");
    const [existingTemplate, setExistingTemplate] = useState(null);
    const [shopStatus, setShopStatus] = useState(""); // 'none', 'pending', 'approved', 'rejected'
    const [shopData, setShopData] = useState(null);

    // Move useMemo hooks to the top level - they must be called unconditionally
    const toMins = (timeStr) => {
        const [h, m] = timeStr.split(":").map(Number);
        return h * 60 + m;
    };

    const { slotsPerDay, totalSlots } = useMemo(() => {
        const start = toMins(form.startTime);
        const end = toMins(form.endTime);
        const span = Math.max(0, end - start);
        const count = Math.floor(span / form.slotInterval);
        return {
            slotsPerDay: count,
            totalSlots: count * form.workingDays.length,
        };
    }, [form.startTime, form.endTime, form.slotInterval, form.workingDays]);

    useEffect(() => {
        const fetchShopAndTemplateData = async () => {
            if (userLoading) return;

            if (user) {
                try {
                    // Fetch shop data
                    const shopRes = await api.get(`/shop/by-email/${user.email}`);
                    const shopData = shopRes.data;
                    console.log('Shop data:', shopData);
                    
                    setShopData(shopData);

                    // Check if shop exists and is approved
                    if (!shopData) {
                        setShopStatus("none"); // No shop registered
                        setIsLoading(false);
                        return;
                    }

                    const isApproved = shopData?.isApproved || false;
                    setShopStatus(isApproved ? 'approved' : 'pending');
                    
                    // If shop is not approved, stop here
                    if (!isApproved) {
                        setIsLoading(false);
                        return;
                    }

                    setForm((prev) => ({
                        ...prev,
                        shop_owner_id: shopData?._id || "",
                        name: user.name || "",
                        email: user.email || "",
                        phone: shopData?.phone || "",
                    }));

                    // Fetch template: "no template found" is a normal first-time state.
                    try {
                        const templateRes = await api.get(`/time/template/${shopData._id}`, {
                            allowSuccessFalse: true,
                        });
                        const payload = templateRes?.data;

                        if (!payload || payload.success === false || !payload.data) {
                            setExistingTemplate(null);
                        } else {
                            const template = payload.data;
                            const hasRealTemplate = !payload.isDefault && template?._id;

                            if (hasRealTemplate) {
                                setExistingTemplate(template);

                                // Pre-fill form with existing template data
                                setForm((prev) => ({
                                    ...prev,
                                    workingDays: template.workingDays || [],
                                    startTime: template.startTime || "08:00",
                                    endTime: template.endTime || "20:00",
                                    slotInterval: template.slotInterval || 30,
                                }));
                            } else {
                                setExistingTemplate(null);
                            }
                        }
                    } catch (error) {
                        // Only unexpected/network errors should land here.
                        console.error("Error while fetching template:", error);
                        setExistingTemplate(null);
                    }

                } catch (err) {
                    console.error("Error fetching shop data:", err);
                    // If shop doesn't exist, set status to "none"
                    if (err.response?.status === 404) {
                        setShopStatus("none");
                    } else {
                        setMessage("Failed to load shop details. Please try again.");
                        setMessageType("error");
                    }
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
                setMessage("Please log in to manage your time template.");
                setMessageType("error");
            }
        };

        fetchShopAndTemplateData();
    }, [user, userLoading]);

    const toggleDay = (day) => {
        setForm((prev) => ({
            ...prev,
            workingDays: prev.workingDays.includes(day)
                ? prev.workingDays.filter((d) => d !== day)
                : [...prev.workingDays, day],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.workingDays.length) {
            Swal.fire({ title: "Error", text: "Please select at least one working day", icon: "error" });
            return;
        }

        if (!form.shop_owner_id) {
            setMessage("Cannot save template: Shop owner ID not found.");
            setMessageType("error");
            return;
        }

        setIsSubmitting(true);
        setMessage(null);

        try {
            let response;
            if (existingTemplate) {
                // Update existing template
                response = await api.put(`/time/template/${existingTemplate._id}`, form);
                // console.log('Update response:', response);

                // More flexible success checking
                const isSuccess = response.data?.success || 
                             (response.data && !response.data.error) || 
                             response.status === 200;
            
                if (isSuccess) {
                    setMessage("Time template updated successfully! Time slots are being regenerated.");
                    setMessageType("success");
                    Swal.fire({ 
                        title: "Success", 
                        text: "Template updated successfully and time slots are being regenerated", 
                        icon: "success" 
                    }).then(() => {
                        navigate('/barberprofile');
                    });
                    return; // Important: return here to prevent further execution
                } else {
                    throw new Error(response.data?.message || response.data?.error || "Update failed on server");
                }
            } else {
                // Create new template
                response = await api.post("time/template/create", form);
                // console.log('Create response:', response.data);

                // More flexible success checking for creation
                const isSuccess = response.data?.success || 
                             (response.data && !response.data.error) || 
                             response.status === 201;
            
                if (isSuccess) {
                    setMessage("Time template created successfully!");
                    setMessageType("success");
                    Swal.fire({ 
                        title: "Success", 
                        text: "Template created successfully", 
                        icon: "success" 
                    }).then(() => {
                        navigate('/barberprofile');
                    });
                    return; // Important: return here to prevent further execution
                } else {
                    throw new Error(response.data?.message || response.data?.error || "Creation failed on server");
                }
            }   
        } catch (err) {
            console.error("❌ Template operation failed:", err);
        
            // More detailed error handling
            let errorMessage = "An unexpected error occurred";
            
            if (err.response) {
                // Server responded with error status
                console.error('Server error response:', err.response);
                errorMessage = err.response.data?.message || 
                            err.response.data?.error || 
                            `Server error: ${err.response.status}`;
            } else if (err.request) {
                // Request was made but no response received
                console.error('No response received:', err.request);
                errorMessage = "No response from server. Please check your connection.";
            } else {
                // Something else happened
                console.error('Request configuration error:', err.message);
                errorMessage = err.message || "Request configuration error";
            }
            
            setMessage(errorMessage);
            setMessageType("error");
            
            Swal.fire({ 
                title: "Error", 
                text: errorMessage, 
                icon: "error" 
            });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setMessage(null), 5000);
        }
    };

    // Show loading state
    if (userLoading || isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50">
                <div className="text-xl text-gray-700 flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-cyan-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading your shop data...
                </div>
            </div>
        );
    }

    // Check if user is not logged in
    if (!user) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50">
                <div className="rounded-2xl border border-white/80 bg-white/90 p-8 shadow-[0_16px_35px_-20px_rgba(15,23,42,0.45)] max-w-md w-full text-center">
                    <div className="text-red-500 text-6xl mb-4">🔒</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
                    <p className="text-gray-600 mb-6">Please log in to manage your time template.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="rounded-lg bg-gradient-to-r from-cyan-500 to-amber-400 px-6 py-2 font-semibold text-slate-950 transition hover:brightness-110"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    // Show shop status message if not approved or no shop exists
    if (shopStatus && shopStatus !== "approved") {
        let title, message, icon;
        
        switch (shopStatus) {
            case "none":
                title = "Shop Not Registered";
                message = "You need to register your shop first before setting up time templates.";
                icon = "🏪";
                break;
            case "pending":
                title = "Shop Under Review";
                message = "Your shop registration is under review. Please wait for approval to access this page.";
                icon = "⏳";
                break;
            case "rejected":
                title = "Shop Not Approved";
                message = "Your shop registration was not approved. Please contact support for more information.";
                icon = "❌";
                break;
            default:
                title = "Shop Status Unknown";
                message = "Unable to determine your shop status. Please contact support.";
                icon = "❓";
        }

        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50">
                <div className="rounded-2xl border border-white/80 bg-white/90 p-8 shadow-[0_16px_35px_-20px_rgba(15,23,42,0.45)] max-w-md w-full text-center">
                    <div className="text-6xl mb-4">{icon}</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
                    <p className="text-gray-600 mb-6">{message}</p>
                    <div className="flex flex-col space-y-3">
                        {shopStatus === "none" && (
                            <button
                                onClick={() => navigate('/registershop')}
                                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition duration-200"
                            >
                                Register Your Shop
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/')}
                            className="rounded-lg bg-gradient-to-r from-cyan-500 to-amber-400 px-6 py-2 font-semibold text-slate-950 transition hover:brightness-110"
                        >
                            Go to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50 py-4 px-3 sm:px-4">
            <div className="max-w-2xl mx-auto rounded-3xl border border-white/80 bg-white/90 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.45)] p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 mt-4 sm:mt-8 space-y-2 sm:space-y-0">
                    <p className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200 sm:hidden">
                        Schedule Setup
                    </p>
                    <h1 className="text-xl mt-3 sm:text-2xl font-bold text-gray-800 text-center sm:text-left">
                        {existingTemplate ? "Update Time Template" : "Create Time Template"}
                    </h1>
                    {existingTemplate && (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-center">
                            Template Exists
                        </span>
                    )}
                </div>

                {message && (
                    <div className={`mb-4 p-3 rounded text-sm ${messageType === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    {/* Working Days */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">Working Days</label>
                        <div className="space-y-2">
                            {/* First Row - 4 days */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {days.slice(0, 4).map((day) => (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => toggleDay(day)}
                                        className={`p-2 sm:p-3 rounded border text-xs sm:text-sm font-medium transition-colors ${
                                            form.workingDays.includes(day)
                                                ? "bg-cyan-600 text-white border-cyan-600"
                                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                        }`}
                                    >
                                        {day.substring(0, 3)}
                                    </button>
                                ))}
                            </div>
                            {/* Second Row - 3 days */}
                            <div className="grid grid-cols-3 gap-2">
                                {days.slice(4).map((day) => (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => toggleDay(day)}
                                        className={`p-2 sm:p-3 rounded border text-xs sm:text-sm font-medium transition-colors ${
                                            form.workingDays.includes(day)
                                                ? "bg-cyan-600 text-white border-cyan-600"
                                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                        }`}
                                    >
                                        {day.substring(0, 3)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Working Hours */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                            <input
                                type="time"
                                value={form.startTime}
                                onChange={(e) => setForm(prev => ({ ...prev, startTime: e.target.value }))}
                                className="w-full p-2 sm:p-2 border border-gray-300 rounded text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                            <input
                                type="time"
                                value={form.endTime}
                                onChange={(e) => setForm(prev => ({ ...prev, endTime: e.target.value }))}
                                className="w-full p-2 sm:p-2 border border-gray-300 rounded text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slot Interval</label>
                            <select
                                value={form.slotInterval}
                                onChange={(e) => setForm(prev => ({ ...prev, slotInterval: parseInt(e.target.value) }))}
                                className="w-full p-2 sm:p-2 border border-gray-300 rounded text-sm"
                                required
                            >   
                                <option value={5}>5 minutes</option>
                                <option value={10}>10 minutes</option>
                                <option value={15}>15 minutes</option>
                                <option value={20}>20 minutes</option>
                                <option value={30}>30 minutes</option>
                                <option value={40}>40 minutes</option>
                                <option value={50}>50 minutes</option>
                                <option value={60}>60 minutes</option>
                            </select>
                        </div>
                    </div>

                    {/* Slot Calculation Display */}
                    <div className="bg-cyan-50 p-3 sm:p-4 rounded-lg">
                        <h3 className="font-medium text-cyan-800 mb-1 sm:mb-2 text-sm sm:text-base">Slot Information</h3>
                        <p className="text-cyan-700 text-sm sm:text-base">
                            {slotsPerDay} slots per day × {form.workingDays.length} days ={" "}
                            <strong>{totalSlots} slots per week</strong>
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-amber-400 py-3 px-4 text-sm font-black text-slate-950 transition duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:bg-slate-300 sm:text-base"
                    >
                        {isSubmitting 
                            ? "Processing..." 
                            : existingTemplate 
                                ? "Update Template" 
                                : "Create Template"}
                    </button>
                </form>
            </div>
        </div>
    );
};





// import React, { useState, useEffect, useMemo } from "react";
// import { api } from "../utils/api";
// import { useNavigate } from "react-router-dom";
// import Swal from "sweetalert2";
// import { useLogin } from "../components/LoginContext";

// const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// export const TemplateForm = () => {
//     const navigate = useNavigate();
//     const { user, loading: userLoading } = useLogin();

//     const [form, setForm] = useState({
//         shop_owner_id: "",
//         name: "",
//         email: "",
//         phone: "",
//         workingDays: [],
//         startTime: "08:00",
//         endTime: "20:00",
//         slotInterval: 30,
//     });

//     const [isLoading, setIsLoading] = useState(true);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [message, setMessage] = useState(null);
//     const [messageType, setMessageType] = useState("");
//     const [existingTemplate, setExistingTemplate] = useState(null);
//     const [shopStatus, setShopStatus] = useState(""); // 'none', 'pending', 'approved', 'rejected'
//     const [shopData, setShopData] = useState(null);

//     // Move useMemo hooks to the top level - they must be called unconditionally
//     const toMins = (timeStr) => {
//         const [h, m] = timeStr.split(":").map(Number);
//         return h * 60 + m;
//     };

//     const { slotsPerDay, totalSlots } = useMemo(() => {
//         const start = toMins(form.startTime);
//         const end = toMins(form.endTime);
//         const span = Math.max(0, end - start);
//         const count = Math.floor(span / form.slotInterval);
//         return {
//             slotsPerDay: count,
//             totalSlots: count * form.workingDays.length,
//         };
//     }, [form.startTime, form.endTime, form.slotInterval, form.workingDays]);

//     useEffect(() => {
//         const fetchShopAndTemplateData = async () => {
//             if (userLoading) return;

//             if (user) {
//                 try {
//                     // Fetch shop data
//                     const shopRes = await api.get(`/shop/by-email/${user.email}`);
//                     const shopData = shopRes.data;
//                     console.log('Shop data:', shopData);
                    
//                     setShopData(shopData);

//                     // Check if shop exists and is approved
//                     if (!shopData) {
//                         setShopStatus("none"); // No shop registered
//                         setIsLoading(false);
//                         return;
//                     }

//                     const isApproved = shopData?.isApproved || false;
//                     setShopStatus(isApproved ? 'approved' : 'pending');
                    
//                     // If shop is not approved, stop here
//                     if (!isApproved) {
//                         setIsLoading(false);
//                         return;
//                     }

//                     setForm((prev) => ({
//                         ...prev,
//                         shop_owner_id: shopData?._id || "",
//                         name: user.name || "",
//                         email: user.email || "",
//                         phone: shopData?.phone || "",
//                     }));

//                     // Check for existing template - FIXED THIS PART
//                     try {
//                         const templateRes = await api.get(`/time/timeslots/${shopData._id}`);
//                         // console.log('Template response:', templateRes);
                        
//                         // Check if template exists (not empty array and has data)
//                         if (templateRes.data && 
//                             Array.isArray(templateRes.data) && 
//                             templateRes.data.length > 0) {
                            
//                             // Get the first template (assuming one template per shop)
//                             const template = templateRes.data[0];
//                             setExistingTemplate(template);
                            
//                             // Pre-fill form with existing template data
//                             setForm(prev => ({
//                                 ...prev,
//                                 workingDays: template.workingDays || [],
//                                 startTime: template.startTime || "08:00",
//                                 endTime: template.endTime || "20:00",
//                                 slotInterval: template.slotInterval || 30
//                             }));
//                         } else {
//                             // No template exists - reset existing template state
//                             setExistingTemplate(null);
//                             console.log("No existing template found - empty array returned");
//                         }
//                     } catch (error) {
//                         // No existing template found or other error
//                         console.log("No existing template found or error:", error);
//                         setExistingTemplate(null);
//                     }

//                 } catch (err) {
//                     console.error("Error fetching shop data:", err);
//                     // If shop doesn't exist, set status to "none"
//                     if (err.response?.status === 404) {
//                         setShopStatus("none");
//                     } else {
//                         setMessage("Failed to load shop details. Please try again.");
//                         setMessageType("error");
//                     }
//                 } finally {
//                     setIsLoading(false);
//                 }
//             } else {
//                 setIsLoading(false);
//                 setMessage("Please log in to manage your time template.");
//                 setMessageType("error");
//             }
//         };

//         fetchShopAndTemplateData();
//     }, [user, userLoading]);

//     const toggleDay = (day) => {
//         setForm((prev) => ({
//             ...prev,
//             workingDays: prev.workingDays.includes(day)
//                 ? prev.workingDays.filter((d) => d !== day)
//                 : [...prev.workingDays, day],
//         }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!form.workingDays.length) {
//             Swal.fire({ title: "Error", text: "Please select at least one working day", icon: "error" });
//             return;
//         }

//         if (!form.shop_owner_id) {
//             setMessage("Cannot save template: Shop owner ID not found.");
//             setMessageType("error");
//             return;
//         }

//         setIsSubmitting(true);
//         setMessage(null);

//         try {
//             if (existingTemplate) {
//                 // Update existing template
//                 await api.put(`/time/template/${existingTemplate._id}`, form);
//                 setMessage("Time template updated successfully!");
//                 setMessageType("success");
//                 Swal.fire({ title: "Success", text: "Template updated successfully", icon: "success" });
//             } else {
//                 // Create new template
//                 await api.post("time/template/create", form);
//                 setMessage("Time template created successfully!");
//                 setMessageType("success");
//                 Swal.fire({ title: "Success", text: "Template created successfully", icon: "success" });
//             }
            
//             navigate('/barberprofile'); // Navigate to dashboard after success
//         } catch (err) {
//             console.error("Template operation failed:", err);
//             const errorMessage = existingTemplate 
//             ? "Error updating template. Please try again."
//             : "Error creating template. Please check your inputs.";
//             setMessage(errorMessage);
//             setMessageType("error");
//         } finally {
//             setIsSubmitting(false);
//             setTimeout(() => setMessage(null), 5000);
//         }
//     };

//     // Show loading state
//     if (userLoading || isLoading) {
//         return (
//             <div className="flex justify-center items-center h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50">
//                 <div className="text-xl text-gray-700 flex items-center">
//                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Loading your shop data...
//                 </div>
//             </div>
//         );
//     }

//     // Check if user is not logged in
//     if (!user) {
//         return (
//             <div className="flex justify-center items-center h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50">
//                 <div className="rounded-2xl border border-white/80 bg-white/90 p-8 shadow-[0_16px_35px_-20px_rgba(15,23,42,0.45)] max-w-md w-full text-center">
//                     <div className="text-red-500 text-6xl mb-4">🔒</div>
//                     <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
//                     <p className="text-gray-600 mb-6">Please log in to manage your time template.</p>
//                     <button
//                         onClick={() => navigate('/login')}
//                         className="bg-gradient-to-r from-cyan-500 to-amber-400 hover:brightness-110 text-white px-6 py-2 rounded-lg transition duration-200"
//                     >
//                         Go to Login
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     // Show shop status message if not approved or no shop exists
//     if (shopStatus && shopStatus !== "approved") {
//         let title, message, icon;
        
//         switch (shopStatus) {
//             case "none":
//                 title = "Shop Not Registered";
//                 message = "You need to register your shop first before setting up time templates.";
//                 icon = "🏪";
//                 break;
//             case "pending":
//                 title = "Shop Under Review";
//                 message = "Your shop registration is under review. Please wait for approval to access this page.";
//                 icon = "⏳";
//                 break;
//             case "rejected":
//                 title = "Shop Not Approved";
//                 message = "Your shop registration was not approved. Please contact support for more information.";
//                 icon = "❌";
//                 break;
//             default:
//                 title = "Shop Status Unknown";
//                 message = "Unable to determine your shop status. Please contact support.";
//                 icon = "❓";
//         }

//         return (
//             <div className="flex justify-center items-center h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50">
//                 <div className="rounded-2xl border border-white/80 bg-white/90 p-8 shadow-[0_16px_35px_-20px_rgba(15,23,42,0.45)] max-w-md w-full text-center">
//                     <div className="text-6xl mb-4">{icon}</div>
//                     <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
//                     <p className="text-gray-600 mb-6">{message}</p>
//                     <div className="flex flex-col space-y-3">
//                         {shopStatus === "none" && (
//                             <button
//                                 onClick={() => navigate('/registershop')}
//                                 className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition duration-200"
//                             >
//                                 Register Your Shop
//                             </button>
//                         )}
//                         <button
//                             onClick={() => navigate('/')}
//                             className="bg-gradient-to-r from-cyan-500 to-amber-400 hover:brightness-110 text-white px-6 py-2 rounded-lg transition duration-200"
//                         >
//                             Go to Home
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50 py-8 px-4">
//             <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
//                 <div className="flex justify-between items-center mb-4 mt-8">
//                     <h1 className="text-2xl font-bold text-gray-800">
//                         {existingTemplate ? "Update Time Template" : "Create Time Template"}
//                     </h1>
//                     {existingTemplate && (
//                         <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
//                             Template Exists
//                         </span>
//                     )}
//                 </div>

//                 {message && (
//                     <div className={`mb-4 p-3 rounded ${messageType === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
//                         {message}
//                     </div>
//                 )}

//                 <form onSubmit={handleSubmit} className="space-y-6">
//                     {/* Working Days */}
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-3">Working Days</label>
//                         <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
//                             {days.map((day) => (
//                                 <button
//                                     key={day}
//                                     type="button"
//                                     onClick={() => toggleDay(day)}
//                                     className={`p-2 rounded border ${
//                                         form.workingDays.includes(day)
//                                             ? "bg-cyan-600 text-white border-cyan-600"
//                                             : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//                                     }`}
//                                 >
//                                     {day}
//                                 </button>
//                             ))}
//                         </div>
//                     </div>

//                     {/* Working Hours */}
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
//                             <input
//                                 type="time"
//                                 value={form.startTime}
//                                 onChange={(e) => setForm(prev => ({ ...prev, startTime: e.target.value }))}
//                                 className="w-full p-2 border border-gray-300 rounded"
//                                 required
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
//                             <input
//                                 type="time"
//                                 value={form.endTime}
//                                 onChange={(e) => setForm(prev => ({ ...prev, endTime: e.target.value }))}
//                                 className="w-full p-2 border border-gray-300 rounded"
//                                 required
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Slot Interval (minutes)</label>
//                             <select
//                                 value={form.slotInterval}
//                                 onChange={(e) => setForm(prev => ({ ...prev, slotInterval: parseInt(e.target.value) }))}
//                                 className="w-full p-2 border border-gray-300 rounded"
//                                 required
//                             >
//                                 <option value={15}>15 minutes</option>
//                                 <option value={30}>30 minutes</option>
//                                 <option value={45}>45 minutes</option>
//                                 <option value={60}>60 minutes</option>
//                             </select>
//                         </div>
//                     </div>

//                     {/* Slot Calculation Display */}
//                     <div className="bg-cyan-50 p-4 rounded-lg">
//                         <h3 className="font-medium text-cyan-800 mb-2">Slot Information</h3>
//                         <p className="text-cyan-700">
//                             {slotsPerDay} slots per day × {form.workingDays.length} days ={" "}
//                             <strong>{totalSlots} total slots per week</strong>
//                         </p>
//                     </div>

//                     {/* Submit Button */}
//                     <button
//                         type="submit"
//                         disabled={isSubmitting}
//                         className="w-full bg-gradient-to-r from-cyan-500 to-amber-400 hover:brightness-110 disabled:bg-slate-300 text-white py-3 px-4 rounded-lg font-medium transition duration-200"
//                     >
//                         {isSubmitting 
//                             ? "Processing..." 
//                             : existingTemplate 
//                                 ? "Update Template" 
//                                 : "Create Template"}
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// };









