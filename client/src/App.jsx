import { useEffect } from "react"; 
import {BrowserRouter,Routes,Route, Navigate} from "react-router-dom"
import { LoginProvider , useLogin} from "./components/LoginContext"
import ProtectedRoute from "./components/ProtectedRoute";
import useDeviceSize from "./utils/useDeviceSize";

// Public components
import { Home } from "./pages/home"
import { About } from "./pages/About"
import { Contact } from "./pages/Contact"
import { Service } from "./pages/Service"
import { Register } from "./pages/Register"
import  Login  from "./pages/Login"
import { Error } from "./pages/Error"
import {Header }from "./components/Header"
import { Footer } from "./components/Footer"
import { UpdatePassword } from "./pages/UpdatePassword"
import Donate from "./pages/Donate";
import LearningGuide from "./pages/learning-guide";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Poster from "./pages/Poster";
import TermsOfService from "./pages/TermsofService";
import CancellationPolicy from "./pages/CancellationPolicy";

// Protected components
import { AdminLayout } from "./pages/Admin-Layout"
import { AdminUsers } from "./pages/Admin-Users"
import { AdminContacts } from "./pages/Admin-Contacts"
import { AdminServices } from "./pages/Admin-Services"
import { AdminUserUpdate } from "./pages/Admin-User-Update"
import {AdminViewDonations} from "./pages/AdminViewDonations";
import { Shops } from "./pages/Shops"
import { RegisterShop } from "./pages/RegisterShop"
import { AdminShops } from "./pages/Admin-Shops"
import { AdminShopUpdate } from "./pages/Admin-Shop-Update"
import  DateTimeSelection  from "./pages/ShopInfo"
import { Payment } from "./pages/Payment"
import { CustomerProfile } from "./pages/CustomerProfile"
import {BarberProfile} from "./pages/BarberProfile"
import BarberProfileUpdate from "./pages/BarberProfile-Update";
import AdminPendingShops from "./pages/Admin-PendingShops";
import { TemplateForm } from "./pages/TimeSlot-Creater";
import { AdminHome } from "./pages/Admin-Home";
import BarberDashboard from "./pages/BarberDashboard";
import BarberAnalyticsDashboard from "./pages/BarberAnalyticsDashboard";
import CustomerDashboard from "./pages/customerDashboard";
import AdminReviews from "./pages/Admin-Reviews";
import ShopReviews from "./pages/ShopReviews";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import ManageJobs from "./pages/ManageJobs";
import ChatBot from "./components/ChatBot";

function App() {
  const { deviceSize, isDesktop, isLandscape, isMobile, isTablet } = useDeviceSize();

  useEffect(() => {
    document.documentElement.setAttribute("data-device-size", deviceSize);
    document.documentElement.setAttribute("data-orientation", isLandscape ? "landscape" : "portrait");
  }, [deviceSize, isLandscape]);

  return (
    <BrowserRouter>
      <LoginProvider>
        <div
          className="app-shell"
          data-device-size={deviceSize}
          data-mobile={isMobile ? "true" : "false"}
          data-tablet={isTablet ? "true" : "false"}
          data-desktop={isDesktop ? "true" : "false"}
          data-orientation={isLandscape ? "landscape" : "portrait"}
        >
          <Header />
          <div className="app-content">
            <AppRoutes />
          </div>
          <Footer />
          <ChatBot />
        </div>
      </LoginProvider>
    </BrowserRouter>
  );
}

function AppRoutes()  {
  const { user } = useLogin();
  
  return (
    <Routes>
      {/* Public routes */}
      <Route index element={<Home />} />
      <Route path="/" element={<Home />}/>
      <Route path="/about" element={<About />}/>
      <Route path="/contact" element={<Contact />}/>
      <Route path="/services" element={<Service />}/>
      <Route path="/register" element={<Register />}/>
      <Route path="/donate" element={<Donate />}/>
      <Route path="/learning" element={<LearningGuide />}/>
      <Route path="/privacy-policy" element={<PrivacyPolicy/>}/>
      <Route path="/terms-of-service" element={<TermsOfService/>}/>
      <Route path="/cancellation-policy" element={<CancellationPolicy/>}/>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/updatePassword" element={<UpdatePassword />}/>
      <Route path="/poster" element={<Poster />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/jobs/:jobId" element={<JobDetail />} />
      
      {/* Protected Routes */}
      <Route path="/nearbyShops" element={<ProtectedRoute><Shops /></ProtectedRoute>} />
      <Route path="/registershop" element={<ProtectedRoute><RegisterShop /></ProtectedRoute>} />
      <Route path="/customerprofile" element={<ProtectedRoute><CustomerProfile /></ProtectedRoute>} />
      <Route path="/barberprofile" element={<ProtectedRoute><BarberProfile /></ProtectedRoute>} />
      <Route path="/timeSlot-create" element={<ProtectedRoute><TemplateForm /></ProtectedRoute>} />
      <Route path="/barberDashboard" element={<ProtectedRoute><BarberDashboard /></ProtectedRoute>} />
      <Route path="/analytics-dashboard" element={<ProtectedRoute><BarberAnalyticsDashboard /></ProtectedRoute>} />
      <Route path="/customerDashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/barber-profile-update" element={<ProtectedRoute><BarberProfileUpdate /></ProtectedRoute>} />
      <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
      <Route path="/manage-jobs" element={<ProtectedRoute><ManageJobs /></ProtectedRoute>} />
      <Route
        path="/nearbyShops/:shopId/shopinfo"
        element={<ProtectedRoute><DateTimeSelection /></ProtectedRoute>}
      />

      {/* Protected Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredUserType="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminHome />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="contacts" element={<AdminContacts />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="shops" element={<AdminShops />} />
        <Route path="requests" element={<AdminPendingShops />} />
        <Route path="users/:id/edit" element={<AdminUserUpdate />} />
        <Route path="shops/:id/edit" element={<AdminShopUpdate />} />
        <Route path="donations" element={<AdminViewDonations />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path=":shopId/review" element={<ShopReviews />} />
        <Route path="*" element={<Error />} />
      </Route>
      
      {/* Catch all route for public errors */}
      <Route path="*" element={<Error />}/>
    </Routes>
  );
}

export default App;
