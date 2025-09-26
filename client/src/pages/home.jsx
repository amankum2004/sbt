import React from "react";
import { useLogin } from "../components/LoginContext";
import { motion } from "framer-motion";

export const Home = () => {
    const { loggedIn, user } = useLogin();

    return (
        <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-6xl mx-auto"
            >
                {/* Welcome Section */}
                <section className="bg-white p-10 rounded-2xl shadow-xl text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-purple-800 mb-4">
                        Welcome
                        {user ? (
                            <span className="text-pink-600 italic font-bold mx-2">{user.name}</span>
                        ) : (
                            " "
                        )}
                        to Salonify!
                    </h1>
                    <p className="text-gray-600 text-lg mb-6">
                        Discover the easiest way to book your salon appointments! Find the best salons, browse services, and book your perfect time slot — all in just a few clicks.
                    </p>
                    <a href={loggedIn ? "/nearbyShops" : "/login"}>
                        <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all">
                            Make an Appointment
                        </button>
                    </a>
                </section>

                {/* Why Choose Us */}
                <section className="mb-16">
                    <h2 className="text-2xl font-semibold text-center text-gray-800 mb-10">Why Choose Us?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            ["Convenience", "Book appointments anytime, anywhere, from your mobile or desktop."],
                            ["Choice", "Browse a wide range of salons and services tailored to your needs."],
                            ["Real-Time Availability", "See available slots in real-time and choose what fits your schedule best."],
                            ["Reviews & Ratings", "Make informed decisions with reviews and ratings from other customers."],
                            ["Secure Payments", "Pay securely online and focus on your beauty experience."],
                            ["Personalized Experience", "Save your preferences and get customized recommendations."]
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

                {/* How It Works */}
                <section>
                    <h2 className="text-2xl font-semibold text-center text-gray-800 mb-10">How It Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            ["Search", "Find salons near you offering the services you need."],
                            ["Select", "Choose your preferred salon, service, and time slot."],
                            ["Book", "Confirm your booking and get instant confirmation."],
                            ["Enjoy", "Show up at the salon, relax, and enjoy your beauty treatment."]
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

                    <div className="text-center mt-12">
                        <p className="text-xl text-gray-700 mb-6">Ready to book your next appointment?</p>
                        <a href={loggedIn ? "/nearbyShops" : "/login"}>
                            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all">
                                Book Your Favorite Salon Now!
                            </button>
                        </a>
                    </div>
                </section>
            </motion.div>
        </main>
    );
};





// import React from "react";
// import { useLogin } from "../components/LoginContext";

// export const Home = () => {
//     const { loggedIn, user } = useLogin();

//     return(
//         <>
//         <main>
//             <section className="bg-gradient-to-r from-gray-100 to-indigo-100 py-16">
//                 <div className="mx-auto  md:grid-cols-2 gap-8 max-w-[1000px]">
//                     <div>
//                         <section className="text-center bg-white p-10 shadow-lg rounded-lg">
//                             <p className="text-lg font-bold text-blue-500 mb-6">
//                                 Welcome
//                                 {user ? (
//                                 <>
//                                     <span className="text-red-500 italic font-bold mx-1">{user.name}</span> to our website
//                                 </>
//                                 ) : ` to our website `}
//                             </p>
//                             <p className="text-gray-700 text-base mb-6">
//                                 Discover the easiest way to book your salon appointments! Whether you’re looking for a haircut, styling, manicure, or any other beauty treatment, we’ve got you covered. With just a few clicks, you can find the best salons in your area and book your preferred time slot instantly. No more waiting or unnecessary phone calls—your perfect salon experience is just a click away!
//                             </p>
//                             {loggedIn ? (
//                                 <a href="/nearbyShops">
//                                     <button className="bg-purple-600 text-white py-3 px-6 rounded-md hover:bg-purple-700">
//                                         Make an Appointment
//                                     </button>
//                                 </a>
//                             ) : (
//                                 <a href="/login">
//                                     <button className="bg-purple-600 text-white py-3 px-6 rounded-md hover:bg-purple-700">
//                                         Make an Appointment
//                                     </button>
//                                 </a>
//                             )}
//                         </section>

//                         <section className="mt-10">
//                             <h2 className="text-2xl font-semibold text-center mb-8 text-gray-800">Why Choose Us?</h2>
//                             <div className="flex flex-wrap justify-center gap-6">
//                                 <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-5/12">
//                                     <h3 className="text-lg font-semibold text-purple-500 mb-4">Convenience</h3>
//                                     <p className="text-gray-600 text-base">Book appointments anytime, anywhere, from your mobile or desktop.</p>
//                                 </div>
//                                 <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-5/12">
//                                     <h3 className="text-lg font-semibold text-purple-500 mb-4">Choice</h3>
//                                     <p className="text-gray-600 text-base">Browse a wide range of salons and services tailored to your needs.</p>
//                                 </div>
//                                 <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-5/12">
//                                     <h3 className="text-lg font-semibold text-purple-500 mb-4">Real-Time Availability</h3>
//                                     <p className="text-gray-600 text-base">See available slots in real-time and choose what fits your schedule best.</p>
//                                 </div>
//                                 <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-5/12">
//                                     <h3 className="text-lg font-semibold text-purple-500 mb-4">Reviews & Ratings</h3>
//                                     <p className="text-gray-600 text-base">Make informed decisions with reviews and ratings from other customers.</p>
//                                 </div>
//                                 <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-5/12">
//                                     <h3 className="text-lg font-semibold text-purple-500 mb-4">Secure Payments</h3>
//                                     <p className="text-gray-600 text-base">Pay securely online and focus on your beauty experience.</p>
//                                 </div>
//                             </div>
//                         </section>

//                         <section className="mt-10">
//                             <h2 className="text-2xl font-semibold text-center mb-8 text-gray-800">How It Works</h2>
//                             <div className="flex flex-wrap justify-center gap-6">
//                                 <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-5/12">
//                                     <h3 className="text-lg font-semibold text-purple-500 mb-4">Search</h3>
//                                     <p className="text-gray-600 text-base">Find salons near you offering the services you need.</p>
//                                 </div>
//                                 <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-5/12">
//                                     <h3 className="text-lg font-semibold text-purple-500 mb-4">Select</h3>
//                                     <p className="text-gray-600 text-base">Choose your preferred salon, service, and time slot.</p>
//                                 </div>
//                                 <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-5/12">
//                                     <h3 className="text-lg font-semibold text-purple-500 mb-4">Book</h3>
//                                     <p className="text-gray-600 text-base">Confirm your booking and get instant confirmation.</p>
//                                 </div>
//                                 <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-5/12">
//                                     <h3 className="text-lg font-semibold text-purple-500 mb-4">Enjoy</h3>
//                                     <p className="text-gray-600 text-base">Show up at the salon, relax, and enjoy your beauty treatment.</p>
//                                 </div>
//                             </div>
//                             <div className="text-center mt-8">
//                                 <p className="text-xl text-gray-700 mb-6">Ready to book your next appointment?</p>
//                                 {loggedIn ? (
//                                     <a href="/nearbyShops">
//                                         <button className="bg-purple-600 text-white py-3 px-6 rounded-md hover:bg-purple-700">
//                                             Book your favorite salon now!
//                                         </button>
//                                     </a>
//                                 ) : (
//                                     <a href="/login">
//                                         <button className="bg-purple-600 text-white py-3 px-6 rounded-md hover:bg-purple-700">
//                                             Book your favorite salon now!
//                                         </button>
//                                     </a>
//                                 )}
//                             </div>
//                         </section>
//                     </div>
//                 </div>
//             </section>
//         </main>
//         </>
//     )
// }

