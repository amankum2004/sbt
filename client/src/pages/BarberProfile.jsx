
import React, { useState, useEffect } from 'react';
import { useLogin } from '../components/LoginContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaStore, FaEdit, FaPlus, FaUser, FaCalendarAlt, FaChartBar, FaUserEdit, FaPhoneAlt, FaEnvelope, FaUserTag, FaChevronDown, FaChevronUp } from 'react-icons/fa';
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
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
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
        <div className="text-center mb-6 pt-4 mt-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Manage your shop and personal information
          </p>
        </div>

        {/* Shop Management Section - Always on top for shop owners */}
        {user.usertype === 'shopOwner' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
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
              
              <div className="flex items-center gap-2">
                {loading && (
                  <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50 px-3 py-1.5 rounded-full">
                    <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse"></div>
                    Loading shop data...
                  </div>
                )}
              </div>
            </div>

            {shopExists && shop ? (
              <div className="space-y-6">
                {/* Shop Status Button - Most Important */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Shop Status</h3>
                      <p className="text-gray-600 text-sm">Update your shop's availability</p>
                    </div>
                    <ShopStatusButton 
                      shopId={shop._id} 
                      currentStatus={shop.status || 'closed'} 
                    />
                  </div>
                </div>

                {/* Shop Details */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Shop Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white rounded-lg p-3 border border-gray-300">
                      <p className="text-gray-500 text-xs font-medium mb-1">Shop Name</p>
                      <p className="text-gray-900 font-semibold truncate text-sm">{shop.shopname}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-300">
                      <p className="text-gray-500 text-xs font-medium mb-1">Status</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${shop.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {shop.isApproved ? 'Approved' : 'Pending Approval'}
                      </span>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-300">
                      <p className="text-gray-500 text-xs font-medium mb-1">Location</p>
                      <p className="text-gray-900 font-semibold truncate text-sm">{shop.street}, {shop.city}, {shop.state}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-300">
                      <p className="text-gray-500 text-xs font-medium mb-1">Services</p>
                      <p className="text-gray-900 font-semibold text-sm">{shop.services?.length || 0} services</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <Link
                    to="/barberDashboard"
                    className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 text-sm sm:text-base"
                  >
                    <FaChartBar className="text-lg" />
                    <span className="font-medium">Shop Dashboard</span>
                  </Link>

                  <button
                    onClick={handleShopAction}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 text-sm sm:text-base"
                  >
                    <FaEdit className="text-lg" />
                    <span className="font-medium">Edit Shop Details</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 px-4">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaStore className="text-gray-400 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">No Shop Registered</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6 leading-relaxed text-sm">
                  Register your shop to start accepting appointments and grow your business.
                </p>
                <button
                  onClick={handleShopAction}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl flex items-center gap-3 mx-auto transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium text-sm sm:text-base"
                >
                  <FaPlus className="text-lg" />
                  Register Your Shop
                </button>
              </div>
            )}
          </div>
        )}

        {/* Personal Information - Collapsible Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          {/* Collapsible Header */}
          <button
            onClick={() => setShowPersonalInfo(!showPersonalInfo)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors duration-200"
          >
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-xl mr-4">
                <FaUser className="text-blue-600 text-xl" />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                <p className="text-gray-500 text-sm">Manage your account details</p>
              </div>
            </div>
            <div className="text-gray-400">
              {showPersonalInfo ? <FaChevronUp /> : <FaChevronDown />}
            </div>
          </button>

          {/* Collapsible Content */}
          {showPersonalInfo && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Profile Details</h3>
                  <p className="text-gray-500 text-sm">Update your personal information</p>
                </div>
                
                <div className="flex gap-2 self-end sm:self-auto">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveProfile}
                        className="bg-green-500 hover:bg-gray-600 text-white px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      >
                        <FiSave className="text-base" /> Save
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
                      className="w-full px-3 py-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                      placeholder="Enter your name"
                    />
                  ) : (
                    <p className="text-gray-900 font-semibold truncate text-sm" title={user.name}>
                      {user.name || 'Not provided'}
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FaEnvelope className="text-gray-400 text-sm" />
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Email</p>
                  </div>
                  <p className="text-gray-900 font-semibold truncate text-sm" title={user.email}>
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
                      className="w-full px-3 py-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p className="text-gray-900 font-semibold truncate text-sm" title={user.phone || 'Not provided'}>
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
          )}
        </div>

        {/* Customer Dashboard for non-shopOwner */}
        {user.usertype !== 'shopOwner' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
            <div className="text-center py-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUser className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Customer Dashboard</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6 leading-relaxed text-sm">
                Welcome to your customer dashboard. Explore the best salons in your area and book appointments with top professionals.
              </p>
              <Link
                to="/salons"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl inline-flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium text-sm sm:text-base"
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
// import { FaStore, FaEdit, FaPlus, FaUser, FaCalendarAlt, FaChartBar, FaUserEdit, FaPhoneAlt, FaEnvelope, FaUserTag, FaChevronDown, FaChevronUp, FaMapMarkerAlt, FaClock, FaCheckCircle } from 'react-icons/fa';
// import { MdCancel, MdRefresh } from 'react-icons/md';
// import { FiSave, FiEdit } from 'react-icons/fi';
// import { api } from '../utils/api';
// import Swal from 'sweetalert2';

// export const BarberProfile = () => {
//   const { user, shop, shopExists, logout, refreshShopData, checkShopExists, setUser } = useLogin();
//   const [loading, setLoading] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editableProfile, setEditableProfile] = useState({ name: '', phone: '' });
//   const [showPersonalInfo, setShowPersonalInfo] = useState(false);
//   const [currentShop, setCurrentShop] = useState(shop);
//   const [statusLoading, setStatusLoading] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!user) {
//       navigate('/login');
//       return;
//     }

//     if (user && user.usertype === 'shopOwner' && !shop) {
//       manuallyCheckShop();
//     }

//     // Update local shop state when context shop changes
//     setCurrentShop(shop);

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
//       navigate('/barber-profile-update');
//     } else {
//       navigate('/registershop');
//     }
//   };

//   // Function to update shop status
//   const updateShopStatus = async (newStatus) => {
//     if (statusLoading) return;

//     try {
//       setStatusLoading(true);
      
//       const result = await Swal.fire({
//         title: `Change shop status to ${newStatus}?`,
//         text: `This will update your shop's availability status to "${newStatus}". Customers will see this status when browsing shops.`,
//         icon: 'question',
//         showCancelButton: true,
//         confirmButtonColor: '#10B981',
//         cancelButtonColor: '#6B7280',
//         confirmButtonText: `Yes, set to ${newStatus}`,
//         cancelButtonText: 'Cancel',
//         reverseButtons: true,
//         background: '#ffffff',
//         customClass: {
//           popup: 'rounded-2xl',
//           confirmButton: 'px-6 py-2 rounded-xl font-medium',
//           cancelButton: 'px-6 py-2 rounded-xl font-medium'
//         }
//       });

//       if (result.isConfirmed) {
//         const response = await api.put(`/shop/update-status/${currentShop._id}`, {
//           status: newStatus
//         });

//         if (response.data.success) {
//           // Update local state immediately
//           setCurrentShop(prev => prev ? { ...prev, status: newStatus } : prev);
          
//           // Refresh context data
//           await refreshShopData();
          
//           Swal.fire({
//             title: 'Success!',
//             text: `Shop status updated to ${newStatus}`,
//             icon: 'success',
//             confirmButtonColor: '#10B981',
//             timer: 2000,
//             background: '#ffffff',
//             customClass: {
//               popup: 'rounded-2xl'
//             }
//           });
//         }
//       }
//     } catch (error) {
//       console.error('Failed to update shop status:', error);
//       Swal.fire({
//         title: 'Error!',
//         text: 'Failed to update shop status. Please try again.',
//         icon: 'error',
//         confirmButtonColor: '#EF4444',
//         background: '#ffffff',
//         customClass: {
//           popup: 'rounded-2xl'
//         }
//       });
//     } finally {
//       setStatusLoading(false);
//     }
//   };

//   // Function to manually refresh shop data
//   const refreshShopStatus = async () => {
//     try {
//       setLoading(true);
//       await refreshShopData();
//       Swal.fire({
//         title: 'Refreshed!',
//         text: 'Shop data has been updated',
//         icon: 'success',
//         timer: 1500,
//         background: '#ffffff',
//         customClass: {
//           popup: 'rounded-2xl'
//         }
//       });
//     } catch (error) {
//       console.error('Failed to refresh shop data:', error);
//       Swal.fire({
//         title: 'Error!',
//         text: 'Failed to refresh shop data',
//         icon: 'error',
//         background: '#ffffff',
//         customClass: {
//           popup: 'rounded-2xl'
//         }
//       });
//     } finally {
//       setLoading(false);
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
//         Swal.fire({ 
//           title: 'Success', 
//           text: 'Profile updated successfully!', 
//           icon: 'success',
//           confirmButtonColor: '#3B82F6',
//           background: '#ffffff',
//           customClass: {
//             popup: 'rounded-2xl'
//           }
//         });
//         setUser({ ...user, name: editableProfile.name, phone: editableProfile.phone });
//         setIsEditing(false);
//       }
//     } catch (error) {
//       console.error('Failed to update profile:', error);
//       Swal.fire({
//         title: 'Error',
//         text: 'Profile update failed. Please try again.',
//         icon: 'error',
//         confirmButtonColor: '#EF4444',
//         background: '#ffffff',
//         customClass: {
//           popup: 'rounded-2xl'
//         }
//       });
//     }
//   };

//   // Get status configuration
//   const getStatusConfig = (status) => {
//     const config = {
//       open: {
//         text: 'Open',
//         color: 'bg-green-500 text-white',
//         badgeColor: 'bg-green-100 text-green-800',
//         icon: '🟢',
//         description: 'Your shop is open and accepting appointments',
//         nextActions: [
//           { status: 'closed', text: 'Close Shop', color: 'bg-red-500 hover:bg-red-600' },
//           { status: 'busy', text: 'Mark as Busy', color: 'bg-yellow-500 hover:bg-yellow-600' },
//           { status: 'break', text: 'Take a Break', color: 'bg-blue-500 hover:bg-blue-600' }
//         ]
//       },
//       closed: {
//         text: 'Closed',
//         color: 'bg-red-500 text-white',
//         badgeColor: 'bg-red-100 text-red-800',
//         icon: '🔴',
//         description: 'Your shop is currently closed',
//         nextActions: [
//           { status: 'open', text: 'Open Shop', color: 'bg-green-500 hover:bg-green-600' }
//         ]
//       },
//       busy: {
//         text: 'Busy',
//         color: 'bg-yellow-500 text-white',
//         badgeColor: 'bg-yellow-100 text-yellow-800',
//         icon: '🟡',
//         description: 'Your shop is busy but still accepting appointments',
//         nextActions: [
//           { status: 'open', text: 'Mark as Open', color: 'bg-green-500 hover:bg-green-600' },
//           { status: 'closed', text: 'Close Shop', color: 'bg-red-500 hover:bg-red-600' }
//         ]
//       },
//       break: {
//         text: 'On Break',
//         color: 'bg-blue-500 text-white',
//         badgeColor: 'bg-blue-100 text-blue-800',
//         icon: '🔵',
//         description: 'Your shop is temporarily on break',
//         nextActions: [
//           { status: 'open', text: 'Back to Work', color: 'bg-green-500 hover:bg-green-600' },
//           { status: 'closed', text: 'Close Shop', color: 'bg-red-500 hover:bg-red-600' }
//         ]
//       }
//     };
//     return config[status] || config.closed;
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'Never';
//     const date = new Date(dateString);
//     return date.toLocaleString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   if (!user) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
//         <div className="text-gray-600 text-lg animate-pulse">Redirecting to login...</div>
//       </div>
//     );
//   }

//   const statusConfig = getStatusConfig(currentShop?.status || 'closed');

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
//       <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         {/* Header */}
//         <div className="text-center mb-6 pt-4 mt-6">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
//           <p className="text-gray-600 max-w-md mx-auto">
//             Manage your shop and personal information
//           </p>
//         </div>

//         {/* Shop Management Section - Always on top for shop owners */}
//         {user.usertype === 'shopOwner' && (
//           <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
//               <div className="flex items-center">
//                 <div className="bg-green-100 p-3 rounded-xl mr-4">
//                   <FaStore className="text-green-600 text-xl" />
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-bold text-gray-900">Shop Management</h2>
//                   <p className="text-gray-500 text-sm">Manage your barber shop</p>
//                 </div>
//               </div>
              
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={refreshShopStatus}
//                   disabled={loading}
//                   className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-xl transition-colors duration-200 flex items-center gap-2 text-sm"
//                   title="Refresh shop data"
//                 >
//                   <MdRefresh className={`text-lg ${loading ? 'animate-spin' : ''}`} />
//                 </button>
//                 {loading && (
//                   <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50 px-3 py-1.5 rounded-full">
//                     <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse"></div>
//                     Loading shop data...
//                   </div>
//                 )}
//               </div>
//             </div>

//             {shopExists && currentShop ? (
//               <div className="space-y-6">
//                 {/* Current Status Display */}
//                 <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
//                   <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-3 mb-3">
//                         <span className="text-2xl">{statusConfig.icon}</span>
//                         <div>
//                           <h3 className="text-lg font-semibold text-gray-900">Current Status</h3>
//                           <p className="text-gray-600 text-sm">{statusConfig.description}</p>
//                         </div>
//                       </div>
                      
//                       <div className="flex flex-wrap items-center gap-4">
//                         <div className={`px-4 py-2 rounded-full font-bold text-sm ${statusConfig.color} transition-colors duration-200`}>
//                           {statusLoading ? (
//                             <div className="flex items-center gap-2">
//                               <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
//                               Updating...
//                             </div>
//                           ) : (
//                             statusConfig.text
//                           )}
//                         </div>
                        
//                         {currentShop.statusLastUpdated && (
//                           <div className="flex items-center gap-2 text-gray-500 text-sm">
//                             <FaClock className="text-sm" />
//                             <span>Last updated: {formatDate(currentShop.statusLastUpdated)}</span>
//                           </div>
//                         )}
//                       </div>
//                     </div>

//                     {/* Status Actions */}
//                     <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
//                       {statusConfig.nextActions.map((action, index) => (
//                         <button
//                           key={action.status}
//                           onClick={() => updateShopStatus(action.status)}
//                           disabled={statusLoading}
//                           className={`${action.color} text-white px-4 py-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none`}
//                         >
//                           {statusLoading ? (
//                             <>
//                               <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                               Updating...
//                             </>
//                           ) : (
//                             action.text
//                           )}
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Shop Details */}
//                 <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
//                   <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                     <FaStore className="text-blue-500" />
//                     Shop Details
//                   </h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                     <div className="bg-white rounded-lg p-4 border border-gray-300">
//                       <div className="flex items-center gap-2 mb-2">
//                         <FaStore className="text-gray-400 text-sm" />
//                         <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Shop Name</p>
//                       </div>
//                       <p className="text-gray-900 font-semibold text-sm">{currentShop.shopname}</p>
//                     </div>

//                     <div className="bg-white rounded-lg p-4 border border-gray-300">
//                       <div className="flex items-center gap-2 mb-2">
//                         <FaCheckCircle className="text-gray-400 text-sm" />
//                         <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Approval Status</p>
//                       </div>
//                       <span className={`px-2 py-1 rounded-full text-xs font-bold ${currentShop.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
//                         {currentShop.isApproved ? 'Approved' : 'Pending Approval'}
//                       </span>
//                     </div>

//                     <div className="bg-white rounded-lg p-4 border border-gray-300">
//                       <div className="flex items-center gap-2 mb-2">
//                         <FaMapMarkerAlt className="text-gray-400 text-sm" />
//                         <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Location</p>
//                       </div>
//                       <p className="text-gray-900 font-semibold text-sm truncate" title={`${currentShop.street}, ${currentShop.city}, ${currentShop.state} - ${currentShop.pin}`}>
//                         {currentShop.street}, {currentShop.city}, {currentShop.state} - {currentShop.pin}
//                       </p>
//                     </div>

//                     <div className="bg-white rounded-lg p-4 border border-gray-300">
//                       <div className="flex items-center gap-2 mb-2">
//                         <FaUser className="text-gray-400 text-sm" />
//                         <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Services</p>
//                       </div>
//                       <p className="text-gray-900 font-semibold text-sm">{currentShop.services?.length || 0} services available</p>
//                     </div>

//                     <div className="bg-white rounded-lg p-4 border border-gray-300">
//                       <div className="flex items-center gap-2 mb-2">
//                         <FaClock className="text-gray-400 text-sm" />
//                         <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Registered Since</p>
//                       </div>
//                       <p className="text-gray-900 font-semibold text-sm">{formatDate(currentShop.createdAt)}</p>
//                     </div>

//                     <div className="bg-white rounded-lg p-4 border border-gray-300">
//                       <div className="flex items-center gap-2 mb-2">
//                         <FaEdit className="text-gray-400 text-sm" />
//                         <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Last Updated</p>
//                       </div>
//                       <p className="text-gray-900 font-semibold text-sm">{formatDate(currentShop.updatedAt)}</p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                   <Link
//                     to="/barberDashboard"
//                     className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 text-sm font-medium"
//                   >
//                     <FaChartBar className="text-lg" />
//                     <span>Shop Dashboard</span>
//                   </Link>

//                   <button
//                     onClick={handleShopAction}
//                     className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 text-sm font-medium"
//                   >
//                     <FaEdit className="text-lg" />
//                     <span>Edit Shop Details</span>
//                   </button>

//                   <Link
//                     to="/appointments"
//                     className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 text-sm font-medium"
//                   >
//                     <FaCalendarAlt className="text-lg" />
//                     <span>View Appointments</span>
//                   </Link>
//                 </div>
//               </div>
//             ) : (
//               <div className="text-center py-8 px-4">
//                 <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
//                   <FaStore className="text-gray-400 text-2xl" />
//                 </div>
//                 <h3 className="text-xl font-bold text-gray-800 mb-3">No Shop Registered</h3>
//                 <p className="text-gray-600 max-w-md mx-auto mb-6 leading-relaxed text-sm">
//                   Register your shop to start accepting appointments and grow your business.
//                 </p>
//                 <button
//                   onClick={handleShopAction}
//                   className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl flex items-center gap-3 mx-auto transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium text-sm"
//                 >
//                   <FaPlus className="text-lg" />
//                   Register Your Shop
//                 </button>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Personal Information Section */}
//         <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
//           <button
//             onClick={() => setShowPersonalInfo(!showPersonalInfo)}
//             className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors duration-200"
//           >
//             <div className="flex items-center">
//               <div className="bg-blue-100 p-3 rounded-xl mr-4">
//                 <FaUser className="text-blue-600 text-xl" />
//               </div>
//               <div className="text-left">
//                 <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
//                 <p className="text-gray-500 text-sm">Manage your account details</p>
//               </div>
//             </div>
//             <div className="text-gray-400">
//               {showPersonalInfo ? <FaChevronUp /> : <FaChevronDown />}
//             </div>
//           </button>

//           {showPersonalInfo && (
//             <div className="mt-6 pt-6 border-t border-gray-200">
//               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900">Profile Details</h3>
//                   <p className="text-gray-500 text-sm">Update your personal information</p>
//                 </div>
                
//                 <div className="flex gap-2 self-end sm:self-auto">
//                   {isEditing ? (
//                     <>
//                       <button
//                         onClick={handleSaveProfile}
//                         className="bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
//                       >
//                         <FiSave className="text-base" /> Save
//                       </button>
//                       <button
//                         onClick={toggleEdit}
//                         className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 text-sm font-medium"
//                       >
//                         <MdCancel className="text-base" /> Cancel
//                       </button>
//                     </>
//                   ) : (
//                     <button
//                       onClick={toggleEdit}
//                       className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
//                     >
//                       <FiEdit className="text-base" /> Edit Profile
//                     </button>
//                   )}
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                 <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
//                   <div className="flex items-center gap-2 mb-2">
//                     <FaUser className="text-gray-400 text-sm" />
//                     <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Name</p>
//                   </div>
//                   {isEditing ? (
//                     <input
//                       type="text"
//                       name="name"
//                       value={editableProfile.name}
//                       onChange={handleInputChange}
//                       className="w-full px-3 py-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
//                       placeholder="Enter your name"
//                     />
//                   ) : (
//                     <p className="text-gray-900 font-semibold truncate text-sm">
//                       {user.name || 'Not provided'}
//                     </p>
//                   )}
//                 </div>

//                 <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
//                   <div className="flex items-center gap-2 mb-2">
//                     <FaEnvelope className="text-gray-400 text-sm" />
//                     <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Email</p>
//                   </div>
//                   <p className="text-gray-900 font-semibold truncate text-sm">
//                     {user.email}
//                   </p>
//                 </div>

//                 <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
//                   <div className="flex items-center gap-2 mb-2">
//                     <FaPhoneAlt className="text-gray-400 text-sm" />
//                     <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Phone</p>
//                   </div>
//                   {isEditing ? (
//                     <input
//                       type="text"
//                       name="phone"
//                       value={editableProfile.phone}
//                       onChange={handleInputChange}
//                       className="w-full px-3 py-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
//                       placeholder="Enter phone number"
//                     />
//                   ) : (
//                     <p className="text-gray-900 font-semibold truncate text-sm">
//                       {user.phone || 'Not provided'}
//                     </p>
//                   )}
//                 </div>

//                 <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
//                   <div className="flex items-center gap-2 mb-2">
//                     <FaUserTag className="text-gray-400 text-sm" />
//                     <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">User Type</p>
//                   </div>
//                   <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold capitalize inline-block">
//                     {user.usertype}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Customer Dashboard for non-shopOwner */}
//         {user.usertype !== 'shopOwner' && (
//           <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
//             <div className="text-center py-6">
//               <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <FaUser className="text-blue-600 text-2xl" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-800 mb-3">Customer Dashboard</h3>
//               <p className="text-gray-600 max-w-md mx-auto mb-6 leading-relaxed text-sm">
//                 Welcome to your customer dashboard. Explore the best salons in your area and book appointments with top professionals.
//               </p>
//               <Link
//                 to="/salons"
//                 className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl inline-flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium text-sm"
//               >
//                 <FaStore className="text-lg" />
//                 Explore Salons
//               </Link>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// };

















