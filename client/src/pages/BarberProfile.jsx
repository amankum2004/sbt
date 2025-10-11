import React, { useState, useEffect } from 'react';
import { useLogin } from '../components/LoginContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaStore, FaEdit, FaPlus, FaUser, FaCalendarAlt, FaChartBar, FaUserEdit, FaPhoneAlt } from 'react-icons/fa';
import { MdCancel } from 'react-icons/md';
import { FiSave } from 'react-icons/fi';
import { api } from '../utils/api';
import Swal from 'sweetalert2';
import ShopStatusButton from '../components/ShopStatusButton'; // Add this import

export const BarberProfile = () => {
  const { user, shop, shopExists, logout, refreshShopData, checkShopExists, setUser } = useLogin();
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editableProfile, setEditableProfile] = useState({ name: '', phone: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user && user.usertype === 'shopOwner' && !shop) {
      manuallyCheckShop();
    }

    setDebugInfo({
      userType: user?.usertype,
      userEmail: user?.email,
      shopExists,
      shopData: shop
    });

    // Initialize editable profile
    if (user) {
      setEditableProfile({ name: user.name, phone: user.phone || '' });
    }
  }, [user, shop, shopExists, navigate]);

  const manuallyCheckShop = async () => {
    try {
      setLoading(true);
      await checkShopExists(user.email);
      setLoading(false);
    } catch (error) {
      console.error("Manual shop check failed:", error);
      setLoading(false);
    }
  };

  const handleShopAction = () => {
    if (shopExists && shop) {
      navigate('/barber-profile-update'); // optional shop edit page
    } else {
      navigate('/registershop');
    }
  };

  const toggleEdit = () => setIsEditing(!isEditing);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableProfile({ ...editableProfile, [name]: value });
  };

  const handleSaveProfile = async () => {
    try {
      const response = await api.put(`/user/update-profile/${user.userId}`, {
        name: editableProfile.name,
        phone: editableProfile.phone,
      });
      if (response.status === 200) {
        Swal.fire({ title: 'Success', text: 'Profile updated successfully!', icon: 'success' });
        setUser({ ...user, name: editableProfile.name, phone: editableProfile.phone });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Profile update failed. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-700 text-xl">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 mt-10 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FaUser className="text-blue-500 text-2xl mr-3" />
              <h2 className="text-xl font-semibold text-gray-800">User Information</h2>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveProfile}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded transition duration-300 flex items-center gap-1"
                  >
                    <FiSave /> Save
                  </button>
                  <button
                    onClick={toggleEdit}
                    className="bg-gray-500 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded transition duration-300 flex items-center gap-1"
                  >
                    <MdCancel /> Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={toggleEdit}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded transition duration-300 flex items-center gap-1"
                >
                  <FaEdit /> Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-1">Name</p>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editableProfile.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded border border-blue-400 focus:outline-none focus:ring focus:ring-blue-300"
                />
              ) : (
                <p className="text-gray-800 font-medium truncate" title={user.name}>{user.name}</p>
              )}
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-1">Email</p>
              <p className="text-gray-800 font-medium truncate" title={user.email}>{user.email}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-1">Phone</p>
              {isEditing ? (
                <input
                  type="text"
                  name="phone"
                  value={editableProfile.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded border border-blue-400 focus:outline-none focus:ring focus:ring-blue-300"
                />
              ) : (
                <p className="text-gray-800 font-medium truncate" title={user.phone || 'Not provided'}>
                  {user.phone || 'Not provided'}
                </p>
              )}
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-1">User Type</p>
              <p className="text-gray-800 font-medium capitalize">{user.usertype}</p>
            </div>
          </div>
        </div>

        {/* Shop Management Section */}
        {user.usertype === 'shopOwner' && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center">
                <FaStore className="text-green-500 text-2xl mr-3" />
                <h2 className="text-xl font-semibold text-gray-800">Shop Management</h2>
              </div>
              {loading && (
                <div className="text-yellow-500 text-sm">Loading shop data...</div>
              )}
              <button 
                onClick={manuallyCheckShop}
                className="text-blue-500 text-sm hover:text-blue-600"
              >
                Refresh Shop Data
              </button>
            </div>

            {shopExists && shop ? (
              <div>
                {/* Add Shop Status Button */}
                <div className="mb-6">
                  <ShopStatusButton 
                    shopId={shop._id} 
                    currentStatus={shop.status || 'closed'} 
                  />
                </div>

                <div className="bg-gray-100 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Shop Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 text-sm">Shop Name</p>
                      <p className="text-gray-800 font-medium">{shop.shopname}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Status</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${shop.isApproved ? 'bg-green-600 text-white' : 'bg-yellow-500 text-white'}`}>
                        {shop.isApproved ? 'Approved' : 'Pending Approval'}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Location</p>
                      <p className="text-gray-800 font-medium">{shop.city}, {shop.state}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Services</p>
                      <p className="text-gray-800 font-medium">{shop.services?.length || 0} services</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <button
                    onClick={handleShopAction}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg flex items-center justify-center transition duration-300"
                  >
                    <FaEdit className="mr-2" />
                    Edit Shop Details
                  </button>
                  
                  <Link
                    to="/barberDashboard"
                    className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg flex items-center justify-center transition duration-300"
                  >
                    <FaChartBar className="mr-2" />
                    Shop Dashboard
                  </Link>
                  
                  <Link
                    to="/customerDashboard"
                    className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg flex items-center justify-center transition duration-300"
                  >
                    <FaCalendarAlt className="mr-2" />
                    My Appointments
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FaStore className="text-gray-400 text-6xl mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Shop Registered</h3>
                <p className="text-gray-500 mb-6">
                  You haven't registered a shop yet. Register your shop to start accepting appointments.
                </p>
                <button
                  onClick={handleShopAction}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg flex items-center mx-auto transition duration-300"
                >
                  <FaPlus className="mr-2" />
                  Register Your Shop
                </button>
              </div>
            )}
          </div>
        )}

        {/* Customer Dashboard for non-shopOwner */}
        {user.usertype !== 'shopOwner' && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="text-center py-8">
              <FaUser className="text-gray-400 text-6xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Customer Dashboard</h3>
              <p className="text-gray-500 mb-6">
                Welcome to your customer dashboard. Explore salons and book appointments.
              </p>
              <Link
                to="/salons"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg inline-flex items-center transition duration-300"
              >
                <FaStore className="mr-2" />
                Find Salons
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};







// import React, { useState, useEffect } from 'react';
// import { useLogin } from '../components/LoginContext';
// import { Link, useNavigate } from 'react-router-dom';
// import { FaStore, FaEdit, FaPlus, FaUser, FaCalendarAlt, FaChartBar, FaUserEdit, FaPhoneAlt } from 'react-icons/fa';
// import { MdCancel } from 'react-icons/md';
// import { FiSave } from 'react-icons/fi';
// import { api } from '../utils/api';
// import Swal from 'sweetalert2';

// export const BarberProfile = () => {
//   const { user, shop, shopExists, logout, refreshShopData, checkShopExists, setUser } = useLogin();
//   const [loading, setLoading] = useState(false);
//   const [debugInfo, setDebugInfo] = useState({});
//   const [isEditing, setIsEditing] = useState(false);
//   const [editableProfile, setEditableProfile] = useState({ name: '', phone: '' });
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!user) {
//       navigate('/login');
//       return;
//     }

//     if (user && user.usertype === 'shopOwner' && !shop) {
//       manuallyCheckShop();
//     }

//     setDebugInfo({
//       userType: user?.usertype,
//       userEmail: user?.email,
//       shopExists,
//       shopData: shop
//     });

//     // Initialize editable profile
//     if (user) {
//       setEditableProfile({ name: user.name, phone: user.phone || '' });
//     }
//   }, [user, shop, shopExists, navigate]);

//   const manuallyCheckShop = async () => {
//     try {
//       setLoading(true);
//       await checkShopExists(user.email);
//       setLoading(false);
//     } catch (error) {
//       console.error("Manual shop check failed:", error);
//       setLoading(false);
//     }
//   };

//   const handleShopAction = () => {
//     if (shopExists && shop) {
//       navigate('/barber-profile-update'); // optional shop edit page
//     } else {
//       navigate('/registershop');
//     }
//   };

//   const toggleEdit = () => setIsEditing(!isEditing);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setEditableProfile({ ...editableProfile, [name]: value });
//   };

//   const handleSaveProfile = async () => {
//     try {
//       const response = await api.put(`/user/update-profile/${user.userId}`, {
//         name: editableProfile.name,
//         phone: editableProfile.phone,
//       });
//       if (response.status === 200) {
//         // alert('Profile updated successfully!');
//         Swal.fire({ title: 'Success', text: 'Profile updated successfully!', icon: 'success' });
//         setUser({ ...user, name: editableProfile.name, phone: editableProfile.phone });
//         setIsEditing(false);
//       }
//     } catch (error) {
//       console.error('Failed to update profile:', error);
//       alert('Profile update failed. Please try again.');
//     }
//   };

//   if (!user) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-gray-700 text-xl">Redirecting to login...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* User Info Card */}
//         <div className="bg-white rounded-lg shadow p-6 mb-6 mt-10 relative">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center">
//               <FaUser className="text-blue-500 text-2xl mr-3" />
//               <h2 className="text-xl font-semibold text-gray-800">User Information</h2>
//             </div>
//             <div className="flex gap-2">
//               {isEditing ? (
//                 <>
//                   <button
//                     onClick={handleSaveProfile}
//                     className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded transition duration-300 flex items-center gap-1"
//                   >
//                     <FiSave /> Save
//                   </button>
//                   <button
//                     onClick={toggleEdit}
//                     className="bg-gray-500 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded transition duration-300 flex items-center gap-1"
//                   >
//                     <MdCancel /> Cancel
//                   </button>
//                 </>
//               ) : (
//                 <button
//                   onClick={toggleEdit}
//                   className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded transition duration-300 flex items-center gap-1"
//                 >
//                   <FaEdit /> Edit Profile
//                 </button>
//               )}
//             </div>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
//             <div className="text-center">
//               <p className="text-gray-500 text-sm mb-1">Name</p>
//               {isEditing ? (
//                 <input
//                   type="text"
//                   name="name"
//                   value={editableProfile.name}
//                   onChange={handleInputChange}
//                   className="w-full px-3 py-2 rounded border border-blue-400 focus:outline-none focus:ring focus:ring-blue-300"
//                 />
//               ) : (
//                 <p className="text-gray-800 font-medium truncate" title={user.name}>{user.name}</p>
//               )}
//             </div>
//             <div className="text-center">
//               <p className="text-gray-500 text-sm mb-1">Email</p>
//               <p className="text-gray-800 font-medium truncate" title={user.email}>{user.email}</p>
//             </div>
//             <div className="text-center">
//               <p className="text-gray-500 text-sm mb-1">Phone</p>
//               {isEditing ? (
//                 <input
//                   type="text"
//                   name="phone"
//                   value={editableProfile.phone}
//                   onChange={handleInputChange}
//                   className="w-full px-3 py-2 rounded border border-blue-400 focus:outline-none focus:ring focus:ring-blue-300"
//                 />
//               ) : (
//                 <p className="text-gray-800 font-medium truncate" title={user.phone || 'Not provided'}>
//                   {user.phone || 'Not provided'}
//                 </p>
//               )}
//             </div>
//             <div className="text-center">
//               <p className="text-gray-500 text-sm mb-1">User Type</p>
//               <p className="text-gray-800 font-medium capitalize">{user.usertype}</p>
//             </div>
//           </div>
//         </div>

//         {/* Shop Management Section */}
//         {user.usertype === 'shopOwner' && (
//           <div className="bg-white rounded-lg shadow p-6 mb-8">
//             <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
//               <div className="flex items-center">
//                 <FaStore className="text-green-500 text-2xl mr-3" />
//                 <h2 className="text-xl font-semibold text-gray-800">Shop Management</h2>
//               </div>
//               {loading && (
//                 <div className="text-yellow-500 text-sm">Loading shop data...</div>
//               )}
//               <button 
//                 onClick={manuallyCheckShop}
//                 className="text-blue-500 text-sm hover:text-blue-600"
//               >
//                 Refresh Shop Data
//               </button>
//             </div>

//             {shopExists && shop ? (
//               <div>
//                 <div className="bg-gray-100 rounded-lg p-4 mb-6">
//                   <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Shop Details</h3>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     <div>
//                       <p className="text-gray-500 text-sm">Shop Name</p>
//                       <p className="text-gray-800 font-medium">{shop.shopname}</p>
//                     </div>
//                     <div>
//                       <p className="text-gray-500 text-sm">Status</p>
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${shop.isApproved ? 'bg-green-600 text-white' : 'bg-yellow-500 text-white'}`}>
//                         {shop.isApproved ? 'Approved' : 'Pending Approval'}
//                       </span>
//                     </div>
//                     <div>
//                       <p className="text-gray-500 text-sm">Location</p>
//                       <p className="text-gray-800 font-medium">{shop.city}, {shop.state}</p>
//                     </div>
//                     <div>
//                       <p className="text-gray-500 text-sm">Services</p>
//                       <p className="text-gray-800 font-medium">{shop.services?.length || 0} services</p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//                   <button
//                     onClick={handleShopAction}
//                     className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg flex items-center justify-center transition duration-300"
//                   >
//                     <FaEdit className="mr-2" />
//                     Edit Shop Details
//                   </button>
                  
//                   <Link
//                     to="/barberDashboard"
//                     className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg flex items-center justify-center transition duration-300"
//                   >
//                     <FaChartBar className="mr-2" />
//                     Shop Dashboard
//                   </Link>
                  
//                   <Link
//                     to="/customerDashboard"
//                     className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg flex items-center justify-center transition duration-300"
//                   >
//                     <FaCalendarAlt className="mr-2" />
//                     My Appointments
//                   </Link>
//                 </div>
//               </div>
//             ) : (
//               <div className="text-center py-8">
//                 <FaStore className="text-gray-400 text-6xl mx-auto mb-4" />
//                 <h3 className="text-xl font-semibold text-gray-800 mb-2">No Shop Registered</h3>
//                 <p className="text-gray-500 mb-6">
//                   You haven't registered a shop yet. Register your shop to start accepting appointments.
//                 </p>
//                 <button
//                   onClick={handleShopAction}
//                   className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg flex items-center mx-auto transition duration-300"
//                 >
//                   <FaPlus className="mr-2" />
//                   Register Your Shop
//                 </button>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Customer Dashboard for non-shopOwner */}
//         {user.usertype !== 'shopOwner' && (
//           <div className="bg-white rounded-lg shadow p-6 mb-8">
//             <div className="text-center py-8">
//               <FaUser className="text-gray-400 text-6xl mx-auto mb-4" />
//               <h3 className="text-xl font-semibold text-gray-800 mb-2">Customer Dashboard</h3>
//               <p className="text-gray-500 mb-6">
//                 Welcome to your customer dashboard. Explore salons and book appointments.
//               </p>
//               <Link
//                 to="/salons"
//                 className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg inline-flex items-center transition duration-300"
//               >
//                 <FaStore className="mr-2" />
//                 Find Salons
//               </Link>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// };





// import React, { useState, useEffect } from 'react';
// import { useLogin } from '../components/LoginContext';
// import { Link, useNavigate } from 'react-router-dom';
// import { FaStore, FaEdit, FaPlus, FaUser, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaHome } from 'react-icons/fa';

// export const BarberProfile = () => {
//   const { user, shop, shopExists, logout, refreshShopData, checkShopExists } = useLogin();
//   const [loading, setLoading] = useState(false);
//   const [debugInfo, setDebugInfo] = useState({});
//   const navigate = useNavigate();

//   useEffect(() => {
//     console.log("Dashboard mounted - User:", user);
//     console.log("Dashboard mounted - Shop:", shop);
//     console.log("Dashboard mounted - ShopExists:", shopExists);

//     if (!user) {
//       navigate('/login');
//       return;
//     }

//     // If user is shopOwner but shop data is missing, try to check manually
//     if (user && user.usertype === 'shopOwner' && !shop) {
//       console.log("Shop data missing, manually checking...");
//       manuallyCheckShop();
//     }

//     setDebugInfo({
//       userType: user?.usertype,
//       userEmail: user?.email,
//       shopExists,
//       shopData: shop
//     });
//   }, [user, shop, shopExists, navigate]);

//   const manuallyCheckShop = async () => {
//     try {
//       setLoading(true);
//       console.log("Manual shop check for:", user.email);
//       const result = await checkShopExists(user.email);
//       console.log("Manual shop check result:", result);
//       setLoading(false);
//     } catch (error) {
//       console.error("Manual shop check failed:", error);
//       setLoading(false);
//     }
//   };

//   const handleLogout = () => {
//     logout();
//   };

//   console.log("Shop Data - Exists:", shopExists, "Data:", shop);
//   console.log("Debug Info:", debugInfo);

//   const handleShopAction = async () => {
//     if (shopExists && shop) {
//       navigate('/barber-profile-update');
//     } else {
//       navigate('/registershop');
//     }
//   };

//   const handleShopUpdateComplete = async () => {
//     setLoading(true);
//     await refreshShopData();
//     setLoading(false);
//   };

//   if (!user) {
//     return (
//       <div className="min-h-screen bg-gray-900 flex items-center justify-center">
//         <div className="text-white text-xl">Redirecting to login...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-900">
//       {/* Debug Info (remove in production) */}
//       {/* <div className="bg-yellow-900 text-yellow-200 p-2 text-xs">
//         Debug: UserType: {debugInfo.userType} | ShopExists: {debugInfo.shopExists?.toString()} | 
//         HasShopData: {debugInfo.shopData ? 'Yes' : 'No'}
//       </div> */}


//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* User Info Card */}
//         <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6 mt-10">
//             <div className="flex items-center mb-4">
//             <FaUser className="text-blue-400 text-2xl mr-3" />
//             <h2 className="text-xl font-semibold text-white">User Information</h2>
//             </div>
//             <div className="grid grid-cols-4 gap-6"> {/* Changed to fixed 4 columns */}
//             <div className="text-center">
//                 <p className="text-gray-400 text-sm mb-1">Name</p>
//                 <p className="text-white font-medium truncate" title={user.name}>{user.name}</p>
//             </div>
//             <div className="text-center">
//                 <p className="text-gray-400 text-sm mb-1">Email</p>
//                 <p className="text-white font-medium truncate" title={user.email}>{user.email}</p>
//             </div>
//             <div className="text-center">
//                 <p className="text-gray-400 text-sm mb-1">Phone</p>
//                 <p className="text-white font-medium truncate" title={user.phone || 'Not provided'}>
//                 {user.phone || 'Not provided'}
//                 </p>
//             </div>
//             <div className="text-center">
//                 <p className="text-gray-400 text-sm mb-1">User Type</p>
//                 <p className="text-white font-medium capitalize">{user.usertype}</p>
//             </div>
//             </div>
//         </div>

//         {/* Shop Management Section - Only for shopOwner */}
//         {user.usertype === 'shopOwner' && (
//           <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
//             <div className="flex items-center justify-between mb-6">
//               <div className="flex items-center">
//                 <FaStore className="text-green-400 text-2xl mr-3" />
//                 <h2 className="text-xl font-semibold text-white">Shop Management</h2>
//               </div>
//               {loading && (
//                 <div className="text-yellow-400 text-sm">Loading shop data...</div>
//               )}
//               <button 
//                 onClick={manuallyCheckShop}
//                 className="text-blue-400 text-sm hover:text-blue-300"
//               >
//                 Refresh Shop Data
//               </button>
//             </div>

//             {shopExists && shop ? (
//               <div>
//                 <div className="bg-gray-700 rounded-lg p-4 mb-6">
//                   <h3 className="text-lg font-semibold text-white mb-2">Your Shop Details</h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <p className="text-gray-400 text-sm">Shop Name</p>
//                       <p className="text-white font-medium">{shop.shopname}</p>
//                     </div>
//                     <div>
//                       <p className="text-gray-400 text-sm">Status</p>
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                         shop.isApproved 
//                           ? 'bg-green-600 text-white' 
//                           : 'bg-yellow-600 text-white'
//                       }`}>
//                         {shop.isApproved ? 'Approved' : 'Pending Approval'}
//                       </span>
//                     </div>
//                     <div>
//                       <p className="text-gray-400 text-sm">Location</p>
//                       <p className="text-white font-medium">{shop.city}, {shop.state}</p>
//                     </div>
//                     <div>
//                       <p className="text-gray-400 text-sm">Services</p>
//                       <p className="text-white font-medium">{shop.services?.length || 0} services</p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <button
//                     onClick={handleShopAction}
//                     className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition duration-300 flex items-center justify-center"
//                   >
//                     <FaEdit className="mr-2" />
//                     Edit Shop Details
//                   </button>
                  
//                   <Link
//                     to="/barberDashboard"
//                     className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg transition duration-300 flex items-center justify-center"
//                   >
//                     <FaChartBar className="mr-2" />
//                     Shop Dashboard
//                   </Link>
                  
//                   <Link
//                     to="/customerDashboard"
//                     className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg transition duration-300 flex items-center justify-center"
//                   >
//                     <FaCalendarAlt className="mr-2" />
//                     My Appointments
//                   </Link>
//                 </div>
//               </div>
//             ) : (
//               <div className="text-center py-8">
//                 <FaStore className="text-gray-400 text-6xl mx-auto mb-4" />
//                 <h3 className="text-xl font-semibold text-white mb-2">No Shop Registered</h3>
//                 <p className="text-gray-400 mb-6">
//                   You haven't registered a shop yet. Register your shop to start accepting appointments.
//                 </p>
//                 <button
//                   onClick={handleShopAction}
//                   className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition duration-300 flex items-center mx-auto"
//                 >
//                   <FaPlus className="mr-2" />
//                   Register Your Shop
//                 </button>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Show message if user is not shopOwner */}
//         {user.usertype !== 'shopOwner' && (
//           <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
//             <div className="text-center py-8">
//               <FaUser className="text-gray-400 text-6xl mx-auto mb-4" />
//               <h3 className="text-xl font-semibold text-white mb-2">Customer Dashboard</h3>
//               <p className="text-gray-400 mb-6">
//                 Welcome to your customer dashboard. Explore salons and book appointments.
//               </p>
//               <Link
//                 to="/salons"
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-300 inline-flex items-center"
//               >
//                 <FaStore className="mr-2" />
//                 Find Salons
//               </Link>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// };






// import React, { useState, useEffect } from "react";
// import { useLogin } from "../components/LoginContext";
// import { useNavigate } from "react-router-dom";
// import { api } from "../utils/api";
// import Swal from "sweetalert2";

// export const BarberProfile = () => {
//     const [userData, setUserData] = useState(true);
//     const { user } = useLogin();
//     const navigate = useNavigate();
//     const [profile, setProfile] = useState({
//         shop_owner_id: '',
//         name: '',
//         email: '',
//         phone: '',
//         date: '',
//         showtimes: [{ date: '', is_booked: false }],
//     });

//     useEffect(() => {
//         if (userData && user) {
//             const fetchShopOwnerId = async () => {
//                 try {
//                     const response = await api.get(`/shop/by-email/${user.email}`);
//                     const shopId = response.data._id || '';

//                     setProfile({
//                         shop_owner_id: shopId,
//                         name: user.name,
//                         email: user.email,
//                         phone: user.phone,
//                         date: '',
//                         showtimes: [{ date: '', is_booked: false }],
//                     });
//                 } catch (error) {
//                     console.error('Error fetching shop data:', error);
//                     setProfile((prevProfile) => ({
//                         ...prevProfile,
//                         name: user.name,
//                         email: user.email,
//                         phone: user.phone,
//                     }));
//                 } finally {
//                     setUserData(false);
//                 }
//             };

//             fetchShopOwnerId();
//         }
//     }, [user, userData]);

//     const handleInput = (e) => {
//         const { name, value } = e.target;
//         setProfile({
//             ...profile,
//             [name]: value,
//         });
//     };

//     const handleShowtimeChange = (index, e) => {
//         const { name, value } = e.target;
//         const newShowtimes = [...profile.showtimes];
//         newShowtimes[index] = {
//             ...newShowtimes[index],
//             [name]: value,
//         };
//         setProfile({
//             ...profile,
//             showtimes: newShowtimes,
//         });
//     };

//     const addShowtime = () => {
//         setProfile({
//             ...profile,
//             showtimes: [...profile.showtimes, { date: '', is_booked: false }],
//         });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const response = await api.post(`/time/timeslots`, profile);
//             Swal.fire({ title: "Success", text: "Time slot created successfully", icon: "success" });
//             navigate('/');
//         } catch (error) {
//             console.error('Error creating time slot', error);
//             alert('Failed to create time slot');
//         }
//     };

//     const today = new Date().toISOString().split("T")[0];

//     return (
//         <main className="min-h-screen bg-gradient-to-tr from-purple-100 via-pink-50 to-indigo-100 py-10 px-4">
//             <section className="bg-white max-w-4xl mx-auto rounded-3xl shadow-2xl p-10 border border-purple-200">

//                 {/* Edit Button */}
//                 <div className="flex justify-end">
//                     <button
//                         onClick={() => navigate(`/barber-profile-update`)}
//                         className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-2 rounded-full shadow-md transition-transform transform hover:scale-105"
//                     >
//                         Edit Profile
//                     </button>
//                 </div>

//                 {/* Welcome Section */}
//                 <div className="text-center my-10">
//                     <h1 className="text-4xl font-extrabold text-purple-800">
//                         Welcome <span className="text-pink-600 italic">{user?.name}</span>
//                     </h1>
//                     <p className="mt-2 text-gray-600 text-lg">Manage your salon profile and available time slots</p>
//                 </div>

//                 {/* Profile Form */}
//                 <form onSubmit={handleSubmit} className="space-y-6">

//                     {/* Profile Info */}
//                     <div className="grid md:grid-cols-2 gap-6">
//                         {[
//                             { label: "Shop Owner ID", name: "shop_owner_id", type: "text" },
//                             { label: "Name", name: "name", type: "text" },
//                             { label: "Email", name: "email", type: "email" },
//                             { label: "Phone", name: "phone", type: "text" },
//                         ].map(({ label, name, type }) => (
//                             <div key={name}>
//                                 <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
//                                 <input
//                                     type={type}
//                                     name={name}
//                                     id={name}
//                                     value={profile[name]}
//                                     onChange={handleInput}
//                                     readOnly
//                                     className="w-full p-3 rounded-xl border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
//                                     required
//                                 />
//                             </div>
//                         ))}
//                     </div>

//                     {/* Date Picker */}
//                     <div>
//                         <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
//                         <input
//                             type="date"
//                             name="date"
//                             value={profile.date}
//                             onChange={handleInput}
//                             min={today}
//                             className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
//                             required
//                         />
//                     </div>

//                     {/* Showtimes */}
//                     <div>
//                         <label className="block text-lg font-semibold text-gray-800 mb-2">Time Slots</label>
//                         {profile.showtimes.map((showtime, index) => (
//                             <div key={index} className="flex items-center space-x-4 mb-4">
//                                 <span className="w-24 text-right text-gray-600 font-medium">Slot {index + 1}:</span>
//                                 <input
//                                     type="datetime-local"
//                                     name="date"
//                                     value={showtime.date}
//                                     onChange={(e) => handleShowtimeChange(index, e)}
//                                     min={today}
//                                     className="flex-1 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
//                                     required
//                                 />
//                             </div>
//                         ))}

//                         <div className="text-center mt-4">
//                             <button
//                                 type="button"
//                                 onClick={addShowtime}
//                                 className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-full transition-transform transform hover:scale-105 shadow-md"
//                             >
//                                 + Add Slot
//                             </button>
//                         </div>
//                     </div>

//                     {/* Submit Button */}
//                     <div className="text-center mt-10">
//                         <button
//                             type="submit"
//                             className="bg-green-600 hover:bg-green-700 text-white text-lg font-semibold px-10 py-3 rounded-full transition-transform transform hover:scale-105 shadow-lg"
//                         >
//                             Submit Slots
//                         </button>
//                     </div>
//                 </form>
//             </section>
//         </main>

//     );
// };









