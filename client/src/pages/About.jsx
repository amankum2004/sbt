// import { NavLink } from "react-router-dom"
// import { useAuth } from "../store/auth"
// import { useLogin } from "../components/LoginContext";
// import React from "react";

export const About = () => {
    // const {user} = useAuth();
    // const { user } = useLogin();

    return (
        <>
        <section className="about-section">
        <div className="about-container">
            <h1 className="about-heading">About SBT</h1>
            <p className="about-text">
            At SBT, we believe in making beauty accessible to everyone, at any time. Our platform was created with a simple mission: to connect customers with top-rated salons and make the booking process as seamless as possible.
            </p>
    
            <h2 className="about-subheading">Our Story</h2>
            <p className="about-text">
            We started with a vision to revolutionize the way people book their salon appointments. Frustrated with the traditional methods of booking over the phone or walking in without knowing if a slot was available, we set out to create a platform where users can easily find and book their desired services at their convenience.
            </p>

            <h2 className="about-subheading">What We Offer</h2>
            <ul className="about-list">
            <li><strong>Comprehensive Salon Listings:</strong> From haircuts to spa treatments, we feature a wide range of salons that cater to all your beauty needs.</li>
            <li><strong>User-Friendly Interface:</strong> Our platform is designed to be simple and intuitive, making it easy for you to find and book appointments in minutes.</li>
            <li><strong>Verified Reviews:</strong> Read genuine reviews from other users to help you choose the right salon and service.</li>
            <li><strong>Personalized Experience:</strong> Save your favorite salons, track your bookings, and receive personalized recommendations.</li>
            </ul>

            <h2 className="about-subheading">Our Commitment</h2>
            <p className="about-text">
            We are committed to providing a platform that is not only easy to use but also trustworthy and reliable. We work closely with salons to ensure that you receive the best service possible, every time. Your beauty journey should be stress-free, and we’re here to make that happen.
            </p>

            <p className="about-text">
            Thank you for choosing SBT. We look forward to helping you look and feel your best!
            </p>
        </div>
        </section>

        </>
    )
}