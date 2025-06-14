
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-onolo-dark text-white p-6">
      <div className="max-w-md mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8 mt-8">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-onolo-orange">Fast</span>{' '}
            <span className="text-white">&</span>
          </h1>
          <h1 className="text-5xl font-bold text-onolo-orange mb-6">
            Reliable
          </h1>
          <p className="text-onolo-gray text-lg mb-8 leading-relaxed">
            Don't worry, we will deliver your fuel wherever you wish
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-12">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-onolo-orange rounded-full"></div>
            <span className="text-onolo-gray">Fast Delivery</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-onolo-orange rounded-full"></div>
            <span className="text-onolo-gray">24/7 Support</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-onolo-orange rounded-full"></div>
            <span className="text-onolo-gray">Secure Payment</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-4 mb-12">
          <button
            onClick={() => navigate('/order')}
            className="w-full bg-onolo-orange hover:bg-onolo-orange-dark text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center space-x-2 transition-colors"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          {!user && (
            <button
              onClick={() => navigate('/auth')}
              className="w-full bg-transparent border-2 border-onolo-orange text-onolo-orange hover:bg-onolo-orange hover:text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center space-x-2 transition-colors"
            >
              <LogIn className="w-5 h-5" />
              <span>Sign In for Better Experience</span>
            </button>
          )}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center space-x-2 mt-12">
          <div className="w-2 h-2 bg-onolo-orange rounded-full"></div>
          <div className="w-2 h-2 bg-onolo-gray rounded-full"></div>
          <div className="w-2 h-2 bg-onolo-gray rounded-full"></div>
          <div className="w-2 h-2 bg-onolo-gray rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default Home;
