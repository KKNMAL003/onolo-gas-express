
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [showContactModal, setShowContactModal] = useState(false);

  const handleFuelTypeSelect = (fuelType: string) => {
    if (fuelType === 'diesel' || fuelType === 'petrol') {
      setShowContactModal(true);
    } else {
      navigate('/order');
    }
  };

  return (
    <div className="min-h-screen bg-onolo-dark text-white p-6">
      <div className="max-w-md mx-auto">
        {/* Location Section */}
        <div className="bg-onolo-dark-lighter rounded-2xl p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-onolo-orange rounded-full flex items-center justify-center">
              📍
            </div>
            <div>
              <h3 className="font-bold text-white">Onolo Gas</h3>
              <p className="text-onolo-gray text-sm">Johannesburg, South Africa</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-2 h-2 bg-onolo-orange rounded-full"></div>
            <span className="text-onolo-gray text-sm">Open from 7 am to 10 pm</span>
          </div>
          <button
            onClick={() => navigate('/order')}
            className="w-full bg-onolo-orange hover:bg-onolo-orange-dark text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Ask for a delivery
          </button>
        </div>

        {/* Welcome Section */}
        <div className="text-center mb-8">
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
        </div>

        {/* Fuel Type Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Select Fuel Type</h2>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => handleFuelTypeSelect('diesel')}
              className="flex flex-col items-center space-y-2 opacity-50 hover:opacity-75 transition-opacity"
            >
              <div className="w-16 h-16 bg-onolo-dark-lighter rounded-2xl flex items-center justify-center">
                ⛽
              </div>
              <span className="text-onolo-gray text-sm">Diesel</span>
            </button>
            <button
              onClick={() => handleFuelTypeSelect('gas')}
              className="flex flex-col items-center space-y-2"
            >
              <div className="w-16 h-16 bg-onolo-orange rounded-2xl flex items-center justify-center">
                🔥
              </div>
              <span className="text-white text-sm font-semibold">Gas</span>
            </button>
            <button
              onClick={() => handleFuelTypeSelect('petrol')}
              className="flex flex-col items-center space-y-2 opacity-50 hover:opacity-75 transition-opacity"
            >
              <div className="w-16 h-16 bg-onolo-dark-lighter rounded-2xl flex items-center justify-center">
                ⛽
              </div>
              <span className="text-onolo-gray text-sm">Petrol</span>
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-8">
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

        {/* Contact Modal */}
        {showContactModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-onolo-dark-lighter rounded-2xl p-6 max-w-sm w-full">
              <h3 className="text-xl font-bold mb-4">Contact for Diesel/Petrol</h3>
              <p className="text-onolo-gray mb-6">
                For diesel and petrol orders, please contact us directly:
              </p>
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-onolo-orange" />
                  <span>+27 11 464 5073</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-onolo-orange" />
                  <span>info@onologroup.com</span>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 bg-onolo-gray hover:bg-onolo-gray/80 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => navigate('/menu')}
                  className="flex-1 bg-onolo-orange hover:bg-onolo-orange-dark text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Contact Info
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
