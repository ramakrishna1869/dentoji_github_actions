import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import HeroSection from './components/Dentalx/HeroSection';
import FeaturesGrid from './components/Dentalx/FeaturesGrid';
import LoginForm from './components/Dentalx/LoginForm';
import PricingPage from './components/Dentalx/PricingPage';
import Track from './components/Dentalx/Track';
import Middle from './components/Dentalx/Middle';
import { useNavigate } from 'react-router-dom';
// Navbar Component
const Navbar = ({ sections }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 ">
          {/* Logo */}
          <div className="shrink">
            <span className="text-2xl font-bold text-[#2D1B69]">Dentoji</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors cursor-pointer"
              >
                {section.label}
              </button>
            ))}
            <button className="bg-[#5B4ECC] cursor-pointer hover:bg-[#5B4ECC] text-white font-medium py-2 px-6 rounded-full transition-colors
            "
             onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button className="bg-[#5B4ECC] cursor-pointer hover:bg-[#5B4ECC] text-white font-medium py-2 px-6 rounded-full transition-colors
            "
            onClick={() => window.open("https://calendly.com/pardhasaradhi-kommuri/30min", "_blank")}
            >
              Book a Demo
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded font-medium transition-colors"
              >
                {section.label}
              </button>
            ))}
            
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Book a Demo
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

// Main DentalX Component
const DentalX = () => {
  const sections = [
    { id: 'hero', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'track', label: 'About' },
    { id: 'pricing', label: 'Pricing' },
    
  ];

  return (
    <>
      <Navbar sections={sections} />
      <HeroSection />
      <FeaturesGrid />
      <LoginForm />
      <Middle />
      <Track />
      <PricingPage />
    </>
  );
};

export default DentalX;
