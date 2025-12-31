// TermsOfService.js
import React from 'react';

const TermsOfService = () => {
    return (
        <div className="bg-gray-50 min-h-screen py-10 px-4 md:px-8">
            <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-xl shadow-md">
                <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800 text-center">
                    Terms of Service
                </h1>
                
                <p className="mb-6 text-gray-700 text-center">
                    Last Updated: {new Date().toLocaleDateString('en-IN')}
                </p>

                <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <p className="text-gray-700">
                        <strong>Note:</strong> By accessing or using SalonHub's services, you agree to be bound by these Terms of Service. If you disagree with any part, please discontinue use immediately.
                    </p>
                </div>

                <Section title="1. Acceptance of Terms">
                    <p>
                        Welcome to SalonHub ("we," "our," or "us"). These Terms of Service govern your use of our website, mobile application, and services. By accessing or using SalonHub, you acknowledge that you have read, understood, and agree to be bound by these terms.
                    </p>
                </Section>

                <Section title="2. Definitions">
                    <ul className="list-disc list-inside space-y-2">
                        <li><strong>"Service"</strong> refers to the SalonHub platform connecting customers with salons.</li>
                        <li><strong>"User"</strong> means any individual accessing or using our services.</li>
                        <li><strong>"Customer"</strong> refers to users booking salon services.</li>
                        <li><strong>"Salon/Stylist"</strong> refers to registered service providers on our platform.</li>
                        <li><strong>"Content"</strong> includes text, images, reviews, and other materials on the platform.</li>
                    </ul>
                </Section>

                <Section title="3. User Accounts">
                    <ul className="list-disc list-inside space-y-2">
                        <li>You must be at least 18 years old to create an account.</li>
                        <li>You are responsible for maintaining account confidentiality.</li>
                        <li>Provide accurate, current, and complete information.</li>
                        <li>Notify us immediately of any unauthorized access.</li>
                        <li>We reserve the right to suspend or terminate accounts violating terms.</li>
                    </ul>
                </Section>

                <Section title="4. Booking and Appointments">
                    <ul className="list-disc list-inside space-y-2">
                        <li>Appointments are subject to salon availability.</li>
                        <li>Customers must arrive on time; late arrivals may result in shortened service.</li>
                        <li>Salons reserve the right to refuse service.</li>
                        <li>Booking confirmations will be sent via email/SMS.</li>
                    </ul>
                </Section>

                <Section title="5. Payments">
                    <ul className="list-disc list-inside space-y-2">
                        <li>All prices are in Indian Rupees (₹).</li>
                        <li>We use secure third-party payment processors.</li>
                        <li>Payment must be completed to confirm appointments.</li>
                        <li>Refunds follow our Cancellation Policy (Section 8).</li>
                        <li>Additional charges may apply for extra services requested.</li>
                    </ul>
                </Section>

                <Section title="6. User Conduct">
                    <p className="mb-2">You agree not to:</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li>Use the service for illegal purposes.</li>
                        <li>Harass, threaten, or abuse other users or service providers.</li>
                        <li>Post false, misleading, or defamatory content.</li>
                        <li>Impersonate any person or entity.</li>
                        <li>Interfere with the platform's functionality.</li>
                        <li>Attempt to gain unauthorized access to systems.</li>
                    </ul>
                </Section>

                <Section title="7. Salon/Stylist Responsibilities">
                    <ul className="list-disc list-inside space-y-2">
                        <li>Provide accurate service descriptions and pricing.</li>
                        <li>Maintain professional standards and hygiene.</li>
                        <li>Honor confirmed appointments.</li>
                        <li>Handle customer data confidentially.</li>
                        <li>Obtain necessary licenses and permits.</li>
                        <li>Maintain appropriate insurance coverage.</li>
                    </ul>
                </Section>

                <Section title="8. Cancellation and Refund Policy">
                    <ul className="list-disc list-inside space-y-2">
                        <li>Cancellations must be made at least 2 hours before the appointment.</li>
                        <li>Late cancellations may incur charges as per individual salon policies.</li>
                        <li>Refunds for eligible cancellations are processed within 6-8 business days.</li>
                        <li>No-shows are non-refundable.</li>
                        <li>Salons may cancel appointments with notice; customers receive full refunds.</li>
                    </ul>
                </Section>

                <Section title="9. Intellectual Property">
                    <ul className="list-disc list-inside space-y-2">
                        <li>All platform content is owned by SalonHub or licensed to us.</li>
                        <li>You may not reproduce, distribute, or create derivative works.</li>
                        <li>User-generated content remains your property but grants us a license to use it.</li>
                        <li>The SalonHub name and logo are registered trademarks.</li>
                    </ul>
                </Section>

                <Section title="10. Reviews and Ratings">
                    <ul className="list-disc list-inside space-y-2">
                        <li>Users may post reviews and ratings based on actual experience.</li>
                        <li>Reviews must be truthful and not contain offensive language.</li>
                        <li>We reserve the right to remove inappropriate reviews.</li>
                        <li>Salons may respond professionally to reviews.</li>
                    </ul>
                </Section>

                <Section title="11. Limitation of Liability">
                    <ul className="list-disc list-inside space-y-2">
                        <li>We are not liable for service quality provided by salons.</li>
                        <li>We are not responsible for personal injury during salon visits.</li>
                        <li>Maximum liability is limited to the amount paid for the service.</li>
                        <li>We are not liable for indirect, incidental, or consequential damages.</li>
                    </ul>
                </Section>

                <Section title="12. Privacy">
                    <p>
                        Your privacy is important. Please review our <a href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</a> to understand how we collect and use your information.
                    </p>
                </Section>

                <Section title="13. Termination">
                    <p>
                        We may terminate or suspend your account for violations of these terms. You may terminate your account at any time by contacting us.
                    </p>
                </Section>

                <Section title="14. Changes to Terms">
                    <p>
                        We may modify these terms at any time. Continued use after changes constitutes acceptance. We will notify users of significant changes.
                    </p>
                </Section>

                <Section title="15. Governing Law">
                    <p>
                        These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Delhi.
                    </p>
                </Section>

                <Section title="16. Contact Information">
                    <div className="space-y-2">
                        <p><strong>Email:</strong> salonhub.business@gmail.com</p>
                        <p><strong>Phone:</strong> +91 8810269376</p>
                        <p><strong>Address:</strong> SalonHub, Delhi, India</p>
                    </div>
                </Section>

                <div className="mt-10 p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Acknowledgement</h3>
                    <p className="text-gray-700">
                        By using SalonHub, you acknowledge that you have read these Terms of Service, understand them, and agree to be bound by them. If you do not agree, please discontinue use of our services immediately.
                    </p>
                </div>
            </div>
        </div>
    );
};

const Section = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-3">{title}</h2>
        <div className="text-gray-700 space-y-3">{children}</div>
    </div>
);

export default TermsOfService;