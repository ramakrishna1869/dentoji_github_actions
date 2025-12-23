import React, { useState, useEffect } from "react";
import { Calendar, Sun, Moon, Coffee, Star } from "lucide-react";

const WelcomeCard = ({ doctorName = "Dr. Admin", userProfile = null }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [adminProfile, setAdminProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // API configuration - same as your settings page
  const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;
  
  // Get auth token from localStorage - same as your settings page
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // API call helper - same as your settings page
  const apiCall = async (endpoint, options = {}) => {
    const token = getAuthToken();
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
  };

  // Fetch admin profile from backend - same pattern as your settings page
  useEffect(() => {
    const loadUserProfile = async () => {
      if (userProfile) {
        setLoading(false);
        return;
      }

      try {
        const profileData = await apiCall('/auth/profile');
        //console.log('WelcomeCard - Profile data received:', profileData);
        setAdminProfile(profileData);
      } catch (error) {
       // console.error('WelcomeCard - Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [userProfile]);

  // Get doctor name from backend profile - same pattern as your settings page
  const getDoctorName = () => {
    //console.log('WelcomeCard - Getting doctor name...');
    //console.log('WelcomeCard - userProfile:', userProfile);
    //console.log('WelcomeCard - adminProfile:', adminProfile);
    
    let name = '';
    let userRole = '';
    
    // Priority: userProfile prop -> adminProfile from backend -> default doctorName
    if (userProfile?.name) {
      name = userProfile.name;
      userRole = userProfile.role || '';
      //console.log('WelcomeCard - Using userProfile name:', name);
    } else if (adminProfile?.admin) {
      // Same structure as your settings page
      name = adminProfile.admin.name || '';
      userRole = adminProfile.admin.role || 'Admin';
      //console.log('WelcomeCard - Using adminProfile.admin.name:', name);
    } else if (adminProfile?.receptionist) {
      // Same structure as your settings page
      name = adminProfile.receptionist.name || '';
      userRole = adminProfile.receptionist.role || 'Receptionist';
      //console.log('WelcomeCard - Using adminProfile.receptionist.name:', name);
    } else {
      name = doctorName;
      //console.log('WelcomeCard - Using default doctorName:', name);
    }

    // Add Dr. prefix if not already present and if it's not a receptionist
    const isReceptionist = userRole === 'Receptionist';
    //console.log('WelcomeCard - User role:', userRole, 'Is receptionist:', isReceptionist);
    
    if (!isReceptionist && name && !name.toLowerCase().startsWith('dr.')) {
      const finalName = `Dr. ${name}`;
      //console.log('WelcomeCard - Final name with Dr. prefix:', finalName);
      return finalName;
    }
    
    //console.log('WelcomeCard - Final name:', name || doctorName);
    return name || doctorName;
  };

  // Get appropriate greeting based on user role
  const getGreetingPrefix = () => {
    const isReceptionist = adminProfile?.receptionist || userProfile?.role === 'Receptionist';
    return isReceptionist ? '' : '';
  };

  // Format date
  const formatDate = (date) => {
    const options = { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Format time
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Get day of week
  const getDayOfWeek = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return { text: "Good Morning", icon: Sun };
    if (hour < 17) return { text: "Good Afternoon", icon: Coffee };
    return { text: "Good Evening", icon: Moon };
  };

  // Get inspirational daily messages based on user role
  const getDailyMessage = () => {
    // Determine user role - same pattern as your settings page
    let userRole = '';
    if (userProfile?.role) {
      userRole = userProfile.role;
    } else if (adminProfile?.admin) {
      userRole = adminProfile.admin.role || 'Admin';
    } else if (adminProfile?.receptionist) {
      userRole = adminProfile.receptionist.role || 'Receptionist';
    }

    const isReceptionist = userRole === 'Receptionist';
    
    const doctorMessages = [
      "Your healing touch makes a difference every day!",
      "Today brings new opportunities to heal and inspire!",
      "Your dedication brightens the lives of many!",
      "Another day to make miracles happen!",
      "Your compassion is a gift to the world!",
      "Ready to create positive change today!",
      "Your expertise brings hope to every patient!",
      "Today is filled with possibilities to heal!",
      "Your caring heart makes you an amazing healer!",
      "Another beautiful day to serve with purpose!",
      "Your skills and kindness change lives daily!",
      "Today's challenges are tomorrow's victories!",
      "Your dedication inspires everyone around you!",
      "Ready to make today extraordinary!",
      "Your healing hands work miracles every day!"
    ];

    const receptionistMessages = [
      "Your warm welcome brightens everyone's day!",
      "You're the first smile patients see - what a gift!",
      "Your organization keeps everything running smoothly!",
      "Today's a great day to make patients feel at home!",
      "Your efficiency and care make all the difference!",
      "Ready to coordinate another successful day!",
      "Your attention to detail ensures excellent care!",
      "You're the backbone of exceptional patient service!",
      "Another day to showcase your amazing skills!",
      "Your professionalism sets the tone for healing!",
      "Ready to manage today with grace and expertise!",
      "Your dedication creates a welcoming environment!",
      "Today brings new opportunities to excel!",
      "Your multitasking abilities are truly impressive!",
      "You make the healthcare journey smoother for everyone!"
    ];
    
    const messages = isReceptionist ? receptionistMessages : doctorMessages;
    
    // Use date as seed for consistent daily message
    const dateString = currentTime.toDateString();
    const hash = dateString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return messages[hash % messages.length];
  };

  // Get day-specific encouraging note
  const getDaySpecificNote = () => {
    const day = currentTime.getDay();
    const notes = {
      0: "Have a Blessed Sunday!", // Sunday
      1: "Make this Monday Magnificent!", // Monday
      2: "Turn this Tuesday into a Triumph!", // Tuesday
      3: "Wonderful Wednesday Awaits!", // Wednesday
      4: "Thankful Thursday is Here!", // Thursday
      5: "Fantastic Friday Energy!", // Friday
      6: "Spectacular Saturday Vibes!" // Saturday
    };
    return notes[day];
  };

  const greeting = getTimeBasedGreeting();
  const GreetingIcon = greeting.icon;

  // Show loading state
  if (loading) {
    return (
      <div className="bg-gradient-to-r from-[#4767D2] to-[#5B7BF7] text-white rounded-2xl mb-4 px-6 py-6 md:px-8 md:py-8 flex justify-center items-center min-h-[200px]">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

return (
  <div className="bg-gradient-to-r from-[#4767D2] to-[#5B7BF7] text-white rounded-2xl mb-4 px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8 flex flex-col sm:flex-row justify-between items-start sm:items-center min-h-[200px] relative overflow-hidden shadow-lg gap-4">
    {/* Decorative background elements */}
    <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 sm:-translate-y-16 sm:translate-x-16"></div>
    <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-24 sm:h-24 bg-white/5 rounded-full translate-y-10 -translate-x-10 sm:translate-y-12 sm:-translate-x-12"></div>
    
    {/* Left side: Date and Text */}
    <div className="flex flex-col justify-start space-y-4 sm:space-y-6 md:space-y-8 z-10 w-full sm:max-w-[60%]">
      {/* Date and Time */}
      <div className="border-white/80 border-2 text-xs sm:text-sm font-medium rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 w-fit flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-sm">
        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white opacity-90 flex-shrink-0" />
        <span className="whitespace-nowrap">{formatDate(currentTime)}</span>
        <span className="text-white/80">•</span>
        <span className="whitespace-nowrap">{formatTime(currentTime)}</span>
      </div>

      {/* Greeting */}
      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center gap-2">
          <GreetingIcon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-200 flex-shrink-0" />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
            {greeting.text}, {getDoctorName()}!
          </h2>
        </div>
        
        <div className="space-y-1.5 sm:space-y-2">
          <p className="text-sm sm:text-base md:text-lg text-white/90 font-medium">
            {getDaySpecificNote()}
          </p>
          <p className="text-xs sm:text-sm md:text-base text-white/80 leading-relaxed">
            {getDailyMessage()}
          </p>
        </div>
      </div>
    </div>

    {/* Right side: Decorative elements */}
    <div className="relative z-10 self-center sm:self-auto sm:ml-4">
      <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white/20 rounded-full flex items-center justify-center">
          <Star className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-yellow-200 fill-current animate-pulse" />
        </div>
      </div>
      
      {/* Floating time indicator */}
      <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-yellow-400 text-blue-800 text-[10px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full animate-bounce">
        Live
      </div>
      
    </div>
  </div>
);
};

export default WelcomeCard;