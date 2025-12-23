import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, User, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Clock, Shield } from 'lucide-react';
import logo from '../../assets/icons/dentoji_image.png';
import teeth from '../../assets/icons/teeth.png';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}`

export default function HostLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState('');
  const navigate = useNavigate();
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  const [loginErrors, setLoginErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    if (loginErrors[name]) {
      setLoginErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateLoginForm = () => {
    const errors = {};
    
    if (!loginData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(loginData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!loginData.password) {
      errors.password = 'Password is required';
    } else if (loginData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const showToast = (message, type = 'info') => {
    const existingToasts = document.querySelectorAll('.custom-toast');
    existingToasts.forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = `custom-toast fixed top-4 right-4 p-4 rounded-lg text-white z-50 max-w-sm shadow-xl transform transition-all duration-300 ${
      type === 'error' ? 'bg-red-500' : 
      type === 'success' ? 'bg-green-500' : 
      type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
    }`;
    
    const icon = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    
    toast.innerHTML = `
      <div class="flex items-center space-x-2">
        <span>${icon}</span>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (document.body.contains(toast)) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 300);
      }
    }, 5000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    if (!validateLoginForm()) {
      showToast('Please check your email and password', 'error');
      return;
    }

    setIsLoading(true);

    try {
      //console.log('🔐 Attempting HOST login to:', `${API_URL}/api/host/auth/login`);
      //console.log('📧 Email:', loginData.email.trim());
      
      // CLEAR ALL OLD TOKENS AND DATA
      localStorage.clear(); // Clear everything first
      
      // Or manually remove all known keys
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      localStorage.removeItem('hospitalData');
      localStorage.removeItem('subscriptionData');
      localStorage.removeItem('hostToken');
      localStorage.removeItem('hostData');
      localStorage.removeItem('userType');
      localStorage.removeItem('host_auth_token');
      localStorage.removeItem('host_user_data');
      localStorage.removeItem('current_user_type');
      
      const response = await fetch(`${API_URL}/api/host/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: loginData.email.trim(),
          password: loginData.password
        })
      });

      //console.log('📡 Response status:', response.status);

      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
      //  console.error('❌ Non-JSON response:', text);
        throw new Error('Server returned invalid response');
      }

      const data = await response.json();
      //console.log('📦 Response data:', data);

      if (response.ok && data.success) {
        // CRITICAL: Use completely different keys for HOST
        localStorage.setItem('host_auth_token', data.token);
        localStorage.setItem('host_user_data', JSON.stringify(data.host));
        localStorage.setItem('current_user_type', 'host');
        
       /* console.log('✅ Host tokens saved:', {
          token: 'host_auth_token',
          data: 'host_user_data',
         type: 'host'
       }); */
        
        showToast(`Welcome back, ${data.host.name}!`, 'success');
        setRedirectMessage('Loading dashboard...');
        setIsRedirecting(true);
        
        setLoginData({
          email: "",
          password: "",
          rememberMe: false
        });
        setLoginErrors({});
        
        setTimeout(() => {
          navigate(data.redirectTo || '/host/dashboard');
        }, 2000);

      } else {
        if (response.status === 401) {
          showToast(data.message || 'Invalid email or password', 'error');
          setLoginErrors({ 
            email: "Check your credentials",
            password: "Check your credentials" 
          });
        } else if (response.status === 403) {
          showToast(data.message || 'Account is inactive', 'error');
        } else if (response.status === 400) {
          showToast(data.message || 'Please check your input', 'error');
        } else {
          showToast(data.message || 'Login failed', 'error');
        }
      }

    } catch (error) {
     // console.error('❌ Login error:', error);
      
      if (error.message.includes('Failed to fetch')) {
        showToast('Cannot connect to server. Make sure backend is running on port 5000.', 'error');
      } else {
        showToast(error.message || 'Network error occurred', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormDisabled = isLoading || isRedirecting;

  return (
    <div className="min-h-screen bg-[#ECF3FF] flex items-center justify-center p-4 relative"
      style={{ 
        backgroundImage: `url(${teeth})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-white opacity-75 z-0"></div>
      
      {isRedirecting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center shadow-xl max-w-md w-full mx-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-800 font-medium mb-2">Login successful!</p>
            <p className="text-sm text-gray-600 mb-3">{redirectMessage}</p>
            
            <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              Redirecting in a moment...
            </div>
          </div>
        </div>
      )}

      <div className="hidden md:flex w-full max-w-7xl rounded-3xl overflow-hidden relative z-10">
        <div className="w-[60%] p-8 pl-0 text-black relative z-10">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-8">
              <div>
                <img src={logo} alt="Dentoji Logo" />
                <p className="text-gray-900 text-sm font-semibold">Host Management System</p>
              </div>
            </div>
          </div> 

          <div className="mt-4 mb-10">
            <h2 className="text-6xl font-bold mb-5 text-black">Welcome to your</h2>
            <img src={logo} alt="Dentoji Logo" className='justify-start' />
            <h2 className="text-4xl text-gray-900 font-bold mb-6 mt-5">Host Dashboard</h2>
            <p className="text-xl text-gray-400 leading-relaxed max-w-lg font-medium">
              Manage subscriptions and monitor system performance.
              Secure access for authorized hosts only.
            </p>
          </div>
        </div>

        <div className="w-[40%] p-8 flex items-center justify-center relative z-10 ml-60">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 min-h-[480px] flex flex-col justify-center shadow-lg border border-gray-100">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Host Sign In</h3>
              <p className="text-gray-600 text-sm">Access your host dashboard</p>
              
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-600">
                <Shield className="w-3 h-3" />
                <span>Host Access</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-800 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    disabled={isFormDisabled}
                    className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:ring-3 focus:ring-blue-100 focus:border-blue-500 outline-none text-gray-800 placeholder-gray-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors ${
                      loginErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    required
                  />
                </div>
                {loginErrors.email && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {loginErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-800 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={loginData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    disabled={isFormDisabled}
                    className={`w-full pl-9 pr-10 py-2.5 text-sm border rounded-lg focus:ring-3 focus:ring-blue-100 focus:border-blue-500 outline-none text-gray-800 placeholder-gray-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors ${
                      loginErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isFormDisabled}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer disabled:cursor-not-allowed transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {loginErrors.password && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {loginErrors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isFormDisabled}
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 text-sm rounded-lg transition-all duration-200 focus:ring-3 focus:ring-blue-100 flex items-center justify-center cursor-pointer ${
                  isFormDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg transform hover:scale-[1.02]'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying Access...
                  </>
                ) : isRedirecting ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Redirecting...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

           
          </div>
        </div>
      </div>

      <div className="flex md:hidden w-full max-w-sm mx-auto relative z-10">
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 w-full">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-white fill-current" />
              </div>
              <h1 className="text-xl font-bold text-blue-600">DENTOJI HOST</h1>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Host Sign In</h3>
            <p className="text-gray-600 text-sm">Access your host dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-800 mb-1">
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  disabled={isFormDisabled}
                  className={`w-full pl-9 pr-3 py-3 text-sm border rounded-lg focus:ring-3 focus:ring-blue-100 focus:border-blue-500 outline-none text-gray-800 placeholder-gray-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors ${
                    loginErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
              </div>
              {loginErrors.email && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {loginErrors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-800 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={loginData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  disabled={isFormDisabled}
                  className={`w-full pl-9 pr-10 py-3 text-sm border rounded-lg focus:ring-3 focus:ring-blue-100 focus:border-blue-500 outline-none text-gray-800 placeholder-gray-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors ${
                    loginErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isFormDisabled}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {loginErrors.password && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {loginErrors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isFormDisabled}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 text-sm rounded-lg transition-all duration-200 focus:ring-3 focus:ring-blue-100 flex items-center justify-center cursor-pointer ${
                isFormDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </>
              ) : isRedirecting ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Redirecting...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
