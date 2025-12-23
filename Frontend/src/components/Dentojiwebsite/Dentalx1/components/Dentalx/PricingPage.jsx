import React, { useState } from "react";
import { Check, X, ChevronRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';
 
const PricingPage = () => {
  const [activeCard, setActiveCard] = useState(null);
  const navigate = useNavigate();
 
  const handleCardClick = (cardIndex) => {
    setActiveCard(activeCard === cardIndex ? null : cardIndex);
  };
 
  const plans = [
    {
      name: "Basic Plan",
      subtitle: "Flexible billing",
      price: "₹999",
      period: "/30 days",
      features: [
        { text: "Up to 250 patients", included: true },
        { text: "Basic appointment scheduling", included: true },
        { text: "Patient management", included: true },
        { text: "Medication management", included: true },
        { text: "Receptionist Access", included: false },
        { text: "Doctor Consultation", included: false },
        { text: "Interactive Teeth Chart", included: false },
        { text: "Unable to download prescription", included: false },
      ],
      buttonText: "Choose Plan",
      footerText: "Secure • Cancel anytime",
      popular: false,
    },
    {
      name: "Monthly Plan",
      subtitle: "Flexible billing",
      price: "₹1,750",
      period: "/month",
      features: [
        { text: "Everything Basic Plan", included: true },
        { text: "Advanced Scheduling", included: true },
        { text: "Complete patient history", included: true },
        { text: "Advanced analytics", included: true },
        { text: "Priority support", included: true },
        { text: "Referral system", included: true },
        { text: "Custom Reports", included: true },
      ],
      buttonText: "Choose Plan",
      footerText: "Secure • Cancel anytime",
      popular: true,
    },
    {
      name: "Yearly Plan",
      subtitle: "Best value",
      price: "₹14,500",
      period: "/year",
      features: [
        { text: "Everything in Monthly Plan", included: true },
        { text: "Unlimited patients", included: true },
        { text: "Advanced integrations", included: true },
        { text: "Custom branding", included: true },
        { text: "API access", included: true },
        { text: "Dedicated Support", included: true },
        { text: "Practice analytics", included: true },
        { text: "Export Capabilities", included: true },
      ],
      buttonText: "Choose Plan",
      footerText: "Best value!",
      popular: false,
    },
  ];
 
  const technojiBlue = "#4f46e5";
 
  return (
    <section id="pricing">
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-4">
      {/* Custom CSS for bounce animation */}
      <style>
        {`
          @keyframes floatUpDown {
            0%, 100% {
              transform: translateX(-50%) translateY(0);
            }
            50% {
              transform: translateX(-50%) translateY(-10px);
            }
          }
          .animate-float {
            animation: floatUpDown 2s ease-in-out infinite;
          }
        `}
      </style>
 
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple,{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: `linear-gradient(to right, ${technojiBlue}, #7c3aed)`,
              }}
            >
              transparent pricing
            </span>
          </h1>
        </div>
 
        {/* Most Popular Badge */}
        <div className="flex justify-center mb-6">
          <span
            className="text-white text-sm font-semibold px-6 py-2 rounded-full"
            style={{
              background: `linear-gradient(to right, #4f46e5, #7c3aed)`,
            }}
          >
            Most Popular
          </span>
        </div>
 
        {/* Pricing Cards - Added items-stretch for equal height */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
          {plans.map((plan, index) => (
            <div key={index} className="relative flex flex-col h-full">
              {/* Main Card */}
              <div
                className={`relative flex flex-col rounded-2xl border bg-white p-8 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer h-full ${
                  activeCard === index ? "shadow-lg scale-105" : "border-gray-200"
                }`}
                style={{
                  borderColor: activeCard === index ? technojiBlue : undefined,
                }}
                onClick={() => handleCardClick(index)}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {plan.name}
                </h3>
                <p className="text-gray-500 text-sm mb-4">{plan.subtitle}</p>
                <div className="mb-6">
                  <span className="text-4xl md:text-5xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-500 text-lg">{plan.period}</span>
                </div>
               
                {/* Features list with flex-grow to push button to bottom */}
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      {feature.included ? (
                        <Check
                          className="w-5 h-5 mr-3 flex-shrink-0"
                          style={{ color: technojiBlue }}
                        />
                      ) : (
                        <X className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
                      )}
                      <span
                        className={
                          feature.included ? "text-gray-700" : "text-gray-500"
                        }
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
               
                {/* Button always at bottom */}
                <div className="mt-auto">
                  <button
                  onClick={() => navigate('/login')}
                    className="w-full py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer hover:opacity-90"
                    style={{
                      background: `linear-gradient(to right, ${technojiBlue}, #7c3aed)`,
                    }}
                  >
                    {plan.buttonText}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <p className="text-center text-gray-400 text-sm mt-4">
                    {plan.footerText}
                  </p>
                </div>
              </div>
 
              {/* Book a Demo - Floating rounded badge only for first card */}
              {(index === 0 || index === 1 || index === 2) && (
                <div
                  className="absolute -bottom-4 left-1/2 px-6 py-2 rounded-full cursor-pointer transition-all duration-300 hover:scale-105 shadow-lg animate-float z-10"
                  style={{
                    background: `linear-gradient(to right, ${technojiBlue}, #7c3aed)`,
                  }}
                  onClick={() => window.open('https://calendly.com/pardhasaradhi-kommuri/30min', '_blank')}
                >
                  <span className="text-white font-semibold text-sm whitespace-nowrap">
                    Book a Demo
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
    </section>
  );
};
 
export default PricingPage;
 