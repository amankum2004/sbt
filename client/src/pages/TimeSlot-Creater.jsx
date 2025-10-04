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

                    // Check for existing template
                    try {
                        const templateRes = await api.get(`/time/template/shop/${shopData._id}`);
                        if (templateRes.data) {
                            setExistingTemplate(templateRes.data);
                            // Pre-fill form with existing template data
                            setForm(prev => ({
                                ...prev,
                                workingDays: templateRes.data.workingDays || [],
                                startTime: templateRes.data.startTime || "08:00",
                                endTime: templateRes.data.endTime || "20:00",
                                slotInterval: templateRes.data.slotInterval || 30
                            }));
                        }
                    } catch (error) {
                        // No existing template found - this is fine for new shops
                        console.log("No existing template found");
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
            if (existingTemplate) {
                // Update existing template
                await api.put(`/time/template/${existingTemplate._id}`, form);
                setMessage("Time template updated successfully!");
                setMessageType("success");
                Swal.fire({ title: "Success", text: "Template updated successfully", icon: "success" });
            } else {
                // Create new template
                await api.post("time/template/create", form);
                setMessage("Time template created successfully!");
                setMessageType("success");
                Swal.fire({ title: "Success", text: "Template created successfully", icon: "success" });
            }
            
            navigate('/barberprofile'); // Navigate to dashboard after success
        } catch (err) {
            console.error("Template operation failed:", err);
            const errorMessage = existingTemplate 
            ? "Error updating template. Please try again."
            : "Error creating template. Please check your inputs.";
            setMessage(errorMessage);
            setMessageType("error");
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setMessage(null), 5000);
        }
    };

    // Show loading state
    if (userLoading || isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="text-xl text-gray-700 flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <div className="text-red-500 text-6xl mb-4">🔒</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
                    <p className="text-gray-600 mb-6">Please log in to manage your time template.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition duration-200"
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
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
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
                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition duration-200"
                        >
                            Go to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4 mt-8">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {existingTemplate ? "Update Time Template" : "Create Time Template"}
                    </h1>
                    {existingTemplate && (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            Template Exists
                        </span>
                    )}
                </div>

                {message && (
                    <div className={`mb-4 p-3 rounded ${messageType === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Working Days */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Working Days</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {days.map((day) => (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => toggleDay(day)}
                                    className={`p-2 rounded border ${
                                        form.workingDays.includes(day)
                                            ? "bg-blue-500 text-white border-blue-500"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                    }`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Working Hours */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                            <input
                                type="time"
                                value={form.startTime}
                                onChange={(e) => setForm(prev => ({ ...prev, startTime: e.target.value }))}
                                className="w-full p-2 border border-gray-300 rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                            <input
                                type="time"
                                value={form.endTime}
                                onChange={(e) => setForm(prev => ({ ...prev, endTime: e.target.value }))}
                                className="w-full p-2 border border-gray-300 rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slot Interval (minutes)</label>
                            <select
                                value={form.slotInterval}
                                onChange={(e) => setForm(prev => ({ ...prev, slotInterval: parseInt(e.target.value) }))}
                                className="w-full p-2 border border-gray-300 rounded"
                                required
                            >
                                <option value={15}>15 minutes</option>
                                <option value={30}>30 minutes</option>
                                <option value={45}>45 minutes</option>
                                <option value={60}>60 minutes</option>
                            </select>
                        </div>
                    </div>

                    {/* Slot Calculation Display */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-medium text-blue-800 mb-2">Slot Information</h3>
                        <p className="text-blue-700">
                            {slotsPerDay} slots per day × {form.workingDays.length} days ={" "}
                            <strong>{totalSlots} total slots per week</strong>
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 px-4 rounded-lg font-medium transition duration-200"
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
//   const { user, loading: userLoading } = useLogin();

//   const [form, setForm] = useState({
//     shop_owner_id: "",
//     name: "",
//     email: "",
//     phone: "",
//     workingDays: [],
//     startTime: "08:00",
//     endTime: "20:00",
//     slotInterval: 30,
//   });

//   const [isLoading, setIsLoading] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [message, setMessage] = useState(null);
//   const [messageType, setMessageType] = useState("");
//   const [existingTemplate, setExistingTemplate] = useState(null);
//   const [shopStatus, setShopStatus] = useState(""); // 'pending', 'approved', 'rejected'

//   useEffect(() => {
//     const fetchShopAndTemplateData = async () => {
//       if (userLoading) return;

//       if (user) {
//         try {
//           // Fetch shop data
//           const shopRes = await api.get(`/shop/by-email/${user.email}`);
//           const shopData = shopRes.data;
//           // console.log('shop data:', shopData);

//           // Check if shop is approved
//           const isApproved = shopData?.isApproved || false;
//           setShopStatus(isApproved ? 'approved' : 'pending');
          
          
//           // If shop is not approved, stop here
//           if (!isApproved) {
//             setIsLoading(false);
//             return;
//           }

//           setForm((prev) => ({
//             ...prev,
//             shop_owner_id: shopData?._id || "",
//             name: user.name || "",
//             email: user.email || "",
//             phone: shopData?.phone || "",
//           }));

//           // Check for existing template
//           try {
//             const templateRes = await api.get(`/time/template/shop/${shopData._id}`);
//             if (templateRes.data) {
//               setExistingTemplate(templateRes.data);
//               // Pre-fill form with existing template data
//               setForm(prev => ({
//                 ...prev,
//                 workingDays: templateRes.data.workingDays || [],
//                 startTime: templateRes.data.startTime || "08:00",
//                 endTime: templateRes.data.endTime || "20:00",
//                 slotInterval: templateRes.data.slotInterval || 30
//               }));
//             }
//           } catch (error) {
//             // No existing template found - this is fine for new shops
//             console.log("No existing template found");
//           }

//         } catch (err) {
//           console.error("Error fetching shop data:", err);
//           setMessage("Failed to load shop details. Please try again.");
//           setMessageType("error");
//         } finally {
//           setIsLoading(false);
//         }
//       } else {
//         setIsLoading(false);
//         setMessage("Please log in to manage your time template.");
//         setMessageType("error");
//       }
//     };

//     fetchShopAndTemplateData();
//   }, [user, userLoading]);

//   // Add shop approval check at the top
//   if (shopStatus && shopStatus !== "approved") {
//     return (
//       <div className="flex justify-center items-center h-screen bg-gray-100">
//         <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
//           <div className="text-yellow-500 text-6xl mb-4">⏳</div>
//           <h2 className="text-2xl font-bold text-gray-800 mb-4">
//             {shopStatus === "pending" ? "Shop Under Review" : "Shop Not Approved"}
//           </h2>
//           <p className="text-gray-600 mb-6">
//             {shopStatus === "pending" 
//               ? "Your shop registration is under review. Please wait for approval to access this page."
//               : "Your shop registration was not approved. Please contact support for more information."}
//           </p>
//           <button
//             onClick={() => navigate('/')}
//             className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition duration-200"
//           >
//             Go to Home
//           </button>
//         </div>
//       </div>
//     );
//   }


//   const toggleDay = (day) => {
//     setForm((prev) => ({
//       ...prev,
//       workingDays: prev.workingDays.includes(day)
//         ? prev.workingDays.filter((d) => d !== day)
//         : [...prev.workingDays, day],
//     }));
//   };

//   const toMins = timeStr => {
//     const [h, m] = timeStr.split(":").map(Number);
//     return h * 60 + m;
//   };

//   const { slotsPerDay, totalSlots } = useMemo(() => {
//     const start = toMins(form.startTime);
//     const end = toMins(form.endTime);
//     const span = Math.max(0, end - start);
//     const count = Math.floor(span / form.slotInterval);
//     return {
//       slotsPerDay: count,
//       totalSlots: count * form.workingDays.length,
//     };
//   }, [form.startTime, form.endTime, form.slotInterval, form.workingDays]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.workingDays.length) {
//       Swal.fire({ title: "Error", text: "Please select at least one working day", icon: "error" });
//       return;
//     }

//     if (!form.shop_owner_id) {
//       setMessage("Cannot save template: Shop owner ID not found.");
//       setMessageType("error");
//       return;
//     }

//     setIsSubmitting(true);
//     setMessage(null);

//     try {
//       if (existingTemplate) {
//         // Update existing template
//         await api.put(`/time/template/${existingTemplate._id}`, form);
//         setMessage("Time template updated successfully!");
//         setMessageType("success");
//         Swal.fire({ title: "Success", text: "Template updated successfully", icon: "success" });
//       } else {
//         // Create new template
//         await api.post("time/template/create", form);
//         setMessage("Time template created successfully!");
//         setMessageType("success");
//         Swal.fire({ title: "Success", text: "Template created successfully", icon: "success" });
//       }
      
//       navigate('/dashboard'); // Navigate to dashboard after success
//     } catch (err) {
//       console.error("Template operation failed:", err);
//       const errorMessage = existingTemplate 
//       ? "Error updating template. Please try again."
//       : "Error creating template. Please check your inputs.";
//       setMessage(errorMessage);
//       setMessageType("error");
//     } finally {
//       setIsSubmitting(false);
//       setTimeout(() => setMessage(null), 5000);
//     }
//   };

//   // Show loading state
//   if (userLoading || isLoading) {
//     return (
//       <div className="flex justify-center items-center h-screen bg-gray-100">
//         <div className="text-xl text-gray-700 flex items-center">
//           <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//           </svg>
//           Loading your shop data...
//         </div>
//       </div>
//     );
//   }


//   // Check if user is not logged in
//   if (!user) {
//     return (
//       <div className="flex justify-center items-center h-screen bg-gray-100">
//         <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
//           <div className="text-red-500 text-6xl mb-4">🔒</div>
//           <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
//           <p className="text-gray-600 mb-6">Please log in to manage your time template.</p>
//           <button
//             onClick={() => navigate('/login')}
//             className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition duration-200"
//           >
//             Go to Login
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8 px-4">
//       <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
//         <div className="flex justify-between items-center mb-4 mt-8">
//           <h1 className="text-2xl font-bold text-gray-800">
//             {existingTemplate ? "Update Time Template" : "Create Time Template"}
//           </h1>
//           {existingTemplate && (
//             <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
//               Template Exists
//             </span>
//           )}
//         </div>

//         {message && (
//           <div className={`mb-4 p-3 rounded ${messageType === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
//             {message}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Working Days */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-3">Working Days</label>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
//               {days.map((day) => (
//                 <button
//                   key={day}
//                   type="button"
//                   onClick={() => toggleDay(day)}
//                   className={`p-2 rounded border ${
//                     form.workingDays.includes(day)
//                       ? "bg-blue-500 text-white border-blue-500"
//                       : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//                   }`}
//                 >
//                   {day}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Working Hours */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
//               <input
//                 type="time"
//                 value={form.startTime}
//                 onChange={(e) => setForm(prev => ({ ...prev, startTime: e.target.value }))}
//                 className="w-full p-2 border border-gray-300 rounded"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
//               <input
//                 type="time"
//                 value={form.endTime}
//                 onChange={(e) => setForm(prev => ({ ...prev, endTime: e.target.value }))}
//                 className="w-full p-2 border border-gray-300 rounded"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Slot Interval (minutes)</label>
//               <select
//                 value={form.slotInterval}
//                 onChange={(e) => setForm(prev => ({ ...prev, slotInterval: parseInt(e.target.value) }))}
//                 className="w-full p-2 border border-gray-300 rounded"
//                 required
//               >
//                 <option value={15}>15 minutes</option>
//                 <option value={30}>30 minutes</option>
//                 <option value={45}>45 minutes</option>
//                 <option value={60}>60 minutes</option>
//               </select>
//             </div>
//           </div>

//           {/* Slot Calculation Display */}
//           <div className="bg-blue-50 p-4 rounded-lg">
//             <h3 className="font-medium text-blue-800 mb-2">Slot Information</h3>
//             <p className="text-blue-700">
//               {slotsPerDay} slots per day × {form.workingDays.length} days ={" "}
//               <strong>{totalSlots} total slots per week</strong>
//             </p>
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 px-4 rounded-lg font-medium transition duration-200"
//           >
//             {isSubmitting 
//               ? "Processing..." 
//               : existingTemplate 
//                 ? "Update Template" 
//                 : "Create Template"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };





