import React from "react"; 
import {BrowserRouter,Routes,Route, Navigate} from "react-router-dom"
import { LoginProvider , useLogin} from "./components/LoginContext"
import ProtectedRoute from "./components/ProtectedRoute";
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
import Donate from "./pages/Donate";
import LearningGuide from "./pages/learning-guide";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Poster from "./pages/Poster";

// Protected components
import { UpdatePassword } from "./pages/UpdatePassword"
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
import CustomerDashboard from "./pages/customerDashboard";
import AdminReviews from "./pages/Admin-Reviews";
import ShopReviews from "./pages/ShopReviews";

function App() {
  return (
    <BrowserRouter>
      <LoginProvider>
        <Header/>
        <AppRoutes />
        <Footer/>
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
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/updatePassword" element={<UpdatePassword />}/>
      <Route path="/poster" element={<Poster />} />
      
      {/* Protected Routes - All wrapped in ProtectedRoute */}
      <Route path="/*" element={
        <ProtectedRoute>
          <ProtectedRoutes />
        </ProtectedRoute>
      }/>
      
      {/* Catch all route for public errors */}
      <Route path="*" element={<Error />}/>
    </Routes>
  );
}

// Separate component for all protected routes
function ProtectedRoutes() {
  return (
    <Routes>
      {/* All protected individual routes */}
      <Route path="/nearbyShops" element={<Shops/>}/>
      <Route path="/registershop" element={<RegisterShop/>}/>
      <Route path="/customerprofile" element={<CustomerProfile/>}/>
      <Route path="/barberprofile" element={<BarberProfile/>}/>
      <Route path="/timeSlot-create" element={<TemplateForm/>}/>
      <Route path="/barberDashboard" element={<BarberDashboard/>}/>
      <Route path="/customerDashboard" element={<CustomerDashboard/>}/>
      <Route path="/barber-profile-update" element={<BarberProfileUpdate/>}/>
      <Route path="/payment" element={<Payment/>}/>
      <Route path="/nearbyShops/:shopId/shopinfo" element={<DateTimeSelection/>}/>
      {/* reviews */}
      {/* <Route path="/my-reviews" element={<UserReviews />} /> */}
      
      {/* Protected Admin Routes */}
      <Route path="/admin/*" element={<AdminLayout />}>
        <Route index element={<AdminHome/>}/>
        <Route path="users" element={<AdminUsers/>}/>
        <Route path="contacts" element={<AdminContacts/>}/>
        <Route path="services" element={<AdminServices/>}/>
        <Route path="shops" element={<AdminShops/>}/>
        <Route path="requests" element={<AdminPendingShops/>}/>
        <Route path="users/:id/edit" element={<AdminUserUpdate/>}/>
        <Route path="shops/:id/edit" element={<AdminShopUpdate/>}/>
        <Route path="donations" element={<AdminViewDonations/>}/>
        <Route path="reviews" element={<AdminReviews />} />
        <Route path=":shopId/review" element={<ShopReviews />} />
      </Route>
      
      {/* Catch all for protected routes - redirect to home or show error */}
      <Route path="*" element={<Navigate to="/" replace />}/>
    </Routes>
  );
}

export default App;







// import React from "react"; 
// import {BrowserRouter,Routes,Route, Navigate} from "react-router-dom"
// import { LoginProvider , useLogin} from "./components/LoginContext"
// import ProtectedRoute from "./components/ProtectedRoute";
// // Public components
// import { Home } from "./pages/home"
// import { About } from "./pages/About"
// import { Contact } from "./pages/Contact"
// import { Service } from "./pages/Service"
// import { Register } from "./pages/Register"
// import  Login  from "./pages/Login"
// import { Error } from "./pages/Error"
// import {Header }from "./components/Header"
// import { Footer } from "./components/Footer"
// import Donate from "./pages/Donate";
// import LearningGuide from "./pages/learning-guide";
// import PrivacyPolicy from "./pages/PrivacyPolicy";

// // Protected components
// import { UpdatePassword } from "./pages/UpdatePassword"
// import { AdminLayout } from "./pages/Admin-Layout"
// import { AdminUsers } from "./pages/Admin-Users"
// import { AdminContacts } from "./pages/Admin-Contacts"
// import { AdminServices } from "./pages/Admin-Services"
// import { AdminUserUpdate } from "./pages/Admin-User-Update"
// import { Shops } from "./pages/Shops"
// import { RegisterShop } from "./pages/RegisterShop"
// import { AdminShops } from "./pages/Admin-Shops"
// import { AdminShopUpdate } from "./pages/Admin-Shop-Update"
// import  DateTimeSelection  from "./pages/ShopInfo"
// import { Payment } from "./pages/Payment"
// import { CustomerProfile } from "./pages/CustomerProfile"
// import {BarberProfile} from "./pages/BarberProfile"
// import BarberProfileUpdate from "./pages/BarberProfile-Update";
// import AdminPendingShops from "./pages/Admin-PendingShops";
// import { TemplateForm } from "./pages/TimeSlot-Creater";
// import { AdminHome } from "./pages/Admin-Home";
// import BarberDashboard from "./pages/BarberDashboard";
// import CustomerDashboard from "./pages/customerDashboard";
// // import GetOTP from "./pages/GetOtp"
// // import { SocketProvider } from "./components/SocketContext";
// // import Forget from "./pages/Forget"

// function App() {
//   return (
//     <BrowserRouter>
//       <LoginProvider>
//         <Header/>
//         <AppRoutes />
//         <Footer/>
//       </LoginProvider>
//     </BrowserRouter>
//   );
// }

// function AppRoutes()  {
//   const { user } = useLogin();
  
//   return (
//     <>
//       {/* <BrowserRouter> */}
//       {/* <LoginProvider> */}
//         {/* <Header/> */}
//           <Routes>
//             {/* Public routes */}
//             <Route index element={<Home />} />
//             <Route path="/" element = {<Home />}/>
//             <Route path="/about" element = {<About />}/>
//             <Route path="/contact" element = {<Contact />}/>
//             <Route path="/services" element = {<Service />}/>
//             <Route path="/register" element = {<Register />}/>
//             <Route path="/donate" element = {<Donate />}/>
//             <Route path="/learning" element = {<LearningGuide />}/>
//             <Route path="/privacy-policy" element = {<PrivacyPolicy/>}/>
//             <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
//             {/* <Route path="/login" element = {<Login />}/> */}
//             {/* <Route path="/getOTP" element = {<GetOTP />}/> */}
//             {/* <Route path="/forget" element = {<Forget />}/> */}
            
//             {/* Protected routes */}
//             <Route path="/updatePassword" element = {<UpdatePassword />}/>
//             <Route path="/nearbyShops" element = {<Shops/>}/>
//             <Route path="/registershop" element = {<RegisterShop/>}/>
//             <Route path="/customerprofile" element = {<CustomerProfile/>}/>
//             <Route path="/barberprofile" element = {<BarberProfile/>}/>
//             <Route path="/timeSlot-create" element = {<TemplateForm/>}/>
//             <Route path="/barberDashboard" element = {<BarberDashboard/>}/>
//             <Route path="/customerDashboard" element = {<CustomerDashboard/>}/>
//             <Route path="/barber-profile-update" element = {<BarberProfileUpdate/>}/>
//             <Route path="/payment" element = {<Payment/>}/>
//             <Route path="/nearbyShops/:shopId/shopinfo" element = {<DateTimeSelection/>}/>
//             <Route path="*" element={<Error />}/>
//             <Route path="/admin" element={<AdminLayout />}>
//               <Route index element={<AdminHome/>}/>
//               <Route path="users" element={<AdminUsers/>}/>
//               <Route path="contacts" element={<AdminContacts/>}/>
//               <Route path="services" element={<AdminServices/>}/>
//               <Route path="shops" element={<AdminShops/>}/>
//               <Route path="requests" element={<AdminPendingShops/>}/>
//               <Route path="users/:id/edit" element={<AdminUserUpdate/>}/>
//               <Route path="shops/:id/edit" element={<AdminShopUpdate/>}/>
//             </Route>
//           </Routes>
//         {/* <Footer/> */}
//         {/* </LoginProvider> */}
//       {/* </BrowserRouter> */}
//     </>
//   )
// }

// export default App;
