import React from "react"; 
import { useLogin } from "../components/LoginContext";

export const Home = () => {
    const { loggedIn, user } = useLogin();

    return(
        <>
        <main>
            <section className="bg-gradient-to-r from-gray-100 to-indigo-100 py-16">
                <div className="mx-auto  md:grid-cols-2 gap-8 max-w-[1000px]">
                    <div>
                        <section className="text-center bg-white p-10 shadow-lg rounded-lg">
                            <p className="text-lg font-bold text-blue-500 mb-6">
                                Welcome 
                                {user ? (  
                                <>
                                    <span className="text-red-500 italic font-bold mx-1">{user.name}</span> to our website
                                </>
                                ) : ` to our website `}
                            </p>
                            <p className="text-gray-700 text-base mb-6">
                                Discover the easiest way to book your salon appointments! Whether you’re looking for a haircut, styling, manicure, or any other beauty treatment, we’ve got you covered. With just a few clicks, you can find the best salons in your area and book your preferred time slot instantly. No more waiting or unnecessary phone calls—your perfect salon experience is just a click away!
                            </p>
                            {loggedIn ? (
                                <a href="/nearbyShops">
                                    <button className="bg-purple-600 text-white py-3 px-6 rounded-md hover:bg-purple-700">
                                        Make an Appointment
                                    </button>
                                </a>
                            ) : (
                                <a href="/login">
                                    <button className="bg-purple-600 text-white py-3 px-6 rounded-md hover:bg-purple-700">
                                        Make an Appointment
                                    </button>
                                </a>
                            )}
                        </section>

                        <section className="mt-10">
                            <h2 className="text-2xl font-semibold text-center mb-8 text-gray-800">Why Choose Us?</h2>
                            <div className="flex flex-wrap justify-center gap-6">
                                <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-5/12">
                                    <h3 className="text-lg font-semibold text-purple-500 mb-4">Convenience</h3>
                                    <p className="text-gray-600 text-base">Book appointments anytime, anywhere, from your mobile or desktop.</p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-5/12">
                                    <h3 className="text-lg font-semibold text-purple-500 mb-4">Choice</h3>
                                    <p className="text-gray-600 text-base">Browse a wide range of salons and services tailored to your needs.</p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-5/12">
                                    <h3 className="text-lg font-semibold text-purple-500 mb-4">Real-Time Availability</h3>
                                    <p className="text-gray-600 text-base">See available slots in real-time and choose what fits your schedule best.</p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-5/12">
                                    <h3 className="text-lg font-semibold text-purple-500 mb-4">Reviews & Ratings</h3>
                                    <p className="text-gray-600 text-base">Make informed decisions with reviews and ratings from other customers.</p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-5/12">
                                    <h3 className="text-lg font-semibold text-purple-500 mb-4">Secure Payments</h3>
                                    <p className="text-gray-600 text-base">Pay securely online and focus on your beauty experience.</p>
                                </div>
                            </div>
                        </section>

                        <section className="mt-10">
                            <h2 className="text-2xl font-semibold text-center mb-8 text-gray-800">How It Works</h2>
                            <div className="flex flex-wrap justify-center gap-6">
                                <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-5/12">
                                    <h3 className="text-lg font-semibold text-purple-500 mb-4">Search</h3>
                                    <p className="text-gray-600 text-base">Find salons near you offering the services you need.</p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-5/12">
                                    <h3 className="text-lg font-semibold text-purple-500 mb-4">Select</h3>
                                    <p className="text-gray-600 text-base">Choose your preferred salon, service, and time slot.</p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-5/12">
                                    <h3 className="text-lg font-semibold text-purple-500 mb-4">Book</h3>
                                    <p className="text-gray-600 text-base">Confirm your booking and get instant confirmation.</p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-5/12">
                                    <h3 className="text-lg font-semibold text-purple-500 mb-4">Enjoy</h3>
                                    <p className="text-gray-600 text-base">Show up at the salon, relax, and enjoy your beauty treatment.</p>
                                </div>
                            </div>
                            <div className="text-center mt-8">
                                <p className="text-xl text-gray-700 mb-6">Ready to book your next appointment?</p>
                                {loggedIn ? (
                                    <a href="/nearbyShops">
                                        <button className="bg-purple-600 text-white py-3 px-6 rounded-md hover:bg-purple-700">
                                            Book your favorite salon now!
                                        </button>
                                    </a>
                                ) : (
                                    <a href="/login">
                                        <button className="bg-purple-600 text-white py-3 px-6 rounded-md hover:bg-purple-700">
                                            Book your favorite salon now!
                                        </button>
                                    </a>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </section>
        </main>
        </>
    )
}

