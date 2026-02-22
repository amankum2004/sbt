// CancellationPolicy.js
import React from 'react';

const CancellationPolicy = () => {
    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="pointer-events-none absolute -left-20 top-24 h-64 w-64 rounded-full bg-cyan-200/60 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 top-36 h-64 w-64 rounded-full bg-amber-200/60 blur-3xl" />
            <div className="max-w-5xl mx-auto rounded-3xl border border-white/70 bg-white/90 p-6 md:p-10 shadow-[0_24px_70px_-20px_rgba(15,23,42,0.35)] backdrop-blur">
                <p className="mx-auto mb-3 inline-flex rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                    Policy Center
                </p>
                <h1 className="text-3xl md:text-5xl font-black mb-4 text-slate-900 text-center">
                    Cancellation & Refund Policy
                </h1>
                
                <p className="mb-8 text-slate-600 text-center text-sm md:text-base">
                    Last Updated: {new Date().toLocaleDateString('en-IN')}
                </p>

                <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
                    <h2 className="text-xl font-bold text-amber-700 mb-2">⚠️ Important Notice</h2>
                    <p className="text-amber-700">
                        Please read this policy carefully before booking. By making a booking, you agree to these terms.
                    </p>
                </div>

                <Section title="1. General Policy Overview">
                    <p>
                        At SalonHub, we understand that plans can change. This policy outlines our cancellation and refund procedures to ensure fairness for both customers and service providers.
                    </p>
                    <div className="mt-4 p-4 bg-cyan-50 rounded">
                        <p className="font-semibold text-cyan-800">Key Principles:</p>
                        <ul className="list-disc list-inside space-y-1 mt-2">
                            <li>Fair treatment for customers and salons</li>
                            <li>Clear communication of expectations</li>
                            <li>Timely processing of refunds</li>
                            <li>Respect for salon professionals' time</li>
                        </ul>
                    </div>
                </Section>

                <Section title="2. Customer Cancellations">
                    <h3 className="font-semibold text-lg text-slate-900 mb-2">A. Cancellation Timeframes:</h3>
                    <div className="overflow-x-auto mt-4">
                        <table className="min-w-full bg-white border border-gray-300">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="py-3 px-4 border-b text-left font-semibold text-slate-700">Cancellation Time</th>
                                    <th className="py-3 px-4 border-b text-left font-semibold text-slate-700">Refund Policy</th>
                                    <th className="py-3 px-4 border-b text-left font-semibold text-slate-700">Charges</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="hover:bg-emerald-50">
                                    <td className="py-3 px-4 border-b">
                                        <span className="font-medium text-green-700">More than 24 hours before</span>
                                    </td>
                                    <td className="py-3 px-4 border-b">Full refund</td>
                                    <td className="py-3 px-4 border-b">No cancellation fee</td>
                                </tr>
                                <tr className="hover:bg-amber-50">
                                    <td className="py-3 px-4 border-b">
                                        <span className="font-medium text-yellow-700">2 to 24 hours before</span>
                                    </td>
                                    <td className="py-3 px-4 border-b">50% refund</td>
                                    <td className="py-3 px-4 border-b">50% service charge</td>
                                </tr>
                                <tr className="hover:bg-red-50">
                                    <td className="py-3 px-4 border-b">
                                        <span className="font-medium text-amber-700">Less than 2 hours before</span>
                                    </td>
                                    <td className="py-3 px-4 border-b">No refund</td>
                                    <td className="py-3 px-4 border-b">100% service charge</td>
                                </tr>
                                <tr className="hover:bg-red-50">
                                    <td className="py-3 px-4 border-b">
                                        <span className="font-medium text-amber-700">No-show (Missed appointment)</span>
                                    </td>
                                    <td className="py-3 px-4 border-b">No refund</td>
                                    <td className="py-3 px-4 border-b">100% service charge</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <h3 className="font-semibold text-lg text-slate-900 mt-6 mb-2">B. How to Cancel:</h3>
                    <ul className="list-disc list-inside space-y-2">
                        <li>Through your SalonHub account dashboard</li>
                        <li>Via email to salonhub.business@gmail.com</li>
                        <li>By calling +91 8810269376 (during business hours)</li>
                        <li>Note: Cancellation time is based on Indian Standard Time (IST)</li>
                    </ul>
                </Section>

                <Section title="3. Salon Cancellations">
                    <p>If a salon cancels your appointment:</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li>You will receive a <strong>full refund</strong></li>
                        <li>We will notify you immediately via email/SMS</li>
                        <li>You may reschedule at your convenience</li>
                        <li>Salons must provide at least 4 hours notice</li>
                        <li>Emergency cancellations will be handled case-by-case</li>
                    </ul>
                </Section>

                <Section title="4. Refund Process">
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded border border-slate-200">
                            <h4 className="font-semibold text-slate-900 mb-2">Refund Timeline:</h4>
                            <div className="flex items-center space-x-2 text-sm text-slate-600">
                                <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                                <span>Refund request processed: <strong>Within 24 hours</strong></span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-slate-600 mt-1">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span>Amount credited to source: <strong>6-8 business days</strong></span>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-slate-900 mb-2">Refund Methods:</h4>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Original payment method (credit/debit card, UPI, wallet)</li>
                                <li>Bank transfer (for specific cases)</li>
                                <li>SalonHub credit (with customer consent)</li>
                            </ul>
                        </div>

                        <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
                            <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Important:</h4>
                            <p className="text-yellow-800 text-sm">
                                Refund times may vary based on your bank/payment provider. International transactions may take longer.
                            </p>
                        </div>
                    </div>
                </Section>

                <Section title="5. Special Circumstances">
                    <h3 className="font-semibold text-lg text-slate-900 mb-2">Exceptions to Standard Policy:</h3>
                    <div className="space-y-4">
                        <div className="p-4 border border-slate-200 rounded-xl">
                            <h4 className="font-semibold text-slate-900">Medical Emergencies</h4>
                            <p className="text-slate-700 text-sm mt-1">
                                With valid medical documentation, we may waive cancellation fees. Contact us within 24 hours of appointment.
                            </p>
                        </div>
                        
                        <div className="p-4 border border-slate-200 rounded-xl">
                            <h4 className="font-semibold text-slate-900">Natural Disasters/Extreme Weather</h4>
                            <p className="text-slate-700 text-sm mt-1">
                                If government warnings are issued, cancellations are fully refundable.
                            </p>
                        </div>
                        
                        <div className="p-4 border border-slate-200 rounded-xl">
                            <h4 className="font-semibold text-slate-900">Service Dissatisfaction</h4>
                            <p className="text-slate-700 text-sm mt-1">
                                Contact us within 2 hours of service completion. We'll investigate and may offer partial refunds or complimentary services.
                            </p>
                        </div>
                    </div>
                </Section>

                <Section title="6. Rescheduling Appointments">
                    <ul className="list-disc list-inside space-y-2">
                        <li>Rescheduling is free if done <strong>more than 2 hours</strong> before appointment</li>
                        <li>Subject to salon availability</li>
                        <li>You may reschedule up to <strong>2 times</strong> per booking</li>
                        <li>After 2 reschedules, standard cancellation policy applies</li>
                        <li>Rescheduling within 2 hours of appointment is treated as cancellation</li>
                    </ul>
                </Section>

                <Section title="7. Package Bookings & Memberships">
                    <p>For package deals and memberships:</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li>Cancellation refunds are proportional to unused services</li>
                        <li>Administrative fee of ₹100 may apply</li>
                        <li>Membership cancellations require 7 days written notice</li>
                        <li>No refunds for partially used packages unless specified</li>
                    </ul>
                </Section>

                <Section title="8. Dispute Resolution">
                    <p>
                        If you disagree with a cancellation charge, please contact us within 7 days. We will:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 mt-2">
                        <li>Review your case within 48 hours</li>
                        <li>Contact the salon for their perspective</li>
                        <li>Provide a resolution within 5 business days</li>
                        <li>Escalate to mediation if unresolved</li>
                    </ol>
                </Section>

                <Section title="9. Policy Updates">
                    <p>
                        We reserve the right to modify this policy. Changes will be:
                    </p>
                    <ul className="list-disc list-inside space-y-2 mt-2">
                        <li>Posted on this page with effective date</li>
                        <li>Communicated via email to registered users</li>
                        <li>Effective immediately for new bookings</li>
                        <li>Applied to existing bookings after 7 days notice</li>
                    </ul>
                </Section>

                <Section title="10. Contact Information">
                    <div className="space-y-3">
                        <div className="flex items-start">
                            <span className="font-semibold w-32">Email:</span>
                            <span>salonhub.business@gmail.com</span>
                        </div>
                        <div className="flex items-start">
                            <span className="font-semibold w-32">Phone:</span>
                            <span>+91 8810269376 (Mon-Sat, 9 AM - 6 PM IST)</span>
                        </div>
                        <div className="flex items-start">
                            <span className="font-semibold w-32">Address:</span>
                            <span>SalonHub, Delhi, India</span>
                        </div>
                        <div className="flex items-start">
                            <span className="font-semibold w-32">Response Time:</span>
                            <span>Within 24 hours (excluding weekends)</span>
                        </div>
                    </div>
                </Section>

                {/* <div className="mt-10 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Need Help?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <a 
                            href="mailto:salonhub.business@gmail.com" 
                            className="block p-4 bg-white border border-gray-300 rounded text-center hover:bg-cyan-50 hover:border-blue-300 transition"
                        >
                            <div className="text-cyan-700 font-semibold">Email Support</div>
                            <div className="text-sm text-slate-600 mt-1">Quick response</div>
                        </a>
                        <a 
                            href="tel:+918810269376" 
                            className="block p-4 bg-white border border-gray-300 rounded text-center hover:bg-emerald-50 hover:border-green-300 transition"
                        >
                            <div className="text-green-600 font-semibold">Phone Support</div>
                            <div className="text-sm text-slate-600 mt-1">Immediate assistance</div>
                        </a>
                    </div>
                </div> */}

                <div className="mt-8 text-center text-slate-600 text-sm">
                    <p>By using SalonHub services, you acknowledge and agree to this Cancellation & Refund Policy.</p>
                </div>
            </div>
        </div>
    );
};

const Section = ({ title, children }) => (
    <div className="mb-10">
        <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4 border-b border-slate-200 pb-2">{title}</h2>
        <div className="text-slate-700 space-y-4">{children}</div>
    </div>
);

export default CancellationPolicy;
