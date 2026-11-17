import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import authService from '../../services/authService';

const Login = () => {
  const [formData, setFormData] = useState({ usernameOrEmail: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.usernameOrEmail || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login(formData.usernameOrEmail, formData.password);
      const userData = res.user || res;
      const authToken = res.token || res.accessToken;
      login(userData, authToken);
      toast.success('Logged in successfully');

      if (from === '/') {
        const isAdminUser = userData?.roles?.some(r => r.name === 'ROLE_ADMIN' || r === 'ROLE_ADMIN');
        navigate(isAdminUser ? '/admin' : '/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      const rawMsg = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response.data : '');
      const displayMsg = rawMsg && rawMsg.toLowerCase().includes('bad credentials')
        ? 'Invalid email or password. Please try again.'
        : (rawMsg || 'Failed to login. Please check your credentials.');
      toast.error(displayMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error('Google sign-in did not return a credential.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.googleLogin(credentialResponse.credential);
      const userData = res.user || res;
      const authToken = res.token || res.accessToken;
      login(userData, authToken);
      toast.success('Signed in with Google successfully');

      if (from === '/') {
        const isAdminUser = userData?.roles?.some(r => r.name === 'ROLE_ADMIN' || r === 'ROLE_ADMIN');
        navigate(isAdminUser ? '/admin' : '/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google sign-in was cancelled or failed.');
  };

  return (
    <div className="flex-1 bg-techverse-eggshell flex flex-col justify-center pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold text-techverse-green">Sign in to your account</h2>
          <p className="mt-2 text-sm text-techverse-green/70">
            Or{' '}
            <Link to="/auth/register" className="font-medium text-techverse-olive hover:text-techverse-green transition-colors">
              create a new account
            </Link>
          </p>
        </motion.div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-techverse-green/10"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-techverse-green">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="usernameOrEmail"
                  name="usernameOrEmail"
                  type="email"
                  required
                  value={formData.usernameOrEmail}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-techverse-olive focus:border-techverse-olive sm:text-sm bg-techverse-eggshell/20 text-techverse-green"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-techverse-green">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-techverse-olive focus:border-techverse-olive sm:text-sm bg-techverse-eggshell/20 text-techverse-green"
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-techverse-green bg-techverse-olive hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-techverse-olive transition-all disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500 font-medium">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
              width="100%"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
