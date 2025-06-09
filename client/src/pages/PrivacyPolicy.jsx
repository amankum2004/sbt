import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="bg-gray-50 min-h-screen py-10 px-4 md:px-8">
            <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-xl shadow-md">
                <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800 text-center">Privacy Policy</h1>

                <p className="mb-4 text-gray-700">
                    Welcome to our Salon Booking Time website. We are committed to protecting your personal information and your right to privacy.
                </p>

                <p className="mb-6 text-gray-700">
                    This Privacy Policy outlines how Salon Booking Time collects, uses, maintains, and discloses information collected from users of the website. Your privacy is important to us, and we are committed to protecting your personal information.
                </p>

                <Section title="Information Collection and Use">
                    <p>
                        We may collect personal identification information from users in various ways, including when users visit our site, register, and interact with our services. Users may be asked for their name, email address, mailing address, phone number, etc.
                    </p>
                </Section>

                <Section title="Terms and Conditions">
                    <p>
                        “We”, “us”, or “our” refers to Salon Booking Time, Indian Institute of Technology Mandi, HIMACHAL PRADESH 175005. “You” or “User” refers to any visitor of our website.
                    </p>
                    <ul className="list-disc list-inside space-y-2">
                        <li>Website content is subject to change without notice.</li>
                        <li>We provide no guarantees on accuracy or completeness of site content.</li>
                        <li>Use of site content is at your own risk.</li>
                        <li>All material on the site is owned or licensed by us. Unauthorized use is prohibited.</li>
                        <li>Trademarks not owned by us are acknowledged accordingly.</li>
                        <li>Unauthorized use may lead to claims or criminal charges.</li>
                        <li>Links to external websites are for convenience only.</li>
                        <li>You may not link to our site without prior permission.</li>
                        <li>Disputes are subject to Indian law.</li>
                        <li>We are not liable for declined payment transactions due to user limits.</li>
                    </ul>
                </Section>

                <Section title="1. Information We Collect">
                    <p>We collect personal information such as:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Name</li>
                        <li>Email Address</li>
                        <li>Phone Number</li>
                        <li>Payment Details (via third-party providers)</li>
                        <li>Salon business info (shop name, services, etc.)</li>
                    </ul>
                </Section>

                <Section title="2. How We Use Your Information">
                    <ul className="list-disc list-inside space-y-1">
                        <li>Register and manage accounts</li>
                        <li>Process bookings and payments</li>
                        <li>Send notifications and updates</li>
                        <li>Enhance user experience</li>
                    </ul>
                </Section>

                <Section title="3. Sharing Your Information">
                    <ul className="list-disc list-inside space-y-1">
                        <li>Third-party payment processors</li>
                        <li>Salon owners for appointment handling</li>
                        <li>Legal authorities as required</li>
                    </ul>
                </Section>

                <Section title="4. Data Security">
                    <p>
                        We use standard industry practices to secure your data. However, no online transmission is 100% secure.
                    </p>
                </Section>

                <Section title="5. Your Rights">
                    <p>
                        You can request to access, modify, or delete your data. Email: <strong>sbthelp123@gmail.com</strong>
                    </p>
                </Section>

                <Section title="6. Cancellation & Refund Policy">
                    <ul className="list-disc list-inside space-y-1">
                        <li>Cancellations must be made at least 48 hours in advance.</li>
                        <li>Approved refunds take 6–8 days to process.</li>
                    </ul>
                </Section>

                <Section title="7. Changes to This Policy">
                    <p>
                        We may update this policy periodically. Please check this page regularly.
                    </p>
                </Section>

                <Section title="8. Contact Us">
                    <p>
                        Email: <strong>sbthelp123@gmail.com</strong><br />
                        Phone: <strong>+91 8810269376</strong>
                    </p>
                </Section>
            </div>
        </div>
    );
};

const Section = ({ title, children }) => (
    <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">{title}</h2>
        <div className="text-gray-700 space-y-2">{children}</div>
    </div>
);

export default PrivacyPolicy;
