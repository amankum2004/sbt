import React, { useState } from 'react';
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUser, FaCheck } from 'react-icons/fa';

const LearningGuide = () => {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: "Find Nearby Shop",
      icon: <FaMapMarkerAlt className="text-cyan-600" />,
      content: "Search for salons near your location using our map or address search."
    },
    {
      id: 2,
      title: "Select Salon",
      icon: <FaUser className="text-cyan-600" />,
      content: "Choose your preferred services and select a stylist (optional)."
    },
    {
      id: 3,
      title: "Pick Date & Time",
      icon: <FaCalendarAlt className="text-cyan-600" />,
      content: "View real-time availability and select your convenient slot."
    },
    {
      id: 4,
      title: "Confirm Booking",
      icon: <FaCheck className="text-cyan-600" />,
      content: "Review details and confirm your appointment with secure payment."
    }
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-cyan-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-40 h-72 w-72 rounded-full bg-amber-200/60 blur-3xl" />

      <div className="relative mx-auto w-full max-w-5xl">
        <div className="mb-8 text-center">
          <p className="inline-flex rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
            Booking Guide
          </p>
          <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
            How To Book Your Salon Appointment
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
            Follow these four quick steps to discover salons, choose services, and confirm your slot.
          </p>
        </div>

        <div className="mb-10 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_24px_70px_-20px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8">
          <div className="relative mb-10 flex flex-wrap justify-between gap-3">
            <div className="absolute left-0 right-0 top-6 hidden h-1 rounded bg-slate-200 sm:block" />
            <div
              className="absolute left-0 top-6 hidden h-1 rounded bg-gradient-to-r from-cyan-500 to-amber-400 transition-all duration-300 sm:block"
              style={{ width: `${(activeStep - 1) * 33.33}%` }}
            />

            {steps.map((step) => (
              <div key={step.id} className="relative z-10 flex flex-1 min-w-[150px] flex-col items-center text-center">
                <button
                  onClick={() => setActiveStep(step.id)}
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-full border text-sm font-semibold transition ${
                    activeStep >= step.id
                      ? "border-cyan-500 bg-gradient-to-r from-cyan-500 to-amber-400 text-slate-950"
                      : "border-slate-300 bg-white text-slate-500"
                  }`}
                >
                  {activeStep > step.id ? <FaCheck /> : step.icon}
                </button>
                <span className={`mt-2 text-xs font-semibold sm:text-sm ${activeStep >= step.id ? 'text-slate-900' : 'text-slate-500'}`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-xl">{steps[activeStep - 1].icon}</div>
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Step {activeStep}: {steps[activeStep - 1].title}
                </h2>
                <p className="mt-2 text-sm text-slate-600 sm:text-base">{steps[activeStep - 1].content}</p>

                {activeStep === 1 && (
                  <div className="mt-5">
                    <img
                      src="/images/location-img.png"
                      alt="Location search demo"
                      className="w-full rounded-xl border border-slate-200"
                    />
                    <p className="mt-2 text-xs text-slate-500 sm:text-sm">
                      Tip: allow location access for better nearby recommendations.
                    </p>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <h3 className="mb-2 text-sm font-bold text-slate-900">Popular Services</h3>
                      <ul className="space-y-1 text-sm text-slate-600">
                        <li>Haircut & Styling</li>
                        <li>Beard Trim</li>
                        <li>Facial Treatments</li>
                        <li>Hair Coloring</li>
                      </ul>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <h3 className="mb-2 text-sm font-bold text-slate-900">Choose Stylist</h3>
                      <p className="text-sm text-slate-600">
                        Pick “Any Available” for faster booking, or choose your preferred professional.
                      </p>
                    </div>
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="mt-5">
                    <div className="mb-3 flex items-center text-sm font-semibold text-slate-700">
                      <FaClock className="mr-2 text-cyan-600" />
                      Available Time Slots
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'].map((time) => (
                        <button
                          key={time}
                          className="rounded-lg border border-slate-300 bg-white py-2 text-sm text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeStep === 4 && (
                  <div className="mt-5 rounded-xl border border-cyan-200 bg-gradient-to-r from-cyan-50 to-amber-50 p-4">
                    <h3 className="mb-2 text-sm font-black text-slate-900">Ready to Confirm?</h3>
                    <p className="text-sm text-slate-600">Review all appointment details before final booking.</p>
                    <button className="mt-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-amber-400 px-5 py-2 text-sm font-black text-slate-950 transition hover:brightness-110">
                      Book Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setActiveStep((prev) => Math.max(prev - 1, 1))}
            disabled={activeStep === 1}
            className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${
              activeStep === 1
                ? 'cursor-not-allowed bg-slate-200 text-slate-500'
                : 'border border-slate-300 bg-white text-slate-700 hover:border-slate-400'
            }`}
          >
            Previous
          </button>

          <button
            onClick={() => setActiveStep((prev) => Math.min(prev + 1, 4))}
            disabled={activeStep === 4}
            className={`rounded-xl px-5 py-2 text-sm font-black transition ${
              activeStep === 4
                ? 'cursor-not-allowed bg-slate-300 text-white'
                : 'bg-gradient-to-r from-cyan-500 via-teal-500 to-amber-400 text-slate-950 hover:brightness-110'
            }`}
          >
            {activeStep === 4 ? 'Completed!' : 'Next Step'}
          </button>
        </div>
      </div>
    </main>
  );
};

export default LearningGuide;
