import React from "react"; 
import {BrowserRouter,Routes,Route} from "react-router-dom"
import { Home } from "./pages/home"
import { About } from "./pages/About"
import { Contact } from "./pages/Contact"
import { Service } from "./pages/Service"
import { Register } from "./pages/Register"
import  Login  from "./pages/Login"
import GetOTP from "./pages/GetOtp"
import { Error } from "./pages/Error"
import {Header }from "./components/Header"
import { Footer } from "./components/Footer"
import Forget from "./pages/Forget"
import UpdatePassword from "./pages/UpdatePassword"
import { AdminLayout } from "./pages/Admin-Layout"
import { AdminUsers } from "./pages/Admin-Users"
import { AdminContacts } from "./pages/Admin-Contacts"
import { AdminServices } from "./pages/Admin-Services"
import { AdminUserUpdate } from "./pages/Admin-User-Update"
import { Shops } from "./pages/Shops"
import { RegisterShop } from "./pages/RegisterShop"
import { AdminShops } from "./pages/Admin-Shops"
import { AdminShopUpdate } from "./pages/Admin-Shop-Update"
import  DateTimeSelection  from "./pages/ShopInfo"
import { Payment } from "./pages/Payment"
import { CustomerProfile } from "./pages/CustomerProfile"
import {BarberProfile} from "./pages/BarberProfile"
import { LoginProvider } from "./components/LoginContext"
import BarberProfileUpdate from "./pages/BarberProfile-Update";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AdminPendingShops from "./pages/Admin-PendingShops";
import Donate from "./pages/Donate";
import LearningGuide from "./pages/learning-guide";
import { TemplateForm } from "./pages/TimeSlot-Creater";
import { AdminHome } from "./pages/Admin-Home";
import BarberDashboard from "./pages/BarberDashboard";
import CustomerDashboard from "./pages/customerDashboard";
// import { TimeSlotManager } from "./pages/TimeSlot-Manager";


function App()  {
  
  return (
    <>
    <BrowserRouter>
      <LoginProvider>
      <Header/>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/" element = {<Home />}/>
          <Route path="/about" element = {<About />}/>
          <Route path="/contact" element = {<Contact />}/>
          <Route path="/services" element = {<Service />}/>
          <Route path="/register" element = {<Register />}/>
          <Route path="/login" element = {<Login />}/>
          <Route path="/getOTP" element = {<GetOTP />}/>
          <Route path="/forget" element = {<Forget />}/>
          <Route path="/update" element = {<UpdatePassword />}/>
          <Route path="/donate" element = {<Donate />}/>
          <Route path="/learning" element = {<LearningGuide />}/>
          <Route path="/nearbyShops" element = {<Shops/>}/>
          <Route path="/registershop" element = {<RegisterShop/>}/>
          <Route path="/customerprofile" element = {<CustomerProfile/>}/>
          <Route path="/barberprofile" element = {<BarberProfile/>}/>
          <Route path="/privacy-policy" element = {<PrivacyPolicy/>}/>
          <Route path="/timeSlot-create" element = {<TemplateForm/>}/>
          <Route path="/barberDashboard" element = {<BarberDashboard/>}/>
          <Route path="/customerDashboard" element = {<CustomerDashboard/>}/>
          {/* <Route path="/timeSlot-manager" element = {<TimeSlotManager/>}/> */}
          <Route path="/barber-profile-update" element = {<BarberProfileUpdate/>}/>
          <Route path="/payment" element = {<Payment/>}/>
          <Route path="/nearbyShops/:shopId/shopinfo" element = {<DateTimeSelection/>}/>
          <Route path="*" element={<Error />}/>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminHome/>}/>
            <Route path="users" element={<AdminUsers/>}/>
            <Route path="contacts" element={<AdminContacts/>}/>
            <Route path="services" element={<AdminServices/>}/>
            <Route path="shops" element={<AdminShops/>}/>
            <Route path="requests" element={<AdminPendingShops/>}/>
            <Route path="users/:id/edit" element={<AdminUserUpdate/>}/>
            <Route path="shops/:id/edit" element={<AdminShopUpdate/>}/>
          </Route>
        </Routes>
      </LoginProvider>
      <Footer/>
    </BrowserRouter>
    </>
  )
}

export default App;
