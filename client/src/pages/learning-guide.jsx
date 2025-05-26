import React, { useState } from 'react';
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUser, FaCheck } from 'react-icons/fa';

const LearningGuide = () => {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: "Find Nearby Shops",
      icon: <FaMapMarkerAlt className="text-purple-600" />,
      content: "Search for salons near your location using our map or address search."
    },
    {
      id: 2,
      title: "Select Service & Stylist",
      icon: <FaUser className="text-purple-600" />,
      content: "Choose your preferred services and select a stylist (optional)."
    },
    {
      id: 3,
      title: "Pick Date & Time",
      icon: <FaCalendarAlt className="text-purple-600" />,
      content: "View real-time availability and select your convenient slot."
    },
    {
      id: 4,
      title: "Confirm Booking",
      icon: <FaCheck className="text-purple-600" />,
      content: "Review details and confirm your appointment with secure payment."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-purple-700 mb-8">
        How to Book Your Salon Appointment
      </h1>
      
      {/* Step Progress Bar */}
      <div className="flex justify-between mb-12 relative">
        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center z-10">
            <button
              onClick={() => setActiveStep(step.id)}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white 
                ${activeStep >= step.id ? 'bg-purple-600' : 'bg-gray-300'}`}
            >
              {activeStep > step.id ? <FaCheck /> : step.icon}
            </button>
            <span className={`mt-2 font-medium ${activeStep >= step.id ? 'text-purple-600' : 'text-gray-500'}`}>
              {step.title}
            </span>
          </div>
        ))}
        <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 -z-1">
          <div 
            className="h-full bg-purple-600 transition-all duration-300" 
            style={{ width: `${(activeStep - 1) * 33.33}%` }}
          ></div>
        </div>
      </div>

      {/* Current Step Content */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-start">
          <div className="mr-4 text-2xl">
            {steps[activeStep - 1].icon}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Step {activeStep}: {steps[activeStep - 1].title}
            </h2>
            <p className="text-gray-600">{steps[activeStep - 1].content}</p>
            
            {/* Step-specific guides */}
            {activeStep === 1 && (
              <div className="mt-4">
                <img 
                  src="/location-search-demo.gif" 
                  alt="Location search demo" 
                  className="rounded-lg border border-gray-200"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Tip: Allow location access for accurate results
                </p>
              </div>
            )}
            
            {activeStep === 2 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Popular Services</h3>
                  <ul className="space-y-2">
                    <li>• Haircut & Styling</li>
                    <li>• Beard Trim</li>
                    <li>• Facial Treatments</li>
                    <li>• Hair Coloring</li>
                  </ul>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Choose Stylist</h3>
                  <p>Select "Any Available" or pick your preferred professional</p>
                </div>
              </div>
            )}
            
            {activeStep === 3 && (
              <div className="mt-4">
                <div className="flex items-center mb-2">
                  <FaClock className="text-purple-600 mr-2" />
                  <span>Available Time Slots</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'].map(time => (
                    <button key={time} className="border border-purple-300 text-purple-700 rounded py-2 hover:bg-purple-50">
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {activeStep === 4 && (
              <div className="mt-4">
                <div className="bg-purple-50 border-l-4 border-purple-600 p-4">
                  <h3 className="font-bold mb-2">Ready to Confirm?</h3>
                  <p>Review your appointment details before final booking</p>
                  <button className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
                    Book Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => setActiveStep(prev => Math.max(prev - 1, 1))}
          disabled={activeStep === 1}
          className={`px-6 py-2 rounded-lg ${activeStep === 1 ? 'bg-gray-200 text-gray-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Previous
        </button>
        
        <button
          onClick={() => setActiveStep(prev => Math.min(prev + 1, 4))}
          disabled={activeStep === 4}
          className={`px-6 py-2 rounded-lg ${activeStep === 4 ? 'bg-purple-300 text-white' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
        >
          {activeStep === 4 ? 'Completed!' : 'Next Step'}
        </button>
      </div>
    </div>
  );
};

export default LearningGuide;