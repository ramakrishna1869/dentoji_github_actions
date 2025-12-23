import React from 'react';
import { Calendar, FileText, FlaskConical, UserRound, Users, DollarSign, ArrowUpRight } from 'lucide-react';

const CardWithNotch = ({ icon: Icon, title, description, iconBgColor, iconColor }) => {
  return (

    <section id='features'>
    <div className="relative w-80 h-96 sm:w-72 sm:h-80">
      
      {/* Custom SVG Path for card with notch */}
      <svg width="100%" height="100%" viewBox="0 0 288 320" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path
          d="M 26 0 
             L 264 0 
             Q 288 0 288 24 
             L 288 220
             Q 288 244 264 244
             L 220 244
             Q 200 244 200 274
             L 200 296
             Q 194 320 176 320
             L 24 320
             Q 0 320 0 296
             L 0 24
             Q 0 0 24 0 Z"
          fill="white"
          stroke="#cec8dc"
          strokeWidth="1"
        />
      </svg>
      
      {/* Content overlay */}
      <div className="absolute top-0 left-0 p-6 w-full h-full flex flex-col">
        {/* Icon */}
        <div className={`w-14 h-14 ${iconBgColor} rounded-xl flex items-center justify-center mb-4`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-bold text-[#190051] mb-3">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-[#190051] text-[17px] font-medium leading-relaxed flex-grow">
          {description}
        </p>
      </div>
      
      {/* Arrow Button */}
      <div className="absolute bottom-2 right-6">
        <button className="w-14 h-14 rounded-full border-2 border-[#cec8dc] bg-white flex items-center justify-center hover:bg-[#190051] hover:text-white transition-colors shadow-sm cursor-pointer">
          <ArrowUpRight className="w-5 h-5" />
        </button>
      </div>
    </div>
    </section>
  );
};

export default function MedicalDashboard() {
  const cards = [
    {
      icon: Calendar,
      title: "Patient Appointments",
      description: "Doctors can schedule visits and send reminders to ensure a smooth daily workflow.",
      iconBgColor: "bg-indigo-100",
      iconColor: "text-indigo-600"
    },
    {
      icon: FileText,
      title: "Patient Details & Prescription",
      description: "Doctors can schedule visits and send reminders to ensure a smooth daily workflow.",
      iconBgColor: "bg-indigo-100",
      iconColor: "text-indigo-600"
    },
    {
      icon: FlaskConical,
      title: "Lab Records",
      description: "Maintain lab-related information and upload reports for easy reference.",
      iconBgColor: "bg-indigo-100",
      iconColor: "text-indigo-600"
    },
    {
      icon: UserRound,
      title: "Doctor Consultations",
      description: "Access patient files, add notes, and share digital prescriptions in seconds.",
      iconBgColor: "bg-indigo-100",
      iconColor: "text-indigo-600"
    },
    {
      icon: Users,
      title: "Staff Management",
      description: "Manage roles, tasks, and access for your team with total control and clarity.",
      iconBgColor: "bg-indigo-100",
      iconColor: "text-indigo-600"
    },
    {
      icon: DollarSign,
      title: "Finances",
      description: "Track income, expenses, and pending payments with real-time financial summaries.",
      iconBgColor: "bg-indigo-100",
      iconColor: "text-indigo-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
     <div className='p-4 mt-5 '>
      <h1 className='lg:text-5xl text-3xl text-center text-[#190051] font-bold'>Solutions We Deliver with Dentoji</h1>
      <p className='text-center text-[#190051] text-2xl mb-5 mt-4 max-w-2xl mx-auto font-medium'>Simplify your daily clinic operations with all-in-one control</p>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          {cards.map((card, index) => (
            <CardWithNotch key={index} {...card} />
          ))}
        </div>
      </div>
    </div>
  );
}