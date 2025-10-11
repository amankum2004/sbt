import React, { useState, useEffect } from 'react';
import { useLogin } from '../components/LoginContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaStore, FaEdit, FaPlus, FaUser, FaCalendarAlt, FaChartBar, FaUserEdit, FaPhoneAlt, FaEnvelope, FaUserTag } from 'react-icons/fa';
import { MdCancel, MdRefresh } from 'react-icons/md';
import { FiSave, FiEdit } from 'react-icons/fi';
import { api } from '../utils/api';
import Swal from 'sweetalert2';
import ShopStatusButton from '../components/ShopStatusButton';

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
      navigate('/barber-profile-update');
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
        Swal.fire({ 
          title: 'Success', 
          text: 'Profile updated successfully!', 
          icon: 'success',
          confirmButtonColor: '#3B82F6'
        });
        setUser({ ...user, name: editableProfile.name, phone: editableProfile.phone });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      Swal.fire({
        title: 'Error',
        text: 'Profile update failed. Please try again.',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-gray-600 text-lg animate-pulse">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="text-center mb-8 pt-4 mt-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Manage your personal information and shop details
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-xl mr-4">
                <FaUser className="text-blue-600 text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                <p className="text-gray-500 text-sm">Manage your account details</p>
              </div>
            </div>
            
            <div className="flex gap-2 self-end sm:self-auto">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveProfile}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <FiSave className="text-base" /> Save Changes
                  </button>
                  <button
                    onClick={toggleEdit}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 text-sm font-medium"
                  >
                    <MdCancel className="text-base" /> Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={toggleEdit}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <FiEdit className="text-base" /> Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <FaUser className="text-gray-400 text-sm" />
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Name</p>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editableProfile.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  placeholder="Enter your name"
                />
              ) : (
                <p className="text-gray-900 font-semibold truncate" title={user.name}>
                  {user.name || 'Not provided'}
                </p>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <FaEnvelope className="text-gray-400 text-sm" />
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Email</p>
              </div>
              <p className="text-gray-900 font-semibold truncate" title={user.email}>
                {user.email}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <FaPhoneAlt className="text-gray-400 text-sm" />
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Phone</p>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  name="phone"
                  value={editableProfile.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  placeholder="Enter phone number"
                />
              ) : (
                <p className="text-gray-900 font-semibold truncate" title={user.phone || 'Not provided'}>
                  {user.phone || 'Not provided'}
                </p>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <FaUserTag className="text-gray-400 text-sm" />
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">User Type</p>
              </div>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold capitalize inline-block">
                {user.usertype}
              </div>
            </div>
          </div>
        </div>

        {/* Shop Management Section */}
        {user.usertype === 'shopOwner' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-xl mr-4">
                  <FaStore className="text-green-600 text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Shop Management</h2>
                  <p className="text-gray-500 text-sm">Manage your barber shop</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {loading && (
                  <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50 px-3 py-1.5 rounded-full">
                    <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse"></div>
                    Loading shop data...
                  </div>
                )}
                <button 
                  onClick={manuallyCheckShop}
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-300 flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg"
                >
                  <MdRefresh className="text-base" />
                  Refresh
                </button>
              </div>
            </div>

            {shopExists && shop ? (
              <div className="space-y-6">
                {/* Shop Status Button */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <ShopStatusButton 
                    shopId={shop._id} 
                    currentStatus={shop.status || 'closed'} 
                  />
                </div>

                {/* Shop Details */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Shop Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-3 border border-gray-300">
                      <p className="text-gray-500 text-xs font-medium mb-1">Shop Name</p>
                      <p className="text-gray-900 font-semibold truncate">{shop.shopname}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-300">
                      <p className="text-gray-500 text-xs font-medium mb-1">Status</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${shop.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {shop.isApproved ? 'Approved' : 'Pending Approval'}
                      </span>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-300">
                      <p className="text-gray-500 text-xs font-medium mb-1">Location</p>
                      <p className="text-gray-900 font-semibold truncate">{shop.city}, {shop.state}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-300">
                      <p className="text-gray-500 text-xs font-medium mb-1">Services</p>
                      <p className="text-gray-900 font-semibold">{shop.services?.length || 0} services</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button
                    onClick={handleShopAction}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                  >
                    <FaEdit className="text-lg" />
                    <span className="font-medium">Edit Shop Details</span>
                  </button>
                  
                  <Link
                    to="/barberDashboard"
                    className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                  >
                    <FaChartBar className="text-lg" />
                    <span className="font-medium">Shop Dashboard</span>
                  </Link>
                  
                  <Link
                    to="/customerDashboard"
                    className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                  >
                    <FaCalendarAlt className="text-lg" />
                    <span className="font-medium">My Appointments</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 px-4">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaStore className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No Shop Registered</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-8 leading-relaxed">
                  You haven't registered a shop yet. Register your shop to start accepting appointments and grow your business.
                </p>
                <button
                  onClick={handleShopAction}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-xl flex items-center gap-3 mx-auto transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium"
                >
                  <FaPlus className="text-lg" />
                  Register Your Shop
                </button>
              </div>
            )}
          </div>
        )}

        {/* Customer Dashboard for non-shopOwner */}
        {user.usertype !== 'shopOwner' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
            <div className="text-center py-8">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaUser className="text-blue-600 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Customer Dashboard</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-8 leading-relaxed">
                Welcome to your customer dashboard. Explore the best salons in your area and book appointments with top professionals.
              </p>
              <Link
                to="/salons"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl inline-flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium"
              >
                <FaStore className="text-lg" />
                Explore Salons
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
// import ShopStatusButton from '../components/ShopStatusButton'; // Add this import

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
//                 {/* Add Shop Status Button */}
//                 <div className="mb-6">
//                   <ShopStatusButton 
//                     shopId={shop._id} 
//                     currentStatus={shop.status || 'closed'} 
//                   />
//                 </div>

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





