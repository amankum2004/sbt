
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
  const { user, shop, shopExists, refreshShopData, setUser } = useLogin();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableProfile, setEditableProfile] = useState({ name: '', phone: '' });
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user && user.usertype === 'shopOwner') {
      manuallyCheckShop();
    }

    // Initialize editable profile
    if (user) {
      setEditableProfile({ name: user.name, phone: user.phone || '' });
    }
  }, [user?.email, user?.usertype, navigate]);

  const manuallyCheckShop = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      // refreshShopData updates context + localStorage, not just API response
      await refreshShopData();
    } catch (error) {
      console.error("Manual shop check failed:", error);
    } finally {
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
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50 flex items-center justify-center">
        <div className="text-gray-600 text-lg animate-pulse">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50">
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
          <div className="rounded-3xl border border-white/80 bg-white/90 p-6 mb-6 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.45)]">
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
                <div className="rounded-xl border border-cyan-200 bg-gradient-to-r from-cyan-50 to-amber-50 p-4">
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
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
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
                    className="bg-gradient-to-r from-cyan-500 to-amber-400 hover:brightness-110 text-slate-950 p-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 text-sm sm:text-base font-black"
                  >
                    <FaEdit className="text-lg" />
                    <span className="font-medium">Edit Shop Details</span>
                  </button>

                  <Link
                    to="/analytics-dashboard"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 text-sm sm:text-base"
                  >
                    <FaChartBar className="text-lg" />
                    <span className="font-medium">Business Analytics</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 px-4">
                <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
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
        <div className="rounded-3xl border border-white/80 bg-white/90 p-6 mb-6 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.45)]">
          {/* Collapsible Header */}
          <button
            onClick={() => setShowPersonalInfo(!showPersonalInfo)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors duration-200"
          >
            <div className="flex items-center">
              <div className="bg-cyan-100 p-3 rounded-xl mr-4">
                <FaUser className="text-cyan-700 text-xl" />
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
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
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
                      className="bg-gradient-to-r from-cyan-500 to-amber-400 hover:brightness-110 text-slate-950 px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 text-sm font-black shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
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
                      className="w-full px-3 py-2 rounded-lg border border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-sm"
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
                      className="w-full px-3 py-2 rounded-lg border border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-sm"
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
                  <div className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-xs font-bold capitalize inline-block">
                    {user.usertype}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Customer Dashboard for non-shopOwner */}
        {user.usertype !== 'shopOwner' && (
          <div className="rounded-3xl border border-white/80 bg-white/90 p-6 mb-6 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.45)]">
            <div className="text-center py-6">
              <div className="bg-cyan-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUser className="text-cyan-700 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Customer Dashboard</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6 leading-relaxed text-sm">
                Welcome to your customer dashboard. Explore the best salons in your area and book appointments with top professionals.
              </p>
              <Link
                to="/nearbyShops"
                className="bg-gradient-to-r from-cyan-500 to-amber-400 hover:brightness-110 text-slate-950 px-6 py-3 rounded-xl inline-flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-black text-sm sm:text-base"
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






















