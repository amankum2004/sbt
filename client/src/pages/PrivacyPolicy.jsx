// PrivacyPolicy.jsx
import React from 'react';
import { 
  ShieldCheckIcon,
  LockClosedIcon,
  EyeIcon,
  DocumentTextIcon,
  UserGroupIcon,
  GlobeAltIcon,
  BuildingOffice2Icon,
  CheckCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const PrivacyPolicy = () => {
    const currentDate = new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-10 mt-3">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
                        <ShieldCheckIcon className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Protecting your privacy is our commitment. This policy explains how we collect, use, 
                        and protect your information on SalonHub.
                    </p>
                    <div className="mt-4 text-gray-500 text-sm">
                        Last Updated: {currentDate}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                    {/* Quick Navigation */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <DocumentTextIcon className="h-5 w-5 mr-2 text-purple-600" />
                            Quick Navigation
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {['Introduction', 'Information We Collect', 'How We Use Data', 'Data Sharing', 
                              'Your Rights', 'Security', 'Cookies', 'Contact'].map((item, index) => (
                                <a 
                                    key={index}
                                    href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                                    className="px-4 py-2 bg-white border border-purple-200 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                                >
                                    {item}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="p-8 md:p-12">
                        {/* Introduction */}
                        <Section 
                            id="introduction"
                            icon={<ShieldCheckIcon className="h-6 w-6" />}
                            title="Introduction & Scope"
                        >
                            <p className="text-gray-700 leading-relaxed">
                                Welcome to SalonHub. We are committed to protecting your personal information 
                                and your right to privacy. This Privacy Policy describes how we collect, use, 
                                disclose, and safeguard your information when you visit our website, use our 
                                mobile application, or engage with our services.
                            </p>
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="text-blue-800 text-sm">
                                    <strong>Please read this policy carefully.</strong> By accessing or using 
                                    SalonHub, you acknowledge that you have read, understood, and agree to be 
                                    bound by all the terms outlined in this Privacy Policy.
                                </p>
                            </div>
                        </Section>

                        {/* Information We Collect */}
                        <Section 
                            id="information-we-collect"
                            icon={<EyeIcon className="h-6 w-6" />}
                            title="1. Information We Collect"
                        >
                            <p className="text-gray-700 mb-4">
                                We collect several types of information for various purposes to provide and 
                                improve our service to you:
                            </p>

                            <div className="grid md:grid-cols-2 gap-6 mt-6">
                                <InfoCard
                                    title="Personal Information"
                                    color="purple"
                                    items={[
                                        "Full Name",
                                        "Email Address",
                                        "Phone Number",
                                        "Date of Birth (optional)",
                                        "Profile Picture"
                                    ]}
                                />

                                <InfoCard
                                    title="Booking Information"
                                    color="pink"
                                    items={[
                                        "Appointment Details",
                                        "Service Preferences",
                                        "Payment Information",
                                        "Special Requirements",
                                        "Feedback & Reviews"
                                    ]}
                                />

                                <InfoCard
                                    title="Technical Information"
                                    color="blue"
                                    items={[
                                        "IP Address",
                                        "Browser Type",
                                        "Device Information",
                                        "Cookies Data",
                                        "Usage Analytics"
                                    ]}
                                />

                                <InfoCard
                                    title="Business Information (Salons)"
                                    color="green"
                                    items={[
                                        "Business Name & Address",
                                        "Tax Identification",
                                        "Service Portfolio",
                                        "Staff Information",
                                        "Bank Details"
                                    ]}
                                />
                            </div>

                            <div className="mt-6 p-5 bg-gray-50 rounded-xl border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                    <LockClosedIcon className="h-4 w-4 mr-2" />
                                    Sensitive Information
                                </h4>
                                <p className="text-gray-700 text-sm">
                                    We do <strong>not</strong> collect sensitive personal information such as 
                                    biometric data, health records, or financial information beyond what's 
                                    necessary for payment processing. Payment details are handled securely 
                                    through our PCI-DSS compliant payment partners.
                                </p>
                            </div>
                        </Section>

                        {/* How We Use Your Information */}
                        <Section 
                            id="how-we-use-data"
                            icon={<BuildingOffice2Icon className="h-6 w-6" />}
                            title="2. How We Use Your Information"
                        >
                            <div className="space-y-4">
                                <UsageItem
                                    title="Service Delivery"
                                    description="Process bookings, manage appointments, and provide customer support"
                                />
                                <UsageItem
                                    title="Communication"
                                    description="Send appointment confirmations, reminders, and service updates"
                                />
                                <UsageItem
                                    title="Personalization"
                                    description="Customize your experience and recommend relevant services"
                                />
                                <UsageItem
                                    title="Business Operations"
                                    description="Analyze usage patterns and improve our platform"
                                />
                                <UsageItem
                                    title="Legal Compliance"
                                    description="Meet regulatory requirements and prevent fraud"
                                />
                            </div>

                            <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-xl">
                                <h4 className="font-semibold text-purple-800 mb-2">Legal Basis for Processing</h4>
                                <p className="text-purple-700 text-sm">
                                    We process your personal information based on:
                                </p>
                                <ul className="mt-2 space-y-1 text-sm text-purple-700">
                                    <li>• Your consent (for marketing communications)</li>
                                    <li>• Performance of contract (service delivery)</li>
                                    <li>• Legal obligations (tax compliance, fraud prevention)</li>
                                    <li>• Legitimate interests (service improvement)</li>
                                </ul>
                            </div>
                        </Section>

                        {/* Data Sharing & Disclosure */}
                        <Section 
                            id="data-sharing"
                            icon={<UserGroupIcon className="h-6 w-6" />}
                            title="3. Data Sharing & Disclosure"
                        >
                            <p className="text-gray-700 mb-4">
                                We may share your information with third parties only in the following 
                                circumstances:
                            </p>

                            <div className="space-y-6">
                                <SharingCard
                                    title="With Service Providers"
                                    items={[
                                        "Payment Processors (Razorpay, Stripe)",
                                        "Email Service Providers (Brevo)",
                                        "Cloud Hosting (AWS, Vercel)",
                                        "Analytics Providers (Google Analytics)"
                                    ]}
                                    requirement="All providers are bound by strict data protection agreements"
                                />

                                <SharingCard
                                    title="With Business Partners"
                                    items={[
                                        "Salon/Stylist Partners (for appointment management)",
                                        "Marketing Partners (with your consent)",
                                        "Integration Partners (for enhanced services)"
                                    ]}
                                    requirement="Only necessary information shared for service delivery"
                                />

                                <SharingCard
                                    title="Legal Requirements"
                                    items={[
                                        "Government Authorities (as required by law)",
                                        "Legal Proceedings (court orders, subpoenas)",
                                        "Fraud Prevention Agencies",
                                        "Regulatory Compliance"
                                    ]}
                                    requirement="Only when legally compelled"
                                />
                            </div>

                            <div className="mt-6 p-5 bg-yellow-50 rounded-xl border border-yellow-200">
                                <h4 className="font-semibold text-yellow-800 mb-2">No Sale of Personal Data</h4>
                                <p className="text-yellow-800 text-sm">
                                    We <strong>do not sell, rent, or trade</strong> your personal information 
                                    to third parties for their marketing purposes without your explicit consent.
                                </p>
                            </div>
                        </Section>

                        {/* Your Rights */}
                        <Section 
                            id="your-rights"
                            icon={<ShieldCheckIcon className="h-6 w-6" />}
                            title="4. Your Rights & Choices"
                        >
                            <div className="grid md:grid-cols-2 gap-6">
                                <RightCard
                                    title="Access & Portability"
                                    description="Request access to your data and receive it in a portable format"
                                />
                                <RightCard
                                    title="Correction"
                                    description="Update or correct inaccurate personal information"
                                />
                                <RightCard
                                    title="Deletion"
                                    description="Request deletion of your personal data under certain conditions"
                                />
                                <RightCard
                                    title="Objection"
                                    description="Object to processing of your personal data"
                                />
                                <RightCard
                                    title="Restriction"
                                    description="Request restriction of processing under certain conditions"
                                />
                                <RightCard
                                    title="Withdraw Consent"
                                    description="Withdraw consent at any time where processing is based on consent"
                                />
                            </div>

                            <div className="mt-6 p-5 bg-green-50 rounded-xl">
                                <h4 className="font-semibold text-green-800 mb-2">How to Exercise Your Rights</h4>
                                <p className="text-green-700 text-sm">
                                    To exercise any of these rights, please contact us at{' '}
                                    <a href="mailto:salonhub.business@gmail.com" className="font-semibold underline">
                                        salonhub.business@gmail.com
                                    </a>
                                </p>
                                <p className="text-green-700 text-sm mt-2">
                                    We will respond to your request within <strong>30 days</strong> and may 
                                    require identity verification for security purposes.
                                </p>
                            </div>
                        </Section>

                        {/* Data Security */}
                        <Section 
                            id="security"
                            icon={<LockClosedIcon className="h-6 w-6" />}
                            title="5. Data Security Measures"
                        >
                            <div className="space-y-4">
                                <SecurityMeasure
                                    title="Encryption"
                                    description="All data in transit uses TLS 1.2+ encryption"
                                />
                                <SecurityMeasure
                                    title="Access Controls"
                                    description="Role-based access with multi-factor authentication"
                                />
                                <SecurityMeasure
                                    title="Regular Audits"
                                    description="Security audits and vulnerability assessments"
                                />
                                <SecurityMeasure
                                    title="Employee Training"
                                    description="Regular data protection training for staff"
                                />
                                <SecurityMeasure
                                    title="Incident Response"
                                    description="Established procedures for data breach response"
                                />
                            </div>

                            <div className="mt-6 p-5 bg-red-50 rounded-xl border border-red-200">
                                <h4 className="font-semibold text-red-800 mb-2">Data Retention</h4>
                                <p className="text-red-700 text-sm">
                                    We retain personal information only for as long as necessary to fulfill 
                                    the purposes outlined in this policy, unless a longer retention period 
                                    is required or permitted by law.
                                </p>
                                <ul className="mt-2 text-sm text-red-700 space-y-1">
                                    <li>• Active accounts: Until account deletion request</li>
                                    <li>• Booking records: 5 years for tax and legal purposes</li>
                                    <li>• Marketing data: Until consent withdrawal</li>
                                    <li>• Inactive accounts: Deleted after 2 years of inactivity</li>
                                </ul>
                            </div>
                        </Section>

                        {/* Cookies & Tracking */}
                        <Section 
                            id="cookies"
                            icon={<GlobeAltIcon className="h-6 w-6" />}
                            title="6. Cookies & Tracking Technologies"
                        >
                            <p className="text-gray-700 mb-4">
                                We use cookies and similar tracking technologies to track activity on our 
                                service and hold certain information.
                            </p>

                            <div className="overflow-x-auto mt-4">
                                <table className="min-w-full bg-white border border-gray-300 rounded-lg">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">Cookie Type</th>
                                            <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">Purpose</th>
                                            <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="hover:bg-gray-50">
                                            <td className="py-3 px-4 border-b">Essential</td>
                                            <td className="py-3 px-4 border-b">Session management, security</td>
                                            <td className="py-3 px-4 border-b">Session</td>
                                        </tr>
                                        <tr className="hover:bg-gray-50">
                                            <td className="py-3 px-4 border-b">Functional</td>
                                            <td className="py-3 px-4 border-b">Preferences, settings</td>
                                            <td className="py-3 px-4 border-b">30 days</td>
                                        </tr>
                                        <tr className="hover:bg-gray-50">
                                            <td className="py-3 px-4 border-b">Analytics</td>
                                            <td className="py-3 px-4 border-b">Usage analysis, improvements</td>
                                            <td className="py-3 px-4 border-b">2 years</td>
                                        </tr>
                                        <tr className="hover:bg-gray-50">
                                            <td className="py-3 px-4 border-b">Marketing</td>
                                            <td className="py-3 px-4 border-b">Personalized ads (with consent)</td>
                                            <td className="py-3 px-4 border-b">90 days</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-6 p-5 bg-gray-50 rounded-xl">
                                <h4 className="font-semibold text-gray-800 mb-2">Managing Cookies</h4>
                                <p className="text-gray-700 text-sm">
                                    You can manage your cookie preferences through your browser settings. 
                                    However, disabling essential cookies may affect your ability to use 
                                    certain features of our service.
                                </p>
                                <div className="mt-3 flex flex-wrap gap-3">
                                    <a 
                                        href="https://support.google.com/chrome/answer/95647" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        Chrome Settings
                                    </a>
                                    <a 
                                        href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        Firefox Settings
                                    </a>
                                    <a 
                                        href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        Safari Settings
                                    </a>
                                </div>
                            </div>
                        </Section>

                        {/* International Transfers */}
                        <Section 
                            id="international-transfers"
                            icon={<GlobeAltIcon className="h-6 w-6" />}
                            title="7. International Data Transfers"
                        >
                            <p className="text-gray-700 mb-4">
                                Your information may be transferred to — and maintained on — computers 
                                located outside of your state, province, country, or other governmental 
                                jurisdiction where data protection laws may differ.
                            </p>
                            <div className="p-5 bg-blue-50 rounded-xl">
                                <p className="text-blue-800 text-sm">
                                    <strong>EU/UK Residents:</strong> We implement appropriate safeguards including 
                                    Standard Contractual Clauses (SCCs) for data transfers outside the EEA/UK.
                                </p>
                            </div>
                        </Section>

                        {/* Children's Privacy */}
                        <Section 
                            title="8. Children's Privacy"
                        >
                            <p className="text-gray-700">
                                Our service is not directed to individuals under the age of 18. We do not 
                                knowingly collect personal information from children. If you become aware that 
                                a child has provided us with personal information, please contact us.
                            </p>
                        </Section>

                        {/* Changes to Policy */}
                        <Section 
                            title="9. Changes to This Privacy Policy"
                        >
                            <p className="text-gray-700">
                                We may update our Privacy Policy from time to time. We will notify you of any 
                                changes by posting the new Privacy Policy on this page and updating the 
                                "Last Updated" date.
                            </p>
                            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                                <p className="text-gray-700 text-sm">
                                    <strong>Material Changes:</strong> For significant changes, we will provide 
                                    notice through email or prominent notice on our platform at least 30 days 
                                    before the change takes effect.
                                </p>
                            </div>
                        </Section>

                        {/* Contact Information */}
                        <Section 
                            id="contact"
                            icon={<UserGroupIcon className="h-6 w-6" />}
                            title="10. Contact Us"
                        >
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    {/* <h4 className="font-semibold text-gray-800 mb-4">Data Protection Officer</h4> */}
                                    <div className="space-y-3">
                                        <ContactItem
                                            icon={<EnvelopeIcon className="h-4 w-4" />}
                                            type="Email"
                                            value="salonhub.business@gmail.com"
                                            link="mailto:salonhub.business@gmail.com"
                                        />
                                        <ContactItem
                                            icon={<PhoneIcon className="h-4 w-4" />}
                                            type="Phone"
                                            value="+91 8810269376"
                                            link="tel:+918810269376"
                                        />
                                        <ContactItem
                                            icon={<ClockIcon className="h-4 w-4" />}
                                            type="Hours"
                                            value="Monday - Saturday, 9:00 AM - 6:00 PM IST"
                                        />
                                    </div>
                                </div>
                                {/* <div>
                                    <h4 className="font-semibold text-gray-800 mb-4">Mailing Address</h4>
                                    <div className="p-4 bg-gray-50 rounded-lg flex items-start">
                                        <MapPinIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                                        <p className="text-gray-700">
                                            SalonHub Data Protection Office<br />
                                            123 Tech Park<br />
                                            Delhi, India 110001
                                        </p>
                                    </div>
                                </div> */}
                            </div>

                            {/* <div className="mt-8 p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
                                <h4 className="font-semibold text-xl mb-2">Need Immediate Assistance?</h4>
                                <p className="mb-4">
                                    For urgent privacy concerns or data breach notifications, please contact 
                                    our security team immediately.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <a 
                                        href="mailto:security@salonhub.co.in" 
                                        className="px-4 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition"
                                    >
                                        Security Team Email
                                    </a>
                                    <a 
                                        href="tel:+918810269376" 
                                        className="px-4 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition"
                                    >
                                        Emergency Contact
                                    </a>
                                </div>
                            </div> */}
                        </Section>

                        {/* Acknowledgement */}
                        <div className="mt-12 p-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl text-white">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">Your Privacy Matters</h3>
                                    <p className="text-gray-300">
                                        By using SalonHub, you acknowledge that you have read and 
                                        understood this Privacy Policy.
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                        <p className="text-sm text-gray-400">Last Updated</p>
                                        <p className="font-semibold">{currentDate}</p>
                                    </div>
                                    <ShieldCheckIcon className="h-10 w-10 text-green-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Links */}
                <div className="mt-10 text-center">
                    <p className="text-gray-600 mb-4">You might also want to read:</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a 
                            href="/terms-of-service" 
                            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium shadow-sm"
                        >
                            📄 Terms of Service
                        </a>
                        <a 
                            href="/cancellation-policy" 
                            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium shadow-sm"
                        >
                            🔄 Cancellation Policy
                        </a>
                        {/* <a 
                            href="/cookie-policy" 
                            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium shadow-sm"
                        >
                            🍪 Cookie Policy
                        </a> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Reusable Components
const Section = ({ id, icon, title, children }) => (
    <div id={id} className="mb-12 scroll-mt-20">
        <div className="flex items-center mb-6">
            {icon && (
                <div className="mr-3 p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                    <div className="text-purple-600">
                        {icon}
                    </div>
                </div>
            )}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {title}
            </h2>
        </div>
        <div className="ml-0 md:ml-14">
            {children}
        </div>
    </div>
);

const InfoCard = ({ title, color, items }) => {
    const colorClasses = {
        purple: 'border-purple-200 bg-purple-50',
        pink: 'border-pink-200 bg-pink-50',
        blue: 'border-blue-200 bg-blue-50',
        green: 'border-green-200 bg-green-50'
    };

    return (
        <div className={`p-5 border rounded-xl ${colorClasses[color]}`}>
            <h4 className="font-semibold text-gray-800 mb-3">{title}</h4>
            <ul className="space-y-2">
                {items.map((item, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                        <div className={`w-1.5 h-1.5 rounded-full mr-2 bg-${color}-500`}></div>
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const UsageItem = ({ title, description }) => (
    <div className="flex items-start">
        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3 mt-1">
            <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <div>
            <h4 className="font-semibold text-gray-800">{title}</h4>
            <p className="text-gray-600 text-sm mt-1">{description}</p>
        </div>
    </div>
);

const SharingCard = ({ title, items, requirement }) => (
    <div className="p-5 border border-gray-200 rounded-xl bg-white">
        <h4 className="font-semibold text-gray-800 mb-3">{title}</h4>
        <ul className="space-y-2 mb-3">
            {items.map((item, index) => (
                <li key={index} className="text-gray-700 text-sm flex items-center">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                    {item}
                </li>
            ))}
        </ul>
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <strong>Requirement:</strong> {requirement}
        </div>
    </div>
);

const RightCard = ({ title, description }) => (
    <div className="p-5 border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-sm transition-all duration-200">
        <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg flex items-center justify-center mb-3">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
        </div>
        <h4 className="font-semibold text-gray-800 mb-2">{title}</h4>
        <p className="text-gray-600 text-sm">{description}</p>
    </div>
);

const SecurityMeasure = ({ title, description }) => (
    <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
        <LockClosedIcon className="h-5 w-5 text-gray-500 mr-3" />
        <div>
            <h4 className="font-semibold text-gray-800">{title}</h4>
            <p className="text-gray-600 text-sm mt-1">{description}</p>
        </div>
    </div>
);

const ContactItem = ({ icon, type, value, link }) => (
    <div className="flex items-center">
        <div className="w-6 text-gray-500">
            {icon}
        </div>
        <span className="w-24 text-gray-600 text-sm ml-2">{type}:</span>
        {link ? (
            <a 
                href={link} 
                className="text-purple-600 hover:text-purple-800 font-medium hover:underline ml-2"
            >
                {value}
            </a>
        ) : (
            <span className="text-gray-800 font-medium ml-2">{value}</span>
        )}
    </div>
);

export default PrivacyPolicy;




// import React from 'react';

// const PrivacyPolicy = () => {
//     return (
//         <div className="bg-gray-50 min-h-screen py-10 px-4 md:px-8">
//             <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-xl shadow-md">
//                 <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800 text-center">Privacy Policy</h1>

//                 <p className="mb-4 text-gray-700">
//                     Welcome to our SalonHub. We are committed to protecting your personal information and your right to privacy.
//                 </p>

//                 <p className="mb-6 text-gray-700">
//                     This Privacy Policy outlines how SalonHub collects, uses, maintains, and discloses information collected from users of the website. Your privacy is important to us, and we are committed to protecting your personal information.
//                 </p>

//                 <Section title="Information Collection and Use">
//                     <p>
//                         We may collect personal identification information from users in various ways, including when users visit our site, register, and interact with our services. Users may be asked for their name, email address, mailing address, phone number, etc.
//                     </p>
//                 </Section>

//                 <Section title="Terms and Conditions">
//                     <p>
//                         “We”, “us”, or “our” refers to SalonHub. “You” or “User” refers to any visitor of our website.
//                     </p>
//                     <ul className="list-disc list-inside space-y-2">
//                         <li>Website content is subject to change without notice.</li>
//                         <li>We provide no guarantees on accuracy or completeness of site content.</li>
//                         <li>Use of site content is at your own risk.</li>
//                         <li>All material on the site is owned or licensed by us. Unauthorized use is prohibited.</li>
//                         <li>Trademarks not owned by us are acknowledged accordingly.</li>
//                         <li>Unauthorized use may lead to claims or criminal charges.</li>
//                         <li>Links to external websites are for convenience only.</li>
//                         <li>You may not link to our site without prior permission.</li>
//                         <li>Disputes are subject to Indian law.</li>
//                         <li>We are not liable for declined payment transactions due to user limits.</li>
//                     </ul>
//                 </Section>

//                 <Section title="1. Information We Collect">
//                     <p>We collect personal information such as:</p>
//                     <ul className="list-disc list-inside space-y-1">
//                         <li>Name</li>
//                         <li>Email Address</li>
//                         <li>Phone Number</li>
//                         <li>Payment Details (via third-party providers)</li>
//                         <li>Salon business info (shop name, services, etc.)</li>
//                     </ul>
//                 </Section>

//                 <Section title="2. How We Use Your Information">
//                     <ul className="list-disc list-inside space-y-1">
//                         <li>Register and manage accounts</li>
//                         <li>Process bookings and payments</li>
//                         <li>Send notifications and updates</li>
//                         <li>Enhance user experience</li>
//                     </ul>
//                 </Section>

//                 <Section title="3. Sharing Your Information">
//                     <ul className="list-disc list-inside space-y-1">
//                         <li>Third-party payment processors</li>
//                         <li>Salon owners for appointment handling</li>
//                         <li>Legal authorities as required</li>
//                     </ul>
//                 </Section>

//                 <Section title="4. Data Security">
//                     <p>
//                         We use standard industry practices to secure your data. However, no online transmission is 100% secure.
//                     </p>
//                 </Section>

//                 <Section title="5. Your Rights">
//                     <p>
//                         You can request to access, modify, or delete your data.
//                     </p>
//                 </Section>

//                 <Section title="6. Cancellation & Refund Policy">
//                     <ul className="list-disc list-inside space-y-1">
//                         <li>Cancellations must be made at least 2 hours in advance.</li>
//                         <li>Approved refunds take 6–8 days to process.</li>
//                     </ul>
//                 </Section>

//                 <Section title="7. Changes to This Policy">
//                     <p>
//                         We may update this policy periodically. Please check this page regularly.
//                     </p>
//                 </Section>

//                 {/* <Section title="8. Contact Us">
//                     <p>
//                         Email: <strong>sbthelp123@gmail.com</strong><br />
//                         Phone: <strong>+91 8810269376</strong>
//                     </p>
//                 </Section> */}
//             </div>
//         </div>
//     );
// };

// const Section = ({ title, children }) => (
//     <div className="mb-6">
//         <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">{title}</h2>
//         <div className="text-gray-700 space-y-2">{children}</div>
//     </div>
// );

// export default PrivacyPolicy;
