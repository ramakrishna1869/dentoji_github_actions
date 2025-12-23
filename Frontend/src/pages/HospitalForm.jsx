import { useState } from 'react';
import { Heart, Home, MapPin } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jwtDecode } from 'jwt-decode';
import teeth from '../assets/icons/teeth.png';
import logo from '../assets/icons/dentoji_image.png';

export default function HospitalForm() {
  const [formData, setFormData] = useState({ name: '', location: '' });
  const [isLoading, setIsLoading] = useState(false);
  
  // Auto-capitalize first letter function
  const capitalizeFirstLetter = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Capitalize first letter of input
    const capitalizedValue = capitalizeFirstLetter(value);
    setFormData((prev) => ({ ...prev, [name]: capitalizedValue }));
  };

  // Check if both fields are filled
  const isFormValid = formData.name.trim() !== '' && formData.location.trim() !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading) return;

    if (!formData.name || !formData.location) {
      toast.error('Please fill out all fields.');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const decoded = jwtDecode(token);
      const userId = decoded.id;
      const role = decoded.role;

      if (!userId) {
        throw new Error('Invalid token: user ID not found.');
      }

      if (role !== 'Admin') {
        throw new Error('Only Admins can create hospitals.');
      }

      const requestData = {
        ...formData,
        adminId: userId,
      };

      //console.log('Sending hospital data:', requestData);

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/hospitals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Submission failed');
      }

      const data = await res.json();
      //console.log('Hospital creation response:', data);

      toast.success(`Hospital "${data.hospital.name}" created successfully!`);

      setTimeout(() => {
        //console.log('Redirecting to /dashboard');
        window.location.href = '/dashboard';
      }, 1500);

      setFormData({ name: '', location: '' });
    } catch (err) {
    //  console.error('Hospital creation error:', err.message);
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#ECF3FF] flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url(${teeth})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-white opacity-75 z-0"></div>

      <ToastContainer position="top-right" autoClose={3000} />

      {/* Desktop Layout */}
  <div className="hidden md:flex w-full max-w-7xl p-6 relative z-10">
  {/* Left Section - Matches Login Page */}
  <div className="w-[60%] p-8 pl-0 text-white">
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-8">
        {/* Empty for consistency with login page */}
      </div>
    </div>

    <div className="mt-19 mb-10 ml-auto mr-32 max-w-md">
      <h2 className="text-5xl font-bold mb-1 text-gray-900">Welcome to</h2>
      <img 
        src={logo} 
        alt="Dentoji Logo" 
        className="w-[300px] h-[100px] object-contain" 
        style={{ imageRendering: 'crisp-edges' }}
      />
      
      <h2 className="text-xl text-gray-500 font-bold mb-6 mt-6 ml-1">
        Patient Management System
      </h2>

      {/* Feature list */}
     {/* Feature list */}
{/* Feature list */}
<div className="mt-8 ml-1 space-y-3">
  {[
    'Keep patient records organized',
    'Access to Interactive tooth chart',
    'Gain insights into patient data',
    'Manage appointments with patients',
    'Manage lab records',
  ].map((feature, index) => (
    <div key={index} className="flex items-center gap-3">
      <div className="flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center relative top-[1px]">
        <svg
          className="w-3.3 h-3.5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <p className="text-[16px] text-gray-600 font-medium flex items-center leading-none">
        {feature}
      </p>
    </div>
  ))}
</div>


    </div>
  </div>

  {/* Right Section - Hospital Form */}
  <div className="w-[40%] p-8 flex justify-center items-start relative z-10 ml-60 mt-16">
    <div className="w-full max-w-sm bg-white rounded-2xl p-6 min-h-[480px] flex flex-col justify-center shadow-lg border border-gray-100">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Hospital Setup</h3>
        <p className="text-gray-600 text-sm">Enter your hospital details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Hospital Name */}
        <div>
          <label className="block text-xs font-medium text-gray-800 mb-1">
            Hospital Name
          </label>
          <div className="relative">
            <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter hospital name"
              disabled={isLoading}
              className="w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:ring-3 focus:ring-blue-100 focus:border-blue-500 outline-none text-gray-800 placeholder-gray-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors border-gray-300"
              required
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-medium text-gray-800 mb-1">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter location"
              disabled={isLoading}
              className="w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:ring-3 focus:ring-blue-100 focus:border-blue-500 outline-none text-gray-800 placeholder-gray-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors border-gray-300"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !isFormValid}
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 text-sm rounded-lg transition-all duration-200 focus:ring-3 focus:ring-blue-100 flex items-center justify-center ${
            isLoading || !isFormValid
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:shadow-lg transform hover:scale-[1.02]'
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Submitting...
            </>
          ) : (
            'Complete Setup'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600 text-xs">
          This information helps us personalize your experience
        </p>
      </div>
    </div>
  </div>
</div>


      {/* Mobile Layout - Matches Login Page */}
      <div className="flex md:hidden w-full max-w-sm mx-auto relative z-10">
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 w-full">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-white fill-current" />
              </div>
              <h1 className="text-xl font-bold text-blue-600">DENTOJI</h1>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Hospital Setup</h3>
            <p className="text-gray-600 text-sm">Enter your hospital details</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-800 mb-1">
                Hospital Name
              </label>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter hospital name"
                  disabled={isLoading}
                  className="w-full pl-9 pr-3 py-3 text-sm border rounded-lg focus:ring-3 focus:ring-blue-100 focus:border-blue-500 outline-none text-gray-800 placeholder-gray-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors border-gray-300"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-800 mb-1">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter location"
                  disabled={isLoading}
                  className="w-full pl-9 pr-3 py-3 text-sm border rounded-lg focus:ring-3 focus:ring-blue-100 focus:border-blue-500 outline-none text-gray-800 placeholder-gray-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors border-gray-300"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 text-sm rounded-lg transition-all duration-200 focus:ring-3 focus:ring-blue-100 flex items-center justify-center ${
                isLoading || !isFormValid ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                'Complete Setup'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-xs">
              This information helps us personalize your experience
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}