
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-onolo-dark text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">
          <span className="text-onolo-orange">Fast</span>{' '}
          <span className="text-white">&</span>
        </h1>
        <h1 className="text-4xl font-bold text-onolo-orange mb-6">
          Reliable
        </h1>
        <p className="text-onolo-gray text-lg mb-8 leading-relaxed">
          Don't worry, we will deliver your fuel wherever you wish
        </p>
        
        <div className="space-y-4 mb-8">
          <div className="flex items-center space-x-3 justify-center">
            <div className="w-2 h-2 bg-onolo-orange rounded-full"></div>
            <span className="text-onolo-gray">Fast Delivery</span>
          </div>
          <div className="flex items-center space-x-3 justify-center">
            <div className="w-2 h-2 bg-onolo-orange rounded-full"></div>
            <span className="text-onolo-gray">24/7 Support</span>
          </div>
          <div className="flex items-center space-x-3 justify-center">
            <div className="w-2 h-2 bg-onolo-orange rounded-full"></div>
            <span className="text-onolo-gray">Secure Payment</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full bg-onolo-orange hover:bg-onolo-orange-dark text-white font-semibold py-4 px-6 rounded-2xl transition-colors"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default Welcome;
