
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  size: string;
  description: string;
  price: number;
  icon: string;
}

const products: Product[] = [
  {
    id: '9kg',
    name: '9 Kg LP Gas Bottle REFILL',
    size: '9kg',
    description: "Small knee height bottle used for braai's, stoves & heaters. REFILL ONLY!",
    price: 344.00,
    icon: '🔥'
  },
  {
    id: '19kg',
    name: '19 Kg LP Gas Bottle REFILL',
    size: '19kg',
    description: "Mid sized bottle used for braai's, stoves, heaters and small gas water heaters. REFILL ONLY!",
    price: 727.00,
    icon: '🔥'
  },
  {
    id: '48kg',
    name: '48 Kg LP Gas Bottle REFILL',
    size: '48kg',
    description: "Large bottle used for commercial applications, large gas water heaters and industrial use. REFILL ONLY!",
    price: 1855.00,
    icon: '🔥'
  }
];

const Order = () => {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState('johannesburg');

  const handleAddToCart = (product: Product) => {
    // Add to cart logic here
    console.log('Added to cart:', product);
    navigate('/cart');
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
          <button className="w-full bg-onolo-orange hover:bg-onolo-orange-dark text-white font-semibold py-3 px-6 rounded-xl transition-colors">
            Ask for a delivery
          </button>
        </div>

        {/* Fuel Type Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Select Fuel Type</h2>
          <div className="flex justify-center space-x-4">
            <div className="flex flex-col items-center space-y-2 opacity-50">
              <div className="w-16 h-16 bg-onolo-dark-lighter rounded-2xl flex items-center justify-center">
                ⛽
              </div>
              <span className="text-onolo-gray text-sm">Diesel</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-onolo-orange rounded-2xl flex items-center justify-center">
                🔥
              </div>
              <span className="text-white text-sm font-semibold">Gas</span>
            </div>
            <div className="flex flex-col items-center space-y-2 opacity-50">
              <div className="w-16 h-16 bg-onolo-dark-lighter rounded-2xl flex items-center justify-center">
                ⛽
              </div>
              <span className="text-onolo-gray text-sm">Petrol</span>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Select Your Gas Refill</h2>
          <div className="space-y-6">
            {products.map((product) => (
              <div key={product.id} className="bg-onolo-dark-lighter rounded-2xl p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-12 h-12 bg-onolo-orange rounded-xl flex items-center justify-center text-2xl">
                    {product.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg mb-2">{product.name}</h3>
                    <p className="text-onolo-gray text-sm mb-4 leading-relaxed">
                      {product.description}
                    </p>
                    <p className="text-onolo-orange text-2xl font-bold mb-4">
                      R {product.price.toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-onolo-orange hover:bg-onolo-orange-dark text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;
