import React from "react";
import { useLogin } from "../components/LoginContext";
import { motion } from "framer-motion";

export const Home = () => {
    const { loggedIn, user } = useLogin();

    // Structured data for LocalBusiness schema
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "BeautySalon",
        "name": "SalonHub - Online Salon Booking Platform",
        "description": "Book the best salon & spa services at home or in-salon across India. Haircuts, facials, manicure, pedicure, bridal makeup & more beauty services.",
        "url": "https://salonhub.co.in",
        "telephone": "+91-8810269376",
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "IN",
            "addressRegion": "India"
        },
        "areaServed": "India",
        "serviceType": "Salon booking,Salon appointment booking online, Beauty services, Spa treatments",
        "sameAs": []
    };

    const getButtonText = () => {
    if (!loggedIn) return "Book Salon Appointment Now";
    
    switch(user?.usertype) {
        case 'shopOwner':
        case 'ShopOwner':
            return "Dashboard";
        case 'admin':
            return "Admin Dashboard";
        default: // customer or any other role
            return "Book Salon Appointment Now";
    }
    };

    const getButtonLink = () => {
    if (!loggedIn) return "/login";
    
    switch(user?.usertype) {
        case 'shopOwner':
        case 'ShopOwner':
            return "/barberDashboard";
        case 'admin':
            return "/admin";
        default:
            return "/nearbyShops";
    }
    };

    return (
        <>
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            
            <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-6xl mx-auto"
                >
                    {/* Hero Section with Primary Keywords */}
                    <section className="bg-white p-10 rounded-2xl shadow-xl text-center mb-8 mt-6">
                        <h4 className="text-3xl md:text-4xl font-bold text-purple-800 mb-4">
                            Welcome
                            {user ? (
                                <span className="text-pink-600 italic font-bold mx-2">{user.name}</span>
                            ) : (
                                " "
                            )}
                            to SalonHub - Book Salon Appointment Online 
                        </h4>
                        <p className="text-gray-600 text-lg mb-6">
                            Discover the easiest way to <strong>book salon appointments online</strong>! 
                            Find the best <strong>beauty salons near you</strong>, browse services, and 
                            <strong> book your perfect time slot</strong> — all in just a few clicks. 
                            <strong> Hair salon booking</strong>, <strong>spa services</strong>, and 
                            <strong> beauty treatments</strong> made simple.
                        </p>
                        
                        <a href={getButtonLink()}>
                            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all">
                                {getButtonText()}
                            </button>
                        </a>

                        {/* <a href={loggedIn ? "/nearbyShops" : "/login"}>
                            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all">
                                Book Salon Appointment Now
                            </button>
                        </a> */}
                    </section>

                    {/* Services Section with Keywords */}
                    {/* <section className="mb-16">
                        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-10">
                            Popular Salon Services in India
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                ["Haircut & Styling", "Professional haircut, hair styling, blow dry, and hair treatments for men and women"],
                                ["Bridal Makeup", "Expert bridal makeup artists for your special day with trial sessions"],
                                ["Facial & Skin Care", "Gold facial, organic facial, clean-up, and skin treatments"],
                                ["Manicure & Pedicure", "Classic and spa manicure pedicure services with nail art"],
                                ["Waxing & Threading", "Full body waxing, facial threading, and hair removal services"],
                                ["Massage & Spa", "Body massage, head massage, and full spa treatments for relaxation"]
                            ].map(([title, desc]) => (
                                <motion.div
                                    key={title}
                                    whileHover={{ y: -4 }}
                                    className="bg-white p-6 rounded-xl shadow-md border border-purple-100"
                                >
                                    <h3 className="text-lg font-semibold text-purple-600 mb-3">{title}</h3>
                                    <p className="text-gray-600">{desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </section> */}

                    {/* Why Choose Us - Optimized for SEO */}
                    <section className="mb-16">
                        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-10">
                            Why Choose SalonHub for Online Salon Booking?
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                ["Easy Online Booking", "Book salon appointments 24/7 from your mobile or desktop. Instant confirmation for all beauty services."],
                                ["Best Salons Near You", "Find top-rated beauty salons and spas in your city with genuine customer reviews and ratings."],
                                ["Real-Time Slot Availability", "See available time slots in real-time and choose what fits your schedule best for hair and beauty services."],
                                ["Verified Customer Reviews", "Make informed decisions with authentic reviews and ratings from other customers."],
                                ["Wide Service Selection", "From basic haircuts to bridal packages, find all beauty services in one platform."],
                                ["Secure Online Payments", "Pay securely online with multiple payment options and focus on your beauty experience."],
                            ].map(([title, desc]) => (
                                <motion.div
                                    key={title}
                                    whileHover={{ y: -4 }}
                                    className="bg-white p-6 rounded-xl shadow-md"
                                >
                                    <h3 className="text-lg font-semibold text-purple-600 mb-3">{title}</h3>
                                    <p className="text-gray-600">{desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* How It Works - Optimized */}
                    <section className="mb-16">
                        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-10">
                            How to Book Salon Online
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                ["Search Salons", "Find beauty salons near you offering hair, skin, and beauty services you need."],
                                ["Select Time Slot", "Select your preferred time slot, arrive at the salon, and enjoy your beauty treatment with ease."],
                                ["Choose Service", "Choose your preferred salon, services like haircut, facial, or massage, and convenient time slot."],
                                ["Confirm Booking", "Book your appointment and get instant confirmation with all details."]
                            ].map(([title, desc], index) => (
                                <motion.div
                                    key={title}
                                    whileHover={{ y: -4 }}
                                    className="bg-white p-6 rounded-xl shadow-md text-center"
                                >
                                    <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                                        {index + 1}
                                    </div>
                                    <h3 className="text-lg font-semibold text-purple-600 mb-3">{title}</h3>
                                    <p className="text-gray-600 text-sm">{desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* Cities Section for Local SEO */}
                    <section className="mb-6 bg-white p-8 rounded-2xl shadow-md">
                        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
                            Book Salon Services in Major Indian Cities
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
                            {["Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad", 
                              "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Chandigarh", "Noida"].map((city) => (
                                <div key={city} className="bg-purple-50 p-3 rounded-lg hover:bg-purple-100 transition-colors">
                                    <span className="text-purple-700 font-medium">{city}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-gray-600 mt-3">
                            And many more cities across India! Find local beauty salons and spas in your area.
                        </p>
                    </section>

                    {/* FAQ Section for SEO */}
                    <section className="bg-white p-8 rounded-2xl shadow-md">
                        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
                            Frequently Asked Questions - Salon Booking
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                ["How do I book a salon appointment online?", "Simply search for salons near you, select your services and preferred time slot, and confirm your booking. It's quick and easy!"],
                                ["Can I see salon reviews before booking?", "Yes! All salons on SalonHub have genuine customer reviews and ratings to help you choose the best beauty services."],
                                ["What beauty services can I book?", "You can book haircuts, styling, facials, waxing, manicure, pedicure, bridal makeup, spa treatments, and many more beauty services."],
                                ["Is online payment secure?", "Absolutely! We use secure payment gateways to ensure your transactions are safe and protected."]
                            ].map(([question, answer]) => (
                                <div key={question} className="border border-purple-100 rounded-lg p-4">
                                    <h3 className="font-semibold text-purple-700 mb-2">{question}</h3>
                                    <p className="text-gray-600 text-sm">{answer}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Final CTA */}
                    <div className="text-center mt-6 bg-gradient-to-r from-purple-600 to-pink-600 p-8 rounded-2xl text-white">
                        <h2 className="text-2xl font-bold mb-4">Ready to Book Your Salon Appointment?</h2>
                        <p className="text-lg mb-6 opacity-90">
                            Join thousands of satisfied customers who book their beauty services through SalonHub
                        </p>
                        <a href={loggedIn ? "/nearbyShops" : "/login"}>
                            <button className="px-8 py-4 bg-white text-purple-600 font-bold rounded-lg shadow-lg hover:shadow-xl transition-all text-lg">
                                Book Your Favorite Salon Now!
                            </button>
                        </a>
                        {/* <p className="text-sm mt-4 opacity-80">
                            • Easy booking • Best salons • Real-time availability • Secure payments
                        </p> */}
                    </div>
                </motion.div>
            </main>
        </>
    );
};







// import React from "react";
// import { useLogin } from "../components/LoginContext";
// import { motion } from "framer-motion";

// export const Home = () => {
//     const { loggedIn, user } = useLogin();

//     return (
//         <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
//             <motion.div
//                 initial={{ opacity: 0, y: 30 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6 }}
//                 className="max-w-6xl mx-auto"
//             >
//                 {/* Welcome Section */}
//                 <section className="bg-white p-10 rounded-2xl shadow-xl text-center mb-8 mt-8">
//                     <h1 className="text-3xl md:text-4xl font-bold text-purple-800 mb-4">
//                         Welcome
//                         {user ? (
//                             <span className="text-pink-600 italic font-bold mx-2">{user.name}</span>
//                         ) : (
//                             " "
//                         )}
//                         to SalonHub!
//                     </h1>
//                     <p className="text-gray-600 text-lg mb-6">
//                         Discover the easiest way to book your salon appointments! Find the best salons, browse services, and book your perfect time slot — all in just a few clicks.
//                     </p>
//                     <a href={loggedIn ? "/nearbyShops" : "/login"}>
//                         <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all">
//                             Make an Appointment
//                         </button>
//                     </a>
//                 </section>

//                 {/* Why Choose Us */}
//                 <section className="mb-16">
//                     <h2 className="text-2xl font-semibold text-center text-gray-800 mb-10">Why Choose Us?</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                         {[
//                             ["Convenience", "Book appointments anytime, anywhere, from your mobile or desktop."],
//                             ["Choice", "Browse a wide range of salons and services tailored to your needs."],
//                             ["Real-Time Availability", "See available slots in real-time and choose what fits your schedule best."],
//                             ["Reviews & Ratings", "Make informed decisions with reviews and ratings from other customers."],
//                             ["Secure Payments", "Pay securely online and focus on your beauty experience."],
//                             ["Personalized Experience", "Save your preferences and get customized recommendations."]
//                         ].map(([title, desc]) => (
//                             <motion.div
//                                 key={title}
//                                 whileHover={{ y: -4 }}
//                                 className="bg-white p-6 rounded-xl shadow-md"
//                             >
//                                 <h3 className="text-lg font-semibold text-purple-600 mb-3">{title}</h3>
//                                 <p className="text-gray-600">{desc}</p>
//                             </motion.div>
//                         ))}
//                     </div>
//                 </section>

//                 {/* How It Works */}
//                 <section>
//                     <h2 className="text-2xl font-semibold text-center text-gray-800 mb-10">How It Works</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                         {[
//                             ["Search", "Find salons near you offering the services you need."],
//                             ["Select", "Choose your preferred salon, service, and time slot."],
//                             ["Book", "Confirm your booking and get instant confirmation."],
//                             ["Enjoy", "Show up at the salon, relax, and enjoy your beauty treatment."]
//                         ].map(([title, desc]) => (
//                             <motion.div
//                                 key={title}
//                                 whileHover={{ y: -4 }}
//                                 className="bg-white p-6 rounded-xl shadow-md"
//                             >
//                                 <h3 className="text-lg font-semibold text-purple-600 mb-3">{title}</h3>
//                                 <p className="text-gray-600">{desc}</p>
//                             </motion.div>
//                         ))}
//                     </div>

//                     <div className="text-center mt-12">
//                         <p className="text-xl text-gray-700 mb-6">Ready to book your next appointment?</p>
//                         <a href={loggedIn ? "/nearbyShops" : "/login"}>
//                             <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all">
//                                 Book Your Favorite and Nearest Salon Now!
//                             </button>
//                         </a>
//                     </div>
//                 </section>
//             </motion.div>
//         </main>
//     );
// };
