
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin, Fuel, Droplet } from 'lucide-react';

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
        <div className="bg-onolo-dark-lighter rounded-2xl p-6 mb-12 border border-gray-700">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-onolo-orange rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-xl">Onolo Gas</h3>
              <p className="text-onolo-gray">Johannesburg, South Africa</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-2 h-2 bg-onolo-orange rounded-full"></div>
            <span className="text-onolo-orange font-medium">Open from 7 am to 10 pm</span>
          </div>
          <button
            onClick={() => navigate('/order')}
            className="w-full bg-onolo-orange hover:bg-onolo-orange-dark text-white font-semibold py-4 px-6 rounded-2xl transition-colors text-lg"
          >
            Ask for a delivery
          </button>
        </div>

        {/* Fuel Type Selection */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-8 text-white">Select Fuel Type</h2>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => handleFuelTypeSelect('diesel')}
              className="flex flex-col items-center space-y-3 p-6 rounded-2xl bg-onolo-dark-lighter opacity-50 hover:opacity-75 transition-opacity border border-gray-700"
            >
              <div className="w-16 h-16 flex items-center justify-center">
                <Fuel className="w-8 h-8 text-onolo-gray" />
              </div>
              <span className="text-onolo-gray font-medium">Diesel</span>
            </button>
            <button
              onClick={() => handleFuelTypeSelect('gas')}
              className="flex flex-col items-center space-y-3 p-6 rounded-2xl bg-onolo-orange hover:bg-onolo-orange-dark transition-colors"
            >
              <div className="w-16 h-16 flex items-center justify-center">
                <Droplet className="w-8 h-8 text-white" />
              </div>
              <span className="text-white font-semibold">Gas</span>
            </button>
            <button
              onClick={() => handleFuelTypeSelect('petrol')}
              className="flex flex-col items-center space-y-3 p-6 rounded-2xl bg-onolo-dark-lighter opacity-50 hover:opacity-75 transition-opacity border border-gray-700"
            >
              <div className="w-16 h-16 flex items-center justify-center">
                <Fuel className="w-8 h-8 text-onolo-gray" />
              </div>
              <span className="text-onolo-gray font-medium">Petrol</span>
            </button>
          </div>
        </div>

        {/* Contact Modal */}
        {showContactModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-onolo-dark-lighter rounded-2xl p-6 max-w-sm w-full border border-gray-700">
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
