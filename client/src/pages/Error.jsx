import React from "react";
import { NavLink } from "react-router-dom";

export const Error = () => {
    return (
        <>
            <section className="flex justify-center items-center h-screen bg-gray-100 text-center">
                <div className="max-w-lg mx-auto p-5 bg-white rounded-lg shadow-lg">
                    <h2 className="text-9xl font-bold text-red-600 mb-4">404</h2>
                    <h2 className="text-2xl text-gray-700 mb-6">Sorry!!, page not found</h2>

                    <div className="mt-6">
                        <NavLink
                            to="/"
                            className="inline-block px-6 py-3 mb-4 text-white bg-blue-500 rounded-md transition duration-300 hover:bg-blue-600"
                        >
                            Return to home page
                        </NavLink>
                        <br />
                        <NavLink
                            to="/contact"
                            className="inline-block px-6 py-3 text-white bg-red-500 rounded-md transition duration-300 hover:bg-red-600"
                        >
                            Report problem
                        </NavLink>
                    </div>
                </div>
            </section>
        </>
    );
};
